
// Map of sound names to their file paths
const soundMap: Record<string, string> = {
  default: '/sounds/notification-default.mp3',
  subtle: '/sounds/notification-subtle.mp3',
  alert: '/sounds/notification-alert.mp3',
  success: '/sounds/notification-success.mp3',
};

// Create audio elements for each sound
const audioElements: Record<string, HTMLAudioElement> = {};

// Initialize audio elements when in browser environment
if (typeof window !== 'undefined') {
  Object.entries(soundMap).forEach(([name, path]) => {
    try {
      const audio = new Audio(path);
      audio.volume = 0.5;
      audioElements[name] = audio;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  });
}

/**
 * Play a notification sound
 * @param soundName The name of the sound to play (default, subtle, alert, success)
 * @returns Promise that resolves when the sound has played
 */
export const playNotificationSound = async (soundName = 'default'): Promise<void> => {
  const audio = audioElements[soundName] || audioElements.default;
  
  if (!audio) {
    console.warn('Notification sound not available:', soundName);
    return Promise.resolve();
  }
  
  try {
    // Reset the audio to the beginning in case it was already playing
    audio.currentTime = 0;
    return audio.play();
  } catch (error) {
    console.error('Error playing notification sound:', error);
    return Promise.resolve();
  }
};
