import Link from "next/link";
import Accent from "@/components/site/Accent";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bone px-6 text-center text-ink">
      <div>
        <p className="t-label mb-8 text-stone">Error 404</p>
        <h1 className="t-mega">
          Lost the <Accent text="plot." />
        </h1>
        <p className="t-lead mx-auto mt-8 max-w-md text-graphite">This page doesn&apos;t exist — or it moved when we rebuilt the studio.</p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/" className="pill pill-ink">Back home</Link>
          <Link href="/work" className="pill pill-line">See the work</Link>
        </div>
      </div>
    </main>
  );
}
