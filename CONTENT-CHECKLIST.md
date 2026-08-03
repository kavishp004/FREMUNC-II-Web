# FREMUNC — What's Still Missing

Last updated after the August content drop. Organized by page.

---

## Home Page

- **Shriya Surana's letter** — the actual text (Secretary-General)
- **Sonia Puri's letter** — the actual text (Secretary-General)
- **Portrait photos** for both — drop them in `assets/` and swap the placeholder block
  (the exact `<img>` line is in an HTML comment right above each placeholder)

---

## Committees Page

**All five committees now have:** name, topic, type, level, and the full names of both chairs.

Still needed:

- **Committee descriptions** — all five say "Committee description coming soon." One
  paragraph each.
- **Background guide links** — all five buttons are disabled and read "Background Guide — TBA".
  Paste each link and remove `aria-disabled`/`tabindex` to switch the button on.
- **Contact email per committee** — all five show TBD.
- **Abbreviations** are no longer shown on the cards — the badge was removed by request.
  UNHRC and UNOOSA are still in the code if you want them folded into the committee names.

### Please confirm these two readings

- **UNOOSA** — you wrote "ANOOSA". I read it as UNOOSA (UN Office for Outer Space Affairs),
  which matches the lunar-resources topic. Say the word and I'll change it back.
- **"Atomic Bomb"** — you wrote "Atomic Bob"; treated as a typo.

---

## Logistics Page

Still needed:

- **Registration form link** — the button reads "Form opens August 11" and is disabled until
  you paste the URL.
- **School / delegation rate** — only the per-delegate fees are set.
- **Is lunch provided?** — the 1:00–1:45 PM break is on the schedule, but not whether food is
  provided or delegates bring their own.
- **Parking / drop-off / directions** — still TBD.
- **Contact email** — TBD here and in the FAQ.
- **Venue facts** — parking, check-in entrance, and accessibility are each TBD.

---

## About Page

The secretariat is now four people, four across: **Shriya Surana** and **Sonia Puri**
(Secretary-General), **Matthew Miu** and **Yumna Zainab** (Director-General).

- **Short bio** for each of the four — all say "Bio coming soon."
- **Portrait photo** for each — each card has the exact `<img>` line ready in a comment
  (`assets/shriya.jpg`, `assets/sonia.jpg`, `assets/matthew.jpg`, `assets/yumna.jpg`).

---

## Position Paper Guide Page

- **The guide itself.** The page is a "coming soon" empty state. The original layout
  (what a position paper is, formatting, structure, research tips, deadline, sample) is
  preserved in an HTML comment on that page.

---

## Site-wide

- **Conference email address** — replaces "Contact — TBD" in the footer of all five pages.
- **`EST. 2022` vs "fourth annual".** The hero label reads "EST. 2022 · FOURTH ANNUAL".
  Counting 2022 as the first year makes 2026 the *fifth*. This is fine if 2022 is when the
  club was founded rather than the first conference — just confirm which you mean.

---

## Already set

- **Date: October 3, 2026**, 8:15 AM – 5:30 PM (hero, info bar, logistics, countdown, timeline)
- **Full day-of schedule** — all 10 blocks from check-in to closing
- **Dress code** — full guidance including what to avoid
- **Registration windows and fees** — Early Aug 11–29 at $22 ($20 Irvington students);
  General Aug 30–Sep 19 at $25; closes Sep 19
- **Timeline milestones** — all five now carry real dates
- **Five committees** with topics, types, and both chairs' full names
- **Venue** — Irvington High School, Fremont, CA (with map)
- **Instagram** — instagram.com/irvingtonmun
- **Hero photo slideshow** — five photos from last year
