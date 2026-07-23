# Design Dynamo — site

Static site. No build step: what's in this folder is what gets served.

## Structure

```
index.html            homepage
book.html             booking form (noindex)
robots.txt            crawl rules + sitemap pointer
sitemap.xml           update <lastmod> when the homepage changes materially
css/design.css        all styles, both pages
js/design.js          homepage: filmstrip, work showcase, engine, metrics, nav
js/book.js            booking form: validation + submit
assets/               favicon, logo, hero poster
assets/logos/         partner logos
apps-script/Code.gs   Google Sheets backend — NOT part of the site (see below)
```

## Deploying (Render)

Deployed as a Render **Static Site** — not a Web Service. Free Web Services
sleep after 15 minutes idle and take 30-60s to wake, which would undo the
whole point of a 323KB site. Free Static Sites never sleep and sit behind
Render's CDN.

`render.yaml` holds the config. Equivalent dashboard settings:

| Setting | Value |
|---|---|
| Type | Static Site |
| Build Command | *(empty)* |
| Publish Directory | `.` |
| Branch | `main` |

Render redeploys on every push to the deploy branch.

### Custom domain

Add `thedesigndynamo.com` under Settings → Custom Domains, then create the DNS
records Render shows you at your registrar. Typically an `ALIAS`/`ANAME` (or
`CNAME` on `www`) pointing at the Render hostname. TLS is issued automatically
once DNS resolves — allow up to an hour.

Serve the site on **one** hostname and redirect the other. The canonical tag,
`og:url`, sitemap and `robots.txt` all say `https://thedesigndynamo.com/`
(no `www`), so make the bare domain the primary and redirect `www` to it —
otherwise search engines see two copies of the same site.

### Everything in this repo is public

Render publishes the repo root, so **every file here is fetchable** —
`README.md`, `render.yaml`, `.gitignore` and `apps-script/Code.gs` all return
200 on the live site. There is no ignore mechanism for a static site; the only
reliable rule is: if it must stay private, it does not belong in this repo.

That is why `apps-script/Code.gs` carries no spreadsheet ID. Bound to its sheet
via Extensions -> Apps Script, the script reaches it with
`getActiveSpreadsheet()` and needs no ID at all.

The Apps Script `/exec` URL in `js/book.js` is necessarily public — the browser
has to call it. That is safe: it only accepts a POST that appends a row, and
grants no read access to the sheet.

The videos aren't here either — they stream from Cloudinary (cloud
`dfvot5men`), configured at the top of `js/design.js`.

### Verify once live

- **Compression.** Render does gzip/brotli automatically, but confirm it: the
  text assets drop 61-79% (CSS 52KB → 13KB, HTML 37KB → 8KB). Source is
  deliberately unminified — compression makes minifying largely redundant, and
  readable source is easier to maintain.
- **Cache headers** land as set in `render.yaml`.
- **The booking form writes a row** to the sheet from the live domain.

## The booking form

`book.html` posts to a Google Apps Script Web App, which appends a row to the
client-meetings sheet. Setup steps are in the header of `apps-script/Code.gs`.
The endpoint URL lives at the top of `js/book.js`.

After editing `Code.gs`, redeploy as a **new version** — saving alone does not
update the live URL.

## Partner logos

Pre-processed for size: flattened to white + alpha and resized to 120px tall
(3x the largest render size), since CSS renders them as white silhouettes via
`filter: brightness(0) invert(1)`. This took the set from 620KB to 57KB.

If you add a logo, run it through the same treatment, and set `width`/`height`
on the `<img>` to its intrinsic size so it doesn't shift the layout as it loads.
