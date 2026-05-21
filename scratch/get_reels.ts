import prisma from "@/lib/prisma";

export async function getAllInstagramReels() {
  return await prisma.instagramReel.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// For quick test: run this file with tsx or node (after build)
if (require.main === module) {
  getAllInstagramReels().then(reels => {
    console.log(reels);
    process.exit(0);
  });
}
