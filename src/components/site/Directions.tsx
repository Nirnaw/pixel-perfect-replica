import { ChevronDown, Navigation } from "lucide-react";
import type { SiteSettings } from "@/lib/content";
import { clinicDirections } from "@/lib/map-links";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Directions({ clinic, dropdown = false, size = "default" }: {
  clinic: SiteSettings["clinic"];
  dropdown?: boolean;
  size?: "default" | "xl";
}) {
  const links = clinicDirections(clinic);
  if (dropdown) {
    return <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="max-w-full whitespace-nowrap">
          <Navigation />مسیریابی تا کلینیک<ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-[calc(100vw-2rem)]" aria-label="گزینه‌های مسیریابی">
        {links.map((link) => <DropdownMenuItem key={link.href} asChild>
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="py-3"><Navigation />{link.label}</a>
        </DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>;
  }
  return <>{links.map((link) => <Button key={link.href} asChild variant="hero" size={size}>
    <a href={link.href} target="_blank" rel="noopener noreferrer"><Navigation />{link.label}</a>
  </Button>)}</>;
}