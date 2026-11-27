Generic SFX tools (style-independent):
- make_sfx.py <outdir>: synth SFX library (no downloads)
Voice prep lives in tools/prep_voice.py (Indonesian-friendly, phrase segments by silence, audio untrimmed). Mix SFX with tools/mix_sfx.py (optional; the GitHub workflow muxes the file named in video.config.json "audio").
