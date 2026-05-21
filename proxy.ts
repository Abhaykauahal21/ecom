import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/search",
  "/cart",
  "/api/webhooks/clerk",
  "/api/products(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/checkout(.*)",
  "/orders(.*)",
  "/profile(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    // Assuming we'll add 'role' to session claims via Clerk dashboard/metadata
    // TEMPORARY: disabled for local testing so you can access /admin and add real data
    // if ((sessionClaims?.metadata as any)?.role !== "ADMIN") {
    //   const url = new URL("/", req.url);
    //   return Response.redirect(url);
    // }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
