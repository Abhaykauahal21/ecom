"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
      { folder: "ecommerce_banners" },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

export async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, banners };
  } catch (error) {
    console.error("Error fetching banners:", error);
    return { success: false, error: "Failed to fetch banners" };
  }
}

export async function createBanner(formData: FormData) {
  try {
    const label = formData.get("label") as string;
    const link = formData.get("link") as string || undefined;
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
    
    let imageUrl = formData.get("imageUrl") as string;
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      imageUrl = await uploadToCloudinary(imageFile);
    }

    if (!label || !imageUrl) {
      return { success: false, error: "Label and Image (URL or file) are required" };
    }

    const banner = await prisma.banner.create({
      data: {
        label,
        imageUrl,
        link,
        isActive,
      },
    });
    
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return { success: false, error: error.message || "Failed to create banner" };
  }
}

export async function toggleBanner(id: string, isActive: boolean) {
  try {
    await prisma.banner.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling banner:", error);
    return { success: false, error: "Failed to toggle banner" };
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({
      where: { id },
    });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting banner:", error);
    return { success: false, error: "Failed to delete banner" };
  }
}
