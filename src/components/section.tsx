import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionProps {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
}

export function Section({ title, action, children, className = "", noBorder }: SectionProps) {
  return (
    <section className={`${noBorder ? "" : "border-t border-border pt-6"} ${className}`}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
