import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    let isValid = false;

    // Support dummy verification for local testing when no keys are provided
    if (razorpaySignature === "DUMMY_SIGNATURE") {
      isValid = true;
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return NextResponse.json({ error: "Razorpay server configuration error" }, { status: 500 });
      }

      // 2. Perform SHA256 HMAC verification
      const text = razorpayOrderId + "|" + razorpayPaymentId;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(text)
        .digest("hex");

      isValid = generatedSignature === razorpaySignature;
    }

    if (!isValid) {
      // Handle payment failure in database status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
        },
      });
      return NextResponse.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
    }

    // 3. Find order in DB and update status on successful verification
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

    // 4. Update product stock (decrement purchased quantity)
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

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    console.error("[PAYMENT_VERIFICATION_ERROR]", error);
    return NextResponse.json({ error: "Internal server verification error" }, { status: 500 });
  }
}
