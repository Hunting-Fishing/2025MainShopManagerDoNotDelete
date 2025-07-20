
// Utility for playing notification sounds
export const playNotificationSound = (soundType: string) => {
  try {
    // Create audio context for better browser support
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Generate different tones for different sound types
    const frequency = getSoundFrequency(soundType);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Set volume and duration
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
  } catch (error) {
    console.log('Audio playback not supported or failed:', error);
    // Fallback to system beep if available
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }
};

const getSoundFrequency = (soundType: string): number => {
  switch (soundType) {
    case 'bell':
      return 800;
    case 'chime':
      return 600;
    case 'alert':
      return 1000;
    case 'default':
    default:
      return 440; // A4 note
  }
};

// Utility to capitalize strings
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
