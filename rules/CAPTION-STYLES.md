# CAPTION STYLES (recommended per video, never asked)
Four styles exist. The style is stored in `engine/public/caption-style.json` as `{"style":"classic"}` and read by `Captions` in `engine/src/Main.tsx` (no scene code changes needed). All styles are word-synced (timings from words.json), live in the lower third (y ~ 69%), white text with black stroke, and never overlap the key action.

| style | look | words on screen | best for |
|---|---|---|---|
| classic (default, locked quality bar) | white 900-weight, 88 px, black stroke, pop-in | 1-2 | facts, history, business, most scripts |
| highlight | same as classic, the word being spoken turns yellow `#FFE600` | 1-2 | fast delivery, many numbers/names, scam/hustle/"what if" stories |
| minimal | white 800-weight, 58 px, thin stroke, soft fade-in | 3-4 | calm, educational, science, long sentences |
| impact | white 900-weight, 124 px, UPPERCASE, heavy stroke, strong pop | 1 | hype, drama, shock, war/horror, very short sentences |

## Procedure (non-blocking)
1. After `prep_voice.py`, run `python3 tools/caption_reco.py` (uses words.json + script.json). It returns `style`, `why`, `stats`.
2. Write `{"style":"<style>"}` to `engine/public/caption-style.json`.
3. Tell the user in ONE line, in the user's language, e.g. "Rekomendasi subtitle: Highlight (kata yang diucapkan berwarna kuning) karena narasinya cepat dan banyak angka. Balas 'subtitle: classic/highlight/minimal/impact' kalau mau ganti." Do NOT wait for an answer; build immediately.
4. If the user replies with another style later: change only `caption-style.json`, re-render (captions affect all scenes) and mention it costs a full render.
5. Mention the recommendation in the delivery message too (which style was used).

## Hygiene
Caption area is y 850-1000 of 1280. Keep nothing important there. `minimal` can run 2 lines: keep the subject in the upper 65%. If a custom style is ever needed (user asks), add it to `Captions` in Main.tsx and to this table; never remove the four above.
