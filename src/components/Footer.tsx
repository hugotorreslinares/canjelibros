import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="w-full mx-auto max-w-shell px-4 sm:px-10 py-3 flex items-center gap-4 flex-wrap font-sans text-small text-muted-foreground">
        <span>Librocambio · Bogotá</span>
        <Button variant="link" asChild className="px-0">
          <Link href="/politicas">Políticas del sitio</Link>
        </Button>
      </div>
    </footer>
  );
}
