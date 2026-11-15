# media/ — drop your work here

Everything in this folder is served at `/media/...` and shows up in the admin's
file pickers right away. **No rebuild and no restart needed.**

```
media/
├── works/                  ← one folder per showcase project
│   ├── genvote-festival-ifes/
│   ├── election-commission-of-bangladesh/
│   ├── helio-bangladesh-helio-45-helio-55/
│   ├── bongo-mutho-bhore-prem/
│   ├── film-ruher-kafela/
│   └── <new-project-slug>/ ← make a new folder for each new project
├── showreel/               ← homepage showreel video (+ optional poster)
├── team/                   ← portraits (square or 4:5, ~800px)
├── clients/                ← client logos (PNG/SVG, transparent)
├── careers/                ← job circulars, team photo
├── brand/                  ← logo, social share image
└── uploads/                ← default folder for admin uploads
```

## Adding a new showcase work

1. Make a folder: `media/works/<project-slug>/` (lowercase, dashes, e.g. `grameenphone-eid-2026`).
2. Drop in a `cover.jpg` (or `.webp`), the main video (e.g. `film.mp4`) and any extra stills.
3. Admin → **Works** → **＋ New**. Set the slug to match the folder, pick the cover and video
   with **Choose / upload**, fill in the text, switch **Published** on, press **Save & publish**.

## Video tips

- **MP4 (H.264)** plays everywhere. Keep web cuts under ~1080p and ~8 Mbps.
- Hover-preview videos in the grid are muted; short loops of 5–15 seconds work best.
- Very large files (over ~500 MB) are easier to copy straight into the folder than to upload through the browser.
- Use lowercase file names without spaces: `helio-55-reel-01.mp4`.
