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
      { folder: "ecommerce_categories" },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

export async function getCategories() {
  return withRetry(async () => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      });
      return { success: true, categories: JSON.parse(JSON.stringify(categories)) };
    } catch (error: any) {
      console.error("[GET_CATEGORIES]", error);
      return { success: false, error: error.message || "Failed to fetch categories" };
    }
  });
}

export async function createCategory(formData: FormData) {
  return withRetry(async () => {
    try {
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      const imageFile = formData.get("imageFile") as File | null;
      let imageUrl = formData.get("imageUrl") as string | null;

      if (!name || !slug) {
        return { success: false, error: "Name and Slug are required" };
      }

      // Handle image upload if a file was provided
      if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
        try {
          imageUrl = await uploadToCloudinary(imageFile);
        } catch (uploadErr) {
          console.error("Cloudinary upload failed for category:", uploadErr);
          return { success: false, error: "Failed to upload image to Cloudinary" };
        }
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          image: imageUrl || null,
        },
      });

      revalidatePath("/");
      revalidatePath("/admin/categories");
      return { success: true, category };
    } catch (error: any) {
      console.error("[CREATE_CATEGORY]", error);
      return { success: false, error: error.message || "Failed to create category" };
    }
  });
}

export async function updateCategory(id: string, formData: FormData) {
  return withRetry(async () => {
    try {
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      const imageFile = formData.get("imageFile") as File | null;
      let imageUrl = formData.get("imageUrl") as string | null;

      if (!name || !slug) {
        return { success: false, error: "Name and Slug are required" };
      }

      // Handle image upload if a file was provided
      if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
        try {
          imageUrl = await uploadToCloudinary(imageFile);
        } catch (uploadErr) {
          console.error("Cloudinary upload failed for category:", uploadErr);
          return { success: false, error: "Failed to upload image to Cloudinary" };
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          image: imageUrl || null,
        },
      });

      revalidatePath("/");
      revalidatePath("/admin/categories");
      return { success: true, category };
    } catch (error: any) {
      console.error("[UPDATE_CATEGORY]", error);
      return { success: false, error: error.message || "Failed to update category" };
    }
  });
}

export async function deleteCategory(id: string, moveProductsToId?: string) {
  return withRetry(async () => {
    try {
      if (moveProductsToId) {
        // Move products to the selected category first
        await prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: moveProductsToId },
        });
      }

      // Check if products exist in this category
      const productCount = await prisma.product.count({
        where: { categoryId: id },
      });

      if (productCount > 0) {
        return { success: false, error: `Cannot delete category because it contains ${productCount} product(s).` };
      }

      await prisma.category.delete({
        where: { id },
      });

      revalidatePath("/");
      revalidatePath("/admin/categories");
      return { success: true };
    } catch (error: any) {
      console.error("[DELETE_CATEGORY]", error);
      return { success: false, error: error.message || "Failed to delete category" };
    }
  });
}
