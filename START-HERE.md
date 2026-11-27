# START HERE (for the user)
1. Open a new Claude Code chat. Attach this zip (or the folder).
2. Paste your prompt (see `prompt_for_zip_folder_claude_code_v2.docx`) or write: **"Read MASTER-PROMPT.md and start."**
3. Claude installs everything by itself, then asks ONLY for your script and voiceover. Give both; Claude recommends a subtitle style in one line, builds the video, checks it, and sends the final mp4 (voice only) + the SFX list with start time and length of every sound + the updated pack zip.
4. SFX: make the sounds from the list yourself, name them sfx-01.wav, sfx-02.wav ..., send them back with "SFX siap" (or run `tools/termux/sfx-remix.sh`). No re-render is needed.
5. Rendering: GitHub Actions + Termux is the fast path. See `PANDUAN-RENDER-GITHUB-TERMUX.md`.
6. Say what to change; Claude re-renders only the changed scenes. Download every file Claude gives you (the cloud box is temporary).
