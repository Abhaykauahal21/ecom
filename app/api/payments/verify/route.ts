import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      body;

    const text = razorpayOrderId + "|" + razorpayPaymentId;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (generated_signature === razorpaySignature) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentId: razorpayPaymentId,
        },
        include: {
          orderItems: true,
        },
      });

      // Update stock
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return NextResponse.json({ success: true });
    } else {
      return new NextResponse("Invalid signature", { status: 400 });
    }
  } catch (error: any) {
    console.error("[PAYMENT_VERIFY]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
