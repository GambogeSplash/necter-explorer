import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="bg-card border border-border rounded-lg px-10 py-12 text-center max-w-[400px] w-full">
        <img src="/brand/3d/bee-dark.png" alt="" className="w-24 h-auto mx-auto mb-4 opacity-60" />
        <p className="text-[48px] font-semibold text-muted-foreground font-mono leading-none mb-2">404</p>
        <h1 className="text-lg font-semibold mb-2">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">The page you were looking for could not be found.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="inline-flex items-center h-9 px-5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Go to Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}
