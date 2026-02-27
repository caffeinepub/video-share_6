import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-body">
          <span className="font-display tracking-wider text-foreground/60">
            VIDSTREAM
          </span>
          <span className="text-border">·</span>
          <span>© 2026</span>
        </div>
        <div className="flex items-center gap-1.5 font-body">
          <span>Built with</span>
          <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
          <span>using</span>
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:opacity-80 transition-opacity font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
