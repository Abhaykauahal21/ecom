import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { withRetry } from "@/lib/safe-db";

export async function POST(req: Request) {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const { items, addressId, totalAmount } = body;

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

      // Verify stock and get real prices
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Product ${product?.name || item.name || 'Unknown'} is out of stock or unavailable` 
          }, { status: 400 });
        }
      }

      // Create Razorpay order (use dummy if no keys exist for testing)
      let razorpayOrderId = `dummy_order_${Date.now()}`;
      let razorpayAmount = Math.round(totalAmount * 100);

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
          totalAmount,
          status: "PENDING",
          paymentId: razorpayOrderId,
          orderItems: {
            create: items.map((item: any) => ({
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
