// Placeholder wordmark. To swap for the real logo, replace the contents of this
// component with <img src={logoUrl} alt="پردیس" className={className} />.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      dir="ltr"
      aria-label="پردیس"
      className={`relative inline-flex items-center font-sans text-xl font-bold tracking-[0.3em] text-ink ${className}`}
    >
      P
      <span className="relative">
        A
        <span
          aria-hidden
          className="absolute left-[-2px] right-[-2px] top-1/2 h-px -rotate-[28deg] bg-primary"
        />
      </span>
      RDIS
    </span>
  );
}
