// Central gameplay/dev configuration.
// Defaults keep the recovery build focused on a stable solo driving baseline.

const DEFAULT_CONFIG = {
  enableAi: false,
  enableCountdown: false,
  enablePodium: false,
  enableVoiceBoost: true,
  enableEffects: false,
  trackMode: 'test',
};

function readBoolParam(params, key, fallback) {
  const value = params.get(key);
  if (value === null) return fallback;
  return value === '1' || value === 'true' || value === 'yes';
}

function readTrackMode(params, fallback) {
  const value = params.get('track');
  return value === 'official' || value === 'test' ? value : fallback;
}

export function getGameConfig() {
  const params = new URLSearchParams(window.location.search);

  return {
    enableAi: readBoolParam(params, 'ai', DEFAULT_CONFIG.enableAi),
    enableCountdown: readBoolParam(params, 'countdown', DEFAULT_CONFIG.enableCountdown),
    enablePodium: readBoolParam(params, 'podium', DEFAULT_CONFIG.enablePodium),
    enableVoiceBoost: readBoolParam(params, 'voice', DEFAULT_CONFIG.enableVoiceBoost),
    enableEffects: readBoolParam(params, 'effects', DEFAULT_CONFIG.enableEffects),
    trackMode: readTrackMode(params, DEFAULT_CONFIG.trackMode),
  };
}
