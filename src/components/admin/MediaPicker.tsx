"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, formatBytes, uploadFiles, type MediaFile } from "./api";
import { Button, Modal, inputCls, useToast } from "./ui";
import { isVideo } from "@/lib/mime";

export type Accept = "image" | "video" | "any";

const matches = (f: MediaFile, accept: Accept) => {
  if (accept === "any") return true;
  const v = isVideo(f.name);
  if (accept === "video") return v;
  return !v && /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(f.name);
};

export function Thumb({ src, className = "" }: { src: string; className?: string }) {
  if (!src) return <div className={`grid place-items-center bg-sand text-xs text-mist ${className}`}>No file</div>;
  if (isVideo(src)) return <video src={src} muted playsInline preload="metadata" className={`bg-ink object-cover ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={`bg-sand object-cover ${className}`} />;
}

/** Browse /media (incl. files dropped in by hand), upload new ones, and pick. */
export function MediaLibrary({
  accept = "any",
  folder: defaultFolder = "uploads",
  onPick,
  pickLabel = "Use this",
}: {
  accept?: Accept;
  folder?: string;
  onPick?: (f: MediaFile) => void;
  pickLabel?: string;
}) {
  const toast = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [uploadTo, setUploadTo] = useState(defaultFolder);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const d = await api<{ files: MediaFile[]; folders: string[] }>("/api/admin/media");
    setFiles(d.files);
    setFolders(d.folders);
  }, []);
  useEffect(() => {
    load().catch((e) => toast(e.message, "error"));
  }, [load, toast]);

  const shown = useMemo(
    () =>
      files.filter(
        (f) => matches(f, accept) && (folder === "all" || f.folder === folder || f.folder.startsWith(folder + "/")) && f.path.toLowerCase().includes(filter.toLowerCase()),
      ),
    [files, accept, folder, filter],
  );

  async function doUpload(list: FileList | File[]) {
    const arr = Array.from(list);
    if (!arr.length) return;
    try {
      setProgress(0);
      const saved = await uploadFiles(arr, uploadTo, setProgress);
      toast(`Uploaded ${saved.length} file${saved.length > 1 ? "s" : ""} to /media/${uploadTo}`);
      await load();
      if (saved.length === 1 && onPick && matches(saved[0], accept)) onPick(saved[0]);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setProgress(null);
    }
  }

  async function remove(f: MediaFile) {
    if (!confirm(`Delete ${f.path}? Anything using it will show an empty box.`)) return;
    await api(`/api/admin/media?path=${encodeURIComponent(f.path)}`, { method: "DELETE" });
    toast("Deleted");
    load();
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        doUpload(e.dataTransfer.files);
      }}
      className={`rounded-2xl transition ${dragOver ? "outline-2 outline-dashed outline-ink/40" : ""}`}
    >
      <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input className={inputCls} placeholder="Search files…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <select className={inputCls} value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Filter by folder">
          <option value="all">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>/{f}</option>
          ))}
        </select>
        <Button variant="soft" onClick={load}>↻ Refresh</Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-sand/70 p-3 text-sm">
        <span className="font-semibold">Upload to</span>
        <input className={`${inputCls} !w-56 !py-1.5`} value={uploadTo} onChange={(e) => setUploadTo(e.target.value)} aria-label="Upload folder" list="media-folders" />
        <datalist id="media-folders">
          {folders.map((f) => <option key={f} value={f} />)}
        </datalist>
        <input ref={input} type="file" multiple hidden accept={accept === "image" ? "image/*" : accept === "video" ? "video/*" : undefined} onChange={(e) => e.target.files && doUpload(e.target.files)} />
        <Button variant="primary" onClick={() => input.current?.click()} disabled={progress !== null}>
          {progress !== null ? `Uploading ${progress}%` : "＋ Upload files"}
        </Button>
        <span className="text-stone">or drag &amp; drop here</span>
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-stone">No matching files. Upload some, or drop them into the <code>media/</code> folder and press Refresh.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((f) => (
            <li key={f.path} className="group overflow-hidden rounded-xl border border-ink/10 bg-paper">
              <div className="relative aspect-[4/3]">
                <Thumb src={f.url} className="absolute inset-0 h-full w-full" />
                {isVideo(f.name) && <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-bone">VIDEO</span>}
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-semibold" title={f.path}>{f.name}</p>
                <p className="truncate text-[11px] text-stone">/{f.folder} · {formatBytes(f.size)}</p>
                <div className="mt-2 flex gap-1.5">
                  {onPick && (
                    <Button variant="primary" className="!px-3 !py-1 !text-xs" onClick={() => onPick(f)}>{pickLabel}</Button>
                  )}
                  <Button className="!px-3 !py-1 !text-xs" onClick={() => navigator.clipboard.writeText(f.url).then(() => toast("Link copied"))}>Copy</Button>
                  <Button variant="danger" className="!px-2.5 !py-1 !text-xs" onClick={() => remove(f)} aria-label={`Delete ${f.name}`}>✕</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MediaInput({
  value,
  onChange,
  accept = "image",
  folder,
}: {
  value: string;
  onChange: (v: string) => void;
  accept?: Accept;
  folder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-3">
      <button type="button" onClick={() => setOpen(true)} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-ink/12" aria-label="Choose file">
        <Thumb src={value} className="absolute inset-0 h-full w-full" />
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={accept === "video" ? "/media/works/…/film.mp4" : "/media/…"} />
        <div className="flex gap-2">
          <Button variant="soft" className="!py-1.5" onClick={() => setOpen(true)}>Choose / upload</Button>
          {value && <Button className="!py-1.5" onClick={() => onChange("")}>Remove</Button>}
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={accept === "video" ? "Choose a video" : accept === "image" ? "Choose an image" : "Choose a file"} wide>
        <MediaLibrary
          accept={accept}
          folder={folder}
          onPick={(f) => {
            onChange(f.url);
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
