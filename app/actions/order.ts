"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/safe-db";

export async function getOrderById(orderId: string) {
  return withRetry(async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return { success: false, error: "Unauthorized" };
      }

      // Find user in db
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!dbUser) {
        return { success: false, error: "User not found" };
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          address: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return { success: false, error: "Order not found" };
      }

      // Check ownership
      if (order.userId !== dbUser.id) {
        return { success: false, error: "Access denied" };
      }

      // Map decimals to numbers for client safety
      return {
        success: true,
        order: {
          ...order,
          totalAmount: Number(order.totalAmount),
          shippingCost: Number(order.shippingCost),
          orderItems: order.orderItems.map((item) => ({
            ...item,
            price: Number(item.price),
            product: {
              ...item.product,
              price: Number(item.product.price),
            },
          })),
        },
      };
    } catch (error: any) {
      console.error("[GET_ORDER_BY_ID]", error);
      return { success: false, error: error.message || "Failed to fetch order details" };
    }
  });
}

export async function getAdminOrderById(orderId: string) {
  return withRetry(async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return { success: false, error: "Unauthorized" };
      }

      // Here you could perform role checks if admin roles are saved,
      // but standard authentication is used as a baseline.
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          address: true,
          user: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return { success: false, error: "Order not found" };
      }

      return {
        success: true,
        order: {
          ...order,
          totalAmount: Number(order.totalAmount),
          shippingCost: Number(order.shippingCost),
          orderItems: order.orderItems.map((item) => ({
            ...item,
            price: Number(item.price),
            product: {
              ...item.product,
              price: Number(item.product.price),
            },
          })),
        },
      };
    } catch (error: any) {
      console.error("[GET_ADMIN_ORDER_BY_ID]", error);
      return { success: false, error: error.message || "Failed to fetch admin order details" };
    }
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
) {
  return withRetry(async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return { success: false, error: "Unauthorized" };
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });

      return { success: true, order };
    } catch (error: any) {
      console.error("[UPDATE_ORDER_STATUS]", error);
      return { success: false, error: error.message || "Failed to update order status" };
    }
  });
}
