# QUALITY CHECKLIST (run on stills before showing; fix and re-check)
Physics: [ ] every character's feet touch a surface, shadow present [ ] no foot sliding (walk phase = distance) [ ] jumps/throws follow arcs with anticipation/landing squash [ ] nothing passes through walls/props [ ] doors open away, hand reaches handle first [ ] carried objects stay attached to hands
Continuity: [ ] no teleport/morph/pop-in without cause [ ] exits/entries via openings [ ] the same character looks the same across scenes
Camera: [ ] no unwanted shake [ ] subject framed in the upper 65% (captions own the lower third) [ ] no clipping into props/lens [ ] each move has a reason
Environment: [ ] 15-20 props, textures, depth layers, light [ ] colour world differs from the previous scene
Captions/sync: [ ] style = caption-style.json, words per line match the style, readable, correct text [ ] key visual on its spoken word frame [ ] length = audio
Sound: [ ] SFX sparse and quiet, voice dominant, no SFX on every word
Final: [ ] 1-fps contact sheet of the exported mp4 viewed [ ] duration/streams verified (h264 720x1280 30 fps + aac) [ ] files delivered to the user
SFX list: [ ] sfx-prompts.md exists, each event has start s + length s + prompt [ ] < 8 per 20 s [ ] no WARN from sfx_plan.py [ ] delivered mp4 is voice-only
Render: [ ] stitched frames = ceil(voice s * 30) [ ] video length = voice length [ ] -silent.mp4 kept
