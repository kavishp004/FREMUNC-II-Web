# Committee topic art

Drop each committee's cover/topic image in here using the exact filename below.
The card picks it up automatically — no code changes needed.

| Committee            | Filename                  |
|----------------------|---------------------------|
| UNHRC (neurotech)    | `unhrc.png`               |
| UNOOSA (lunar)       | `unoosa.png`              |
| Historical Crisis    | `historical-crisis.png`   |
| Crisis (Avengers)    | `crisis.png`              |
| Specialized (US-Iran)| `specialized.png`         |

Notes
- `.png` or `.jpg` both work, but the filename must match exactly (rename a .jpg
  to .png only if it really is a PNG — otherwise change the src in committees.html).
- Portrait poster art is fine, and so is art with blank margins. The card shows a
  wide 5:2 band cropped from the image. Which part shows is set per committee by
  two values on the card in committees.html:
    --art-zoom : how much to scale the poster (100% = fit the band width)
    --art-y    : how far to slide it up, as a % of the band WIDTH
  Both are proportional to width, so the framing is identical at every screen size.
  Send me a new image and I'll work out its two values.
- A committee with no file here simply renders without art — no gap, no broken image.
