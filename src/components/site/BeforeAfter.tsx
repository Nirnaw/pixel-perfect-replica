import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImg } from "./SafeImg";

type Pair = { id: string; title: string; alt: string; before_url: string | null; after_url: string | null };

export function BeforeAfterPair({ pair }: { pair: Pair }) {
  return <figure className="rounded-lg border border-border bg-card p-3 shadow-soft">
    <div className="grid grid-cols-2 gap-2">
      {([["قبل", pair.before_url], ["بعد", pair.after_url]] as const).map(([label, src]) => <Dialog.Root key={label}>
        <Dialog.Trigger asChild><Button variant="ghost" aria-label={`نمایش تصویر ${label} ${pair.title}`} className="relative h-auto w-full overflow-hidden rounded-lg p-0">
          <SafeImg src={src ?? undefined} alt={`${label} — ${pair.alt || pair.title}`} className="aspect-square w-full object-cover" />
          <span className="absolute right-2 top-2 rounded-full bg-background/90 px-3 py-0.5 text-sm text-ink">{label}</span>
        </Button></Dialog.Trigger>
        <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-ink/90" /><Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 outline-none">
          <Dialog.Title className="sr-only">{`${label} — ${pair.alt || pair.title}`}</Dialog.Title>
          <Dialog.Close asChild><Button variant="soft" size="icon" aria-label="بستن" className="absolute right-2 top-2 z-10"><X /></Button></Dialog.Close>
          <SafeImg src={src ?? undefined} alt={`${label} — ${pair.alt || pair.title}`} className="max-h-[85vh] w-full rounded-lg object-contain" />
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>)}
    </div>
    {pair.title && <figcaption className="mt-3 text-center text-sm text-muted-foreground">{pair.title}</figcaption>}
  </figure>;
}

export function BeforeAfterEmpty() {
  return <p className="rounded-lg bg-lavender/60 px-6 py-12 text-center text-muted-foreground">نمونه‌کارها به‌زودی در این بخش قرار می‌گیرد</p>;
}