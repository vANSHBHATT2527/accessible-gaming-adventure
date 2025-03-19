
// Haptic feedback functionality
let vibrationEnabled = true;
let vibrationIntensity = 1; // Scale factor for vibration duration

// Check if vibration is supported
export const isVibrationSupported = (): boolean => {
  return 'vibrate' in navigator;
};

// Trigger a haptic feedback
export const triggerHaptics = (durationMs = 40) => {
  if (!vibrationEnabled || !isVibrationSupported()) {
    return false;
  }
  
  try {
    // Apply intensity factor to duration
    const scaledDuration = Math.round(durationMs * vibrationIntensity);
    navigator.vibrate(scaledDuration);
    return true;
  } catch (error) {
    console.error('Error triggering haptic feedback:', error);
    return false;
  }
};

// Enable or disable vibration
export const setVibrationEnabled = (enabled: boolean) => {
  vibrationEnabled = enabled;
  localStorage.setItem('vibrationEnabled', enabled ? 'true' : 'false');
  return true;
};

// Set vibration intensity (0.5 to 2)
export const setVibrationIntensity = (intensity: number) => {
  if (intensity >= 0.5 && intensity <= 2) {
    vibrationIntensity = intensity;
    localStorage.setItem('vibrationIntensity', intensity.toString());
    return true;
  }
  return false;
};

// Get current vibration state
export const isVibrationEnabled = () => {
  return vibrationEnabled;
};

// Get current intensity
export const getVibrationIntensity = () => {
  return vibrationIntensity;
};

// Load saved settings on init
export const loadVibrationSettings = () => {
  const savedEnabled = localStorage.getItem('vibrationEnabled');
  if (savedEnabled !== null) {
    vibrationEnabled = savedEnabled === 'true';
  }
  
  const savedIntensity = localStorage.getItem('vibrationIntensity');
  if (savedIntensity !== null) {
    const intensity = parseFloat(savedIntensity);
    if (!isNaN(intensity) && intensity >= 0.5 && intensity <= 2) {
      vibrationIntensity = intensity;
    }
  }
};
