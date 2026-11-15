# CAP — website

The website for **CAP (Content Analytics Production Ltd.)**, a creative agency in Niketon, Dhaka, with a built-in admin panel to edit everything.

- **Public site:** Home, Work (+ case studies), Services, About, Team, Careers (+ job pages), Contact (4-step brief form + FAQ), Meet the crew (3D), Privacy, Terms
- **Admin panel** at `/admin`: works, team, careers, services, every piece of site text, a media library, contact-form inquiries, and users with roles
- Built with Next.js 15, Tailwind CSS 4, Motion, Lenis and three.js

---

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:3000. The admin panel is at http://localhost:3000/admin.

**Sign in:** the admin account is `cap.dhk@gmail.com`. The sign-in email is fixed; only the password can
change (Admin → **Change password**). Forgot it? Use **Forgot password?** on the sign-in page to get a
reset link by email (needs the `SMTP_*` settings below). As a last resort, on the server run:

```bash
npm run admin -- cap.dhk@gmail.com "new-long-password" "Owner"
```

**The admin is hidden from the official site.** On www.cap.direct, `/admin` answers "page not found".
It only opens on the address(es) in `ADMIN_HOSTS` (e.g. `admin.cap.direct`). Locally it opens on
this computer and your Wi-Fi network.

## Roles

| Role       | Can do |
|------------|--------|
| **Admin**  | Everything: edit all content and media, read inquiries, **add and remove users, change roles** |
| **Editor** | Edit all content (works, team, careers, services, site text), upload media, read inquiries |

Add people under **Admin → Users & roles**.

## Where things live

```
content/          Website content as JSON. The admin edits these files.
  site.json         company info, homepage text, about, FAQ, legal
  works.json        showcase projects / case studies
  team.json         team members
  services.json     the 3 service lines and 17 services
  jobs.json         careers
media/            All images and videos, served at /media/…
                  Drop files here at any time (see media/README.md)
data/             Private: admin users, inquiries, automatic backups
                  (never committed, never publicly served)
src/              Code
```

Every save in the admin keeps the previous version in `data/backups/` (the last 30 per collection).

## Deploying

The admin writes to disk (`content/`, `media/`, `data/`), so host the site on a **Node.js server
with a persistent disk**: a VPS (DigitalOcean, Hetzner, AWS Lightsail), Railway or Render with a
volume, or a cPanel host with Node.js support.

> Serverless hosts like Vercel and Netlify **won't work for the admin** without changes, because
> their file system resets on every deploy.

```bash
npm ci
npm run build
NODE_ENV=production npm start   # serves on port 3000 (set PORT to change)
```

Set these on the server (see `.env.example`):

- `AUTH_SECRET`: a long random string (**required**)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: used once, for the first sign-in
- `ADMIN_HOSTS=admin.cap.direct` (**required for the admin to open in production**) and
  `ADMIN_URL=https://admin.cap.direct`. Point the `admin` subdomain at the same server.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`: for "Forgot password" emails.
  With Gmail: turn on 2-Step Verification, create an App Password and use it as `SMTP_PASS`.
- `NEXT_PUBLIC_SITE_URL=https://www.cap.direct`
- Optional: `CONTENT_DIR`, `DATA_DIR`, `MEDIA_DIR` to keep data outside the app folder,
  so redeploys never touch uploaded work

Put it behind Nginx or Caddy for HTTPS. If you upload big videos through the browser, raise the
proxy's upload limit, e.g. `client_max_body_size 1024M;` in Nginx.

**Back up `content/`, `media/` and `data/`.** Together they are the whole website.

Old cap.direct links (`/cases/...`, `/contacts`) redirect to the new pages automatically.
