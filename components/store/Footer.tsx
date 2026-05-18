import Link from "next/link";
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tighter text-brand">
                SUPP<span className="text-foreground">STORE</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground">
              Premium quality supplements for elite performance.
              Trusted by athletes worldwide.
            </p>

            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-brand transition-colors"
              >
                <FaInstagram className="h-5 w-5" />
              </Link>

              <Link
                href="#"
                className="text-muted-foreground hover:text-brand transition-colors"
              >
                <FaYoutube className="h-5 w-5" />
              </Link>

              <Link
                href="#"
                className="text-muted-foreground hover:text-brand transition-colors"
              >
                <FaFacebook className="h-5 w-5" />
              </Link>

              <Link
                href="#"
                className="text-muted-foreground hover:text-brand transition-colors"
              >
                <FaTwitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold mb-4">Shop</h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products?category=whey-protein"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  Whey Protein
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=pre-workout"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  Pre-Workout
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=creatine"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  Creatine
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=vitamins"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  Vitamins
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>

              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-brand transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold mb-4">Join the Community</h3>

            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for exclusive deals and fitness tips.
            </p>

            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-brand text-black hover:bg-brand/90 h-9 px-4"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} SUPPSTORE. All rights reserved.
          </p>
        </div>
      </div>

      {/* Mobile Spacer */}
      <div className="h-16 md:hidden" />
    </footer>
  );
}