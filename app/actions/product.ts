"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateSlug, normalizeName } from "@/lib/db-utils";
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
      { folder: "ecommerce_products" },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

/**
 * Validation Schema for Product Creation
 */
const ProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  categoryName: z.string().min(2, "Category name is required"),
  brand: z.string().min(2, "Brand name is required"),
  images: z.array(z.string().url("Invalid image URL")).max(4, "Maximum 4 images allowed").optional().default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ProductFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * Optimized Server Action for Product Creation.
 * Removed transaction wrapper to improve reliability with Neon's connection pooler.
 */
export async function createProduct(formData: FormData): Promise<ProductFormState> {
  try {
    // 1. Data Extraction & Image Uploads
    const textImages = formData.getAll("images").filter(url => typeof url === "string" && url.trim() !== "") as string[];
    const fileImages = formData.getAll("imageFiles").filter(file => file instanceof File && file.size > 0 && file.name !== "undefined") as File[];
    
    // Upload files to Cloudinary
    const uploadedUrls = await Promise.all(fileImages.map(file => uploadToCloudinary(file)));
    const allImages = [...textImages, ...uploadedUrls];

    const rawData = {
      name: normalizeName(formData.get("name") as string),
      slug: formData.get("slug") as string || generateSlug(formData.get("name") as string),
      description: formData.get("description") as string,
      price: formData.get("price"),
      comparePrice: formData.get("comparePrice") || null,
      stock: formData.get("stock"),
      categoryName: normalizeName(formData.get("category") as string),
      brand: normalizeName(formData.get("brand") as string),
      images: allImages,
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
    };

    // 2. Validation
    const validatedFields = ProductSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check the form fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;
    const categorySlug = generateSlug(data.categoryName);

    // 3. Sequential Database Operations with Retry
    const result = await withRetry(async () => {
      // Optimized Category Lookup using Unique Slug
      let category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: data.categoryName,
            slug: categorySlug,
          },
        });
      }

      // Create Product
      return await prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          comparePrice: data.comparePrice,
          stock: data.stock,
          brand: data.brand,
          categoryId: category.id,
          images: data.images,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
        },
      });
    });

    console.log(`[ADMIN] Product created successfully: ${result.id}`);

    // 4. Cache Invalidation
    revalidatePath("/admin/products");
    revalidatePath("/(store)");

    return {
      success: true,
      message: "Product created successfully!",
    };
  } catch (error: any) {
    console.error("DETAILED_DB_ERROR:", error);

    // Handle Prisma Specific Errors
    if (error.code === 'P2002') {
      return {
        success: false,
        message: "A product with this slug already exists. Please choose a different slug.",
      };
    }

    if (error.code === 'P1001' || error.code === 'P2028' || error.name === 'PrismaClientInitializationError') {
      return {
        success: false,
        message: "Database connection busy or timed out. Please try again in a few seconds.",
      };
    }

    return {
      success: false,
      message: error.message || "An unexpected database error occurred.",
    };
  }
}

/**
 * Server Action for Product Update.
 */
export async function updateProduct(id: string, formData: FormData): Promise<ProductFormState> {
  try {
    // 1. Data Extraction & Image Uploads
    const textImages = formData.getAll("images").filter(url => typeof url === "string" && url.trim() !== "") as string[];
    const fileImages = formData.getAll("imageFiles").filter(file => file instanceof File && file.size > 0 && file.name !== "undefined") as File[];
    
    // Upload files to Cloudinary
    const uploadedUrls = await Promise.all(fileImages.map(file => uploadToCloudinary(file)));
    const allImages = [...textImages, ...uploadedUrls];

    const rawData = {
      name: normalizeName(formData.get("name") as string),
      slug: formData.get("slug") as string || generateSlug(formData.get("name") as string),
      description: formData.get("description") as string,
      price: formData.get("price"),
      comparePrice: formData.get("comparePrice") || null,
      stock: formData.get("stock"),
      categoryName: normalizeName(formData.get("category") as string),
      brand: normalizeName(formData.get("brand") as string),
      images: allImages,
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
    };

    // 2. Validation
    const validatedFields = ProductSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check the form fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;
    const categorySlug = generateSlug(data.categoryName);

    // 3. Sequential Database Operations with Retry
    const result = await withRetry(async () => {
      // Optimized Category Lookup using Unique Slug
      let category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: data.categoryName,
            slug: categorySlug,
          },
        });
      }

      // Update Product
      return await prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          comparePrice: data.comparePrice,
          stock: data.stock,
          brand: data.brand,
          categoryId: category.id,
          images: data.images,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
        },
      });
    });

    console.log(`[ADMIN] Product updated successfully: ${result.id}`);

    // 4. Cache Invalidation
    revalidatePath("/admin/products");
    revalidatePath("/(store)");
    revalidatePath(`/products/${result.slug}`);

    return {
      success: true,
      message: "Product updated successfully!",
    };
  } catch (error: any) {
    console.error("DETAILED_DB_ERROR:", error);

    // Handle Prisma Specific Errors
    if (error.code === 'P2002') {
      return {
        success: false,
        message: "A product with this slug already exists. Please choose a different slug.",
      };
    }

    if (error.code === 'P1001' || error.code === 'P2028' || error.name === 'PrismaClientInitializationError') {
      return {
        success: false,
        message: "Database connection busy or timed out. Please try again in a few seconds.",
      };
    }

    return {
      success: false,
      message: error.message || "An unexpected database error occurred.",
    };
  }
}
