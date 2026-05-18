"use client";

import { usePathname } from "next/navigation";

export default function ProductNotFound() {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <h1 className="text-6xl font-black text-brand mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        We couldn't find a product with the slug: <br/>
        <code className="bg-gray-100 px-2 py-1 rounded text-red-500 font-mono text-sm break-all">
          {decodeURIComponent(slug || "")}
        </code>
      </p>
      <a href="/" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-brand hover:text-black transition-all">
        Back to Home
      </a>
    </div>
  );
}
