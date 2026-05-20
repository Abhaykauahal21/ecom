"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withRetry } from "@/lib/safe-db";

export async function getUserProfile() {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return { success: false, error: "Not logged in" };
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com";

      // Fetch or create user in our DB
      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {},
        create: {
          clerkId: clerkUser.id,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : "Valued Customer",
          email: email,
        },
        include: {
          addresses: {
            orderBy: { createdAt: "desc" }
          },
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              orderItems: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      return {
        success: true,
        user: {
          ...user,
          orders: user.orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount),
            shippingCost: Number(order.shippingCost),
            orderItems: order.orderItems.map(item => ({
              ...item,
              price: Number(item.price),
              product: {
                ...item.product,
                price: Number(item.product.price)
              }
            }))
          }))
        }
      };
    } catch (error: any) {
      console.error("[GET_USER_PROFILE]", error);
      return { success: false, error: error.message || "Failed to load user profile" };
    }
  });
}

export async function updateUserProfile(data: { name: string; phone: string }) {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return { success: false, error: "Unauthorized" };
      }

      const user = await prisma.user.update({
        where: { clerkId: clerkUser.id },
        data: {
          name: data.name,
          phone: data.phone,
        },
      });

      revalidatePath("/profile");
      return { success: true, user };
    } catch (error: any) {
      console.error("[UPDATE_USER_PROFILE]", error);
      return { success: false, error: error.message || "Failed to update profile details" };
    }
  });
}

export async function deleteUserAddress(addressId: string) {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return { success: false, error: "Unauthorized" };
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check if address belongs to user
      const address = await prisma.address.findFirst({
        where: { id: addressId, userId: user.id },
      });

      if (!address) {
        return { success: false, error: "Address not found or unauthorized" };
      }

      await prisma.address.delete({
        where: { id: addressId },
      });

      // If we deleted the default address, make the next latest address default
      if (address.isDefault) {
        const nextLatest = await prisma.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });

        if (nextLatest) {
          await prisma.address.update({
            where: { id: nextLatest.id },
            data: { isDefault: true },
          });
        }
      }

      revalidatePath("/profile");
      revalidatePath("/checkout");
      return { success: true };
    } catch (error: any) {
      console.error("[DELETE_USER_ADDRESS]", error);
      return { success: false, error: error.message || "Failed to delete address" };
    }
  });
}

export async function setUserDefaultAddress(addressId: string) {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return { success: false, error: "Unauthorized" };
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      await prisma.$transaction(async (tx) => {
        // Set all user addresses to isDefault: false
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });

        // Set selected address to isDefault: true
        await tx.address.update({
          where: { id: addressId },
          data: { isDefault: true },
        });
      });

      revalidatePath("/profile");
      revalidatePath("/checkout");
      return { success: true };
    } catch (error: any) {
      console.error("[SET_DEFAULT_ADDRESS]", error);
      return { success: false, error: error.message || "Failed to update default address" };
    }
  });
}

export async function updateUserAddress(
  addressId: string,
  data: {
    name: string;
    phone: string;
    email?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }
) {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return { success: false, error: "Unauthorized" };
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check if address belongs to user
      const existingAddress = await prisma.address.findFirst({
        where: { id: addressId, userId: user.id },
      });

      if (!existingAddress) {
        return { success: false, error: "Address not found or unauthorized" };
      }

      await prisma.$transaction(async (tx) => {
        if (data.isDefault) {
          // Reset other defaults
          await tx.address.updateMany({
            where: { userId: user.id },
            data: { isDefault: false },
          });
        }

        await tx.address.update({
          where: { id: addressId },
          data: {
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            line1: data.line1,
            line2: data.line2 || null,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            isDefault: data.isDefault || existingAddress.isDefault,
          },
        });
      });

      revalidatePath("/profile");
      revalidatePath("/checkout");
      return { success: true };
    } catch (error: any) {
      console.error("[UPDATE_USER_ADDRESS]", error);
      return { success: false, error: error.message || "Failed to update address details" };
    }
  });
}
