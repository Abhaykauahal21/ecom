import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { withRetry } from "@/lib/safe-db";
import { getProductPrices } from "@/lib/pricing";

export async function POST(req: Request) {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const { items, addressId, totalAmount, promoCode, paymentMethod } = body;

      if (!items || items.length === 0 || !addressId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com";

      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {},
        create: {
          clerkId: clerkUser.id,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}` : "Guest User",
          email: email,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Fetch shipping configuration from DB
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
        console.error("Error loading shipping config for order:", error);
      }

      // Verify stock, get real prices, and calculate subtotal
      let calculatedSubtotal = 0;
      const verifiedItems = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            sale: true,
          },
        });

        if (!product || product.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Product ${product?.name || item.name || 'Unknown'} is out of stock or unavailable` 
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

      // Apply coupon/promo code discount if present
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
              create: verifiedItems.map((item: any) => ({
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

      // Create Razorpay order (use dummy if no keys exist for testing)
      let razorpayOrderId = `dummy_order_${Date.now()}`;
      let razorpayAmount = Math.round(calculatedTotal * 100);

      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const razorpay = getRazorpay();
        const razorpayOrder = await razorpay.orders.create({
          amount: razorpayAmount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });
        razorpayOrderId = razorpayOrder.id;
      }

      // Create order in DB
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
          paymentId: razorpayOrderId,
          orderItems: {
            create: verifiedItems.map((item: any) => ({
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
      });
    } catch (error: any) {
      console.error("[ORDERS_POST]", error);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  });
}
