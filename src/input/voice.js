// voice.js — Web Speech API listener for "BOOST" voice command.
// Gracefully degrades when SpeechRecognition is unavailable or mic is denied.

export function createVoiceBoost(onBoostFn) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    // Browser doesn't support Web Speech API — return silent no-op.
    return { start() {} };
  }

  const rec = new SR();
  rec.continuous      = true;
  rec.interimResults  = true;
  rec.lang            = 'en-US';

  rec.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const text = e.results[i][0].transcript.toUpperCase();
      if (text.includes('BOOST')) {
        onBoostFn();
      }
    }
  };

  // Chrome stops recognition after silence — auto-restart to stay live.
  rec.onend = () => {
    try { rec.start(); } catch (_) { /* already started */ }
  };

  // Swallow errors — mic permission denied is a graceful no-op.
  rec.onerror = () => {};

  return {
    start() {
      try { rec.start(); } catch (_) {}
    },
  };
}
