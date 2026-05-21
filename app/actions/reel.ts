"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withRetry } from "@/lib/safe-db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadVideoToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "instagram_reels",
        resource_type: "video" // Critical for uploading mp4 files
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
}

const ReelSchema = z.object({
  instagramUrl: z.string().url("Invalid URL. Must start with https://"),
  caption: z.string().optional().nullable(),
  likes: z.string().default("1.2k"),
  comments: z.string().default("120"),
  isActive: z.boolean().default(true),
});

export type ReelFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createInstagramReel(formData: FormData): Promise<ReelFormState> {
  try {
    const videoFile = formData.get("videoFile") as File | null;
    const directVideoUrl = formData.get("directVideoUrl") as string | null;

    let videoUrl = directVideoUrl || "";

    // Upload to Cloudinary if file exists
    if (videoFile && videoFile.size > 0 && videoFile.name !== "undefined") {
      videoUrl = await uploadVideoToCloudinary(videoFile);
    }

    if (!videoUrl) {
      return {
        success: false,
        message: "Please upload a video file or provide a direct video URL.",
        errors: { videoFile: ["Video is required"] }
      };
    }

    const rawData = {
      instagramUrl: formData.get("instagramUrl") as string,
      caption: formData.get("caption") as string || null,
      likes: formData.get("likes") as string || "1.2k",
      comments: formData.get("comments") as string || "120",
      isActive: formData.get("isActive") === "on",
    };

    const validatedFields = ReelSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check the fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    await withRetry(async () => {
      return await prisma.instagramReel.create({
        data: {
          videoUrl,
          instagramUrl: data.instagramUrl,
          caption: data.caption,
          likes: data.likes,
          comments: data.comments,
          isActive: data.isActive,
        },
      });
    });

    revalidatePath("/(store)");
    revalidatePath("/admin/reels");

    return {
      success: true,
      message: "Instagram Reel created successfully!",
    };
  } catch (error: any) {
    console.error("[CREATE_REEL_ERROR]", error);
    return {
      success: false,
      message: error.message || "Failed to create Instagram Reel.",
    };
  }
}

export async function updateInstagramReel(id: string, formData: FormData): Promise<ReelFormState> {
  try {
    const videoFile = formData.get("videoFile") as File | null;
    const directVideoUrl = formData.get("directVideoUrl") as string | null;
    let videoUrl = directVideoUrl || "";

    // Upload to Cloudinary if file exists
    if (videoFile && videoFile.size > 0 && videoFile.name !== "undefined") {
      videoUrl = await uploadVideoToCloudinary(videoFile);
    }

    const rawData = {
      instagramUrl: formData.get("instagramUrl") as string,
      caption: formData.get("caption") as string || null,
      likes: formData.get("likes") as string || "1.2k",
      comments: formData.get("comments") as string || "120",
      isActive: formData.get("isActive") === "on",
    };

    const validatedFields = ReelSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check the fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    await withRetry(async () => {
      const updateData: any = {
        instagramUrl: data.instagramUrl,
        caption: data.caption,
        likes: data.likes,
        comments: data.comments,
        isActive: data.isActive,
      };

      if (videoUrl) {
        updateData.videoUrl = videoUrl;
      }

      return await prisma.instagramReel.update({
        where: { id },
        data: updateData,
      });
    });

    revalidatePath("/(store)");
    revalidatePath("/admin/reels");

    return {
      success: true,
      message: "Instagram Reel updated successfully!",
    };
  } catch (error: any) {
    console.error("[UPDATE_REEL_ERROR]", error);
    return {
      success: false,
      message: error.message || "Failed to update Instagram Reel.",
    };
  }
}

export async function deleteInstagramReel(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await withRetry(async () => {
      return await prisma.instagramReel.delete({
        where: { id },
      });
    });

    revalidatePath("/(store)");
    revalidatePath("/admin/reels");

    return {
      success: true,
      message: "Instagram Reel deleted successfully!",
    };
  } catch (error: any) {
    console.error("[DELETE_REEL_ERROR]", error);
    return {
      success: false,
      message: error.message || "Failed to delete Instagram Reel.",
    };
  }
}
