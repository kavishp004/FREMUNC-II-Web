# FREMUNC II — Conference Website

Website for **FREMUNC II**, the second annual Model United Nations conference hosted by
**Irvington High School** (Fremont, California), September 2026.

A static site — plain HTML, CSS, and vanilla JavaScript, **no build step, no dependencies** —
built to be hosted for free on GitHub Pages.

## Pages
| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About Us |
| `logistics.html` | Logistics |
| `position-paper-guide.html` | Position Paper Guide |
| `committees.html` | Committees |

- `css/styles.css` — the single shared stylesheet (design tokens live in `:root`)
- `js/main.js` — all interactions (nav, animations, timeline, countdown, filters…)
- `assets/` — logo and photos

## Local preview
```bash
python3 -m http.server 8000
```
Then open <http://localhost:8000>.

## Deploy (GitHub Pages)
Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.

## Editing content
Placeholders are marked `TBD` throughout (grep for them). Key things to fill in:
committee names/topics/difficulty, secretariat members and letters, registration link,
exact dates, and the road-to-conference milestone dates in `js/main.js`
(`TIMELINE_MILESTONES`).
