"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="bg-card border border-border rounded-lg px-10 py-12 text-center max-w-[400px] w-full">
        <img src="/brand/3d/bee-dark.png" alt="" className="w-24 h-auto mx-auto mb-4 opacity-60" />
        <p className="text-[48px] font-semibold text-muted-foreground font-mono leading-none mb-2">500</p>
        <h1 className="text-lg font-semibold mb-2">Something Went Wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="inline-flex items-center h-9 px-5 rounded-md text-sm font-medium border border-border bg-secondary text-foreground hover:bg-muted transition-colors">
            Try Again
          </button>
          <a href="/" className="inline-flex items-center h-9 px-5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
