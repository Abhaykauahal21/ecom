"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withRetry } from "@/lib/safe-db";

export async function addAddress(data: {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}) {
  return withRetry(async () => {
    try {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        throw new Error("Unauthorized");
      }
      
      const email = clerkUser.emailAddresses[0]?.emailAddress || data.email || "no-email@example.com";

      // Upsert the user into our database to ensure they exist
      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {},
        create: {
          clerkId: clerkUser.id,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}` : data.name,
          email: email,
        },
        select: { id: true }
      });

      const address = await prisma.$transaction(async (tx) => {
        // If this is the first address, make it default
        const addressCount = await tx.address.count({
          where: { userId: user.id },
        });

        const isDefault = addressCount === 0 ? true : data.isDefault || false;

        // If making this default, unset other defaults
        if (isDefault) {
          await tx.address.updateMany({
            where: { userId: user.id },
            data: { isDefault: false },
          });
        }

        return await tx.address.create({
          data: {
            userId: user.id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            line1: data.line1,
            line2: data.line2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            isDefault,
          },
        });
      });

      revalidatePath("/checkout");
      return { success: true, address };
    } catch (error: any) {
      console.error("[ADD_ADDRESS]", error);
      return { success: false, error: error.message };
    }
  });
}

export async function getAddresses() {
  return withRetry(async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return [];
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        return [];
      }

      const addresses = await prisma.address.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          pincode: true,
          isDefault: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return addresses;
    } catch (error) {
      console.error("[GET_ADDRESSES]", error);
      return [];
    }
  });
}
