"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withRetry } from "@/lib/safe-db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "ecommerce_sales" },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

export async function getSales() {
  return withRetry(async () => {
    try {
      const sales = await prisma.sale.findMany({
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return { success: true, sales: JSON.parse(JSON.stringify(sales)) };
    } catch (error: any) {
      console.error("[GET_SALES]", error);
      return { success: false, error: error.message || "Failed to fetch sales" };
    }
  });
}

export async function getActiveSale() {
  return withRetry(async () => {
    try {
      const sale = await prisma.sale.findFirst({
        where: { isActive: true },
        include: {
          products: {
            select: {
              id: true,
            },
          },
        },
      });
      return { success: true, sale: sale ? JSON.parse(JSON.stringify(sale)) : null };
    } catch (error: any) {
      console.error("[GET_ACTIVE_SALE]", error);
      return { success: false, error: error.message || "Failed to fetch active sale" };
    }
  });
}

export async function createSale(formData: FormData, productIds: string[]) {
  try {
    const name = formData.get("name") as string;
    const announcementText = formData.get("announcementText") as string;
    const discountPercent = Number(formData.get("discountPercent") || 0);
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    let couponImageUrl = (formData.get("couponImageUrl") as string) || null;
    const couponImageFile = formData.get("couponImageFile") as File | null;

    if (couponImageFile && couponImageFile.size > 0 && couponImageFile.name !== "undefined") {
      couponImageUrl = await uploadToCloudinary(couponImageFile);
    }

    if (!name || !announcementText) {
      return { success: false, error: "Name and Announcement Text are required" };
    }

    const sale = await withRetry(async () => {
      // If setting this sale active, deactivate other sales first
      if (isActive) {
        await prisma.sale.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      // Create new sale
      return await prisma.sale.create({
        data: {
          name,
          announcementText,
          couponImageUrl,
          discountPercent,
          isActive,
          products: {
            connect: productIds.map(id => ({ id })),
          },
        },
      });
    });

    revalidatePath("/admin/sales");
    revalidatePath("/");
    return { success: true, sale };
  } catch (error: any) {
    console.error("[CREATE_SALE]", error);
    return { success: false, error: error.message || "Failed to create sale" };
  }
}

export async function updateSale(id: string, formData: FormData, productIds: string[]) {
  try {
    const name = formData.get("name") as string;
    const announcementText = formData.get("announcementText") as string;
    const discountPercent = Number(formData.get("discountPercent") || 0);
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    let couponImageUrl = (formData.get("couponImageUrl") as string) || null;
    const couponImageFile = formData.get("couponImageFile") as File | null;

    if (couponImageFile && couponImageFile.size > 0 && couponImageFile.name !== "undefined") {
      couponImageUrl = await uploadToCloudinary(couponImageFile);
    }

    if (!name || !announcementText) {
      return { success: false, error: "Name and Announcement Text are required" };
    }

    await withRetry(async () => {
      // If setting this sale active, deactivate other sales first
      if (isActive) {
        await prisma.sale.updateMany({
          where: {
            id: { not: id },
            isActive: true,
          },
          data: { isActive: false },
        });
      }

      // First, disconnect all current products from this sale
      // We do this by updating products that currently point to this sale to set their saleId to null
      await prisma.product.updateMany({
        where: { saleId: id },
        data: { saleId: null },
      });

      // Update sale and connect new products
      return await prisma.sale.update({
        where: { id },
        data: {
          name,
          announcementText,
          couponImageUrl,
          discountPercent,
          isActive,
          products: {
            connect: productIds.map(pid => ({ id: pid })),
          },
        },
      });
    });

    revalidatePath("/admin/sales");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_SALE]", error);
    return { success: false, error: error.message || "Failed to update sale" };
  }
}

export async function toggleSaleActive(id: string, isActive: boolean) {
  try {
    await withRetry(async () => {
      if (isActive) {
        // Deactivate other active sales
        await prisma.sale.updateMany({
          where: { id: { not: id }, isActive: true },
          data: { isActive: false },
        });
      }

      await prisma.sale.update({
        where: { id },
        data: { isActive },
      });
    });

    revalidatePath("/admin/sales");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[TOGGLE_SALE_ACTIVE]", error);
    return { success: false, error: error.message || "Failed to toggle sale active state" };
  }
}

export async function deleteSale(id: string) {
  try {
    await withRetry(async () => {
      // First set product saleIds to null
      await prisma.product.updateMany({
        where: { saleId: id },
        data: { saleId: null },
      });

      await prisma.sale.delete({
        where: { id },
      });
    });

    revalidatePath("/admin/sales");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_SALE]", error);
    return { success: false, error: error.message || "Failed to delete sale" };
  }
}
