import Link from "next/link";
import Image from "next/image";

const links = [
  { label: "API Docs", href: "/api-docs" },
  { label: "Settings", href: "/settings" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Status", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-12 relative overflow-hidden">
      <img src="/brand/hero-honeycomb.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none" />
      <div className="relative z-10 max-w-[1480px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/brand/logo.svg" alt="Necter" width={20} height={20} className="opacity-50" />
          <p className="text-sm text-muted-foreground">
            Necter Network &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
