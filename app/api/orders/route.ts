import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { withRetry } from "@/lib/safe-db";

export async function POST(req: Request) {
  return withRetry(async () => {
    try {
      const razorpay = getRazorpay();
      const { userId } = await auth();

      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { items, addressId, totalAmount } = body;

      if (!items || items.length === 0 || !addressId) {
        return new NextResponse("Missing required fields", { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      // Verify stock and get real prices
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          return new NextResponse(`Product ${product?.name} is out of stock`, {
            status: 400,
          });
        }
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      // Create order in DB
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          addressId,
          totalAmount,
          status: "PENDING",
          paymentId: razorpayOrder.id,
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
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
      });
    } catch (error: any) {
      console.error("[ORDERS_POST]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  });
}
