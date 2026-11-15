/**
 * The real CAP logo (media/brand/cap-logo-black.png) used as a mask,
 * so it can take any colour via `currentColor`.
 */
export default function Logo({ className = "h-7" }: { className?: string }) {
  const mask = "url(/media/brand/cap-logo-black.png) center / contain no-repeat";
  return (
    <span
      role="img"
      aria-label="CAP"
      className={`inline-block aspect-[337/160] bg-current ${className}`}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
