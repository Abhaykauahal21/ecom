import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { withRetry } from "@/lib/safe-db";
import { getProductPrices } from "@/lib/pricing";

export async function POST(req: Request) {
  return withRetry(async () => {
    try {
      // 1. Authenticate user
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
      }

      const body = await req.json();
      const { items, addressId, totalAmount, promoCode, paymentMethod } = body;

      if (!items || items.length === 0 || !addressId) {
        return NextResponse.json({ error: "Missing required fields: items or addressId" }, { status: 400 });
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com";

      // 2. Fetch/Upsert user in DB
      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {},
        create: {
          clerkId: clerkUser.id,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ""}` : "Guest User",
          email: email,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // 3. Fetch Shipping Config
      let shippingCharge = 99.00;
      let freeShippingThreshold = 500.00;

      try {
        const config = await prisma.shippingConfig.findUnique({
          where: { id: "default" },
        });
        if (config) {
          shippingCharge = Number(config.shippingCharge);
          freeShippingThreshold = Number(config.freeShippingThreshold);
        }
      } catch (error) {
        console.error("Error loading shipping config:", error);
      }

      // 4. Validate stock & recalculate amounts (prevents client-side price tampering)
      let calculatedSubtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { sale: true },
        });

        if (!product) {
          return NextResponse.json({ error: `Product not found: ${item.name || 'Unknown'}` }, { status: 400 });
        }

        if (product.stock < item.quantity) {
          return NextResponse.json({
            error: `Product "${product.name}" has only ${product.stock} items remaining. Please adjust your cart.`
          }, { status: 400 });
        }

        const prices = getProductPrices(product as any);
        calculatedSubtotal += prices.price * item.quantity;

        verifiedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: prices.price,
        });
      }

      // 5. Apply Promo Code
      let discountPercent = 0;
      if (promoCode) {
        const activeSale = await prisma.sale.findFirst({
          where: { isActive: true },
        });

        if (activeSale) {
          const activeCode = activeSale.name.toUpperCase().replace(/\s+/g, "");
          if (promoCode.trim().toUpperCase() === activeCode) {
            discountPercent = activeSale.discountPercent;
          }
        }

        // Fallback "SUMMER"
        if (promoCode.trim().toUpperCase() === "SUMMER" && discountPercent === 0) {
          discountPercent = 10;
        }
      }

      const discountAmount = Math.round(calculatedSubtotal * (discountPercent / 100));
      const discountedSubtotal = calculatedSubtotal - discountAmount;
      const calculatedShipping = discountedSubtotal >= freeShippingThreshold ? 0 : shippingCharge;
      const calculatedTotal = discountedSubtotal + calculatedShipping;

      // Handle COD orders
      if (paymentMethod === "COD") {
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            addressId,
            totalAmount: calculatedTotal,
            shippingCost: calculatedShipping,
            discountAmount: discountAmount,
            discountCode: promoCode || null,
            paymentMethod: "COD",
            status: "CONFIRMED",
            paymentStatus: "UNPAID",
            orderItems: {
              create: verifiedItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });

        // Decrement stock
        for (const item of verifiedItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return NextResponse.json({
          id: order.id,
          paymentMethod: "COD",
        });
      }

      // 6. Create Razorpay order (or fallback to dummy for development if keys are not set)
      let razorpayOrderId = `dummy_order_${Date.now()}`;
      const razorpayAmount = Math.round(calculatedTotal * 100); // Amount in paisa/cents

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (keyId && keySecret) {
        try {
          const razorpay = getRazorpay();
          const rzpOrder = await razorpay.orders.create({
            amount: razorpayAmount,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
          });
          razorpayOrderId = rzpOrder.id;
        } catch (rzpError: any) {
          console.error("Razorpay order creation failed:", rzpError);
          return NextResponse.json({ error: "Failed to initialize payment gateway" }, { status: 500 });
        }
      } else {
        console.warn("Razorpay API credentials not configured. Using dummy_order ID.");
      }

      // 7. Store order details in database with status PENDING
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          addressId,
          totalAmount: calculatedTotal,
          shippingCost: calculatedShipping,
          discountAmount: discountAmount,
          discountCode: promoCode || null,
          paymentMethod: "ONLINE",
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentId: razorpayOrderId, // initially saved as the razorpay order id, updated on verification
          orderItems: {
            create: verifiedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      return NextResponse.json({
        id: order.id,
        razorpayOrderId: razorpayOrderId,
        amount: razorpayAmount,
        keyId: keyId || null,
      });

    } catch (error: any) {
      console.error("[CREATE_PAYMENT_ORDER_ERROR]", error);
      return NextResponse.json({ error: "Server error occurred while creating order" }, { status: 500 });
    }
  });
}
