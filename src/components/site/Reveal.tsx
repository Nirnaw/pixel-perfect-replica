import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-visible={visible} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 className="text-2xl md:text-3xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}

export function PageHeader({ title, text }: { title: string; text?: string }) {
  return (
    <section className="bg-lavender/60">
      <div className="container-page py-14 md:py-20">
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {text && <p className="mt-3 max-w-2xl text-muted-foreground">{text}</p>}
      </div>
    </section>
  );
}
