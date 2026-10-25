import { useState, type ImgHTMLAttributes } from "react";

/** Image that shows a soft lavender clinic-mark block when missing or broken. */
export function SafeImg({ src, alt, className = "", ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-lavender ${className}`}>
        <span dir="ltr" className="text-2xl font-bold tracking-[0.3em] text-lavender-deep">P</span>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} {...rest} />;
}

export function Initials({ name, className = "" }: { name: string; className?: string }) {
  const parts = name.replace(/^دکتر\s+/, "").trim().split(/\s+/);
  const ini = parts.slice(0, 2).map((p) => p[0]).join("‌");
  return (
    <div aria-hidden className={`flex items-center justify-center bg-lavender text-2xl font-bold text-primary ${className}`}>
      {ini}
    </div>
  );
}
