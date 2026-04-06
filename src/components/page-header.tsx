"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { ShareButton } from "@/components/share-button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, children }: PageHeaderProps) {
  return (
    <div className="space-y-3 pb-2">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <ShareButton />
        </div>
      </div>
      {children}
    </div>
  );
}
