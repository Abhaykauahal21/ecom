"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getShippingConfig() {
  try {
    let config = await prisma.shippingConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      // Create default config if it doesn't exist
      config = await prisma.shippingConfig.create({
        data: {
          id: "default",
          shippingCharge: 99.00,
          freeShippingThreshold: 500.00,
        },
      });
    }

    return {
      success: true,
      config: {
        shippingCharge: Number(config.shippingCharge),
        freeShippingThreshold: Number(config.freeShippingThreshold),
      },
    };
  } catch (error) {
    console.error("Error fetching shipping config:", error);
    // Return default values as fallback so storefront doesn't break
    return {
      success: true,
      config: {
        shippingCharge: 99,
        freeShippingThreshold: 500,
      },
    };
  }
}

export async function updateShippingConfig(data: { shippingCharge: number; freeShippingThreshold: number }) {
  try {
    const config = await prisma.shippingConfig.upsert({
      where: { id: "default" },
      update: {
        shippingCharge: data.shippingCharge,
        freeShippingThreshold: data.freeShippingThreshold,
      },
      create: {
        id: "default",
        shippingCharge: data.shippingCharge,
        freeShippingThreshold: data.freeShippingThreshold,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    revalidatePath("/cart");
    revalidatePath("/");

    return {
      success: true,
      config: {
        shippingCharge: Number(config.shippingCharge),
        freeShippingThreshold: Number(config.freeShippingThreshold),
      },
    };
  } catch (error) {
    console.error("Error updating shipping config:", error);
    return { success: false, error: "Failed to update shipping configuration" };
  }
}
