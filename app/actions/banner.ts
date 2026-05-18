"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function createBanner(data: { label: string; imageUrl: string; link?: string; isActive: boolean }) {
  try {
    const banner = await prisma.banner.create({
      data,
    });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, banner };
  } catch (error) {
    console.error("Error creating banner:", error);
    return { success: false, error: "Failed to create banner" };
  }
}

export async function toggleBanner(id: string, isActive: boolean) {
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, banner };
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
