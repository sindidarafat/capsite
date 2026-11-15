import Link from "next/link";
import { RiseText } from "./Reveal";

export default function SectionHead({
  index,
  label,
  title,
  link,
  className = "",
}: {
  index?: string;
  label: string;
  title: string;
  link?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={`mb-12 md:mb-20 ${className}`}>
      <div className="mb-6 flex items-center justify-between border-t hairline pt-5">
        <p className="t-label text-stone">
          {index && <span className="mr-3 text-mist">{index}</span>}
          {label}
        </p>
        {link && (
          <Link href={link.href} className="link-u text-sm font-semibold">
            {link.label} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
      <RiseText as="h2" className="t-h1 max-w-[18ch]" text={title} />
    </div>
  );
}
