
// This is a utility file for playing notification sounds

// Audio cache to prevent reloading the same sound
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Play a notification sound
 * @param sound The sound identifier
 * @returns Promise that resolves when the sound is played
 */
export const playNotificationSound = (sound: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (sound === 'none') {
      resolve();
      return;
    }

    try {
      // In a real implementation, these paths would point to actual sound files
      const soundMap: Record<string, string> = {
        'default': '/sounds/notification-default.mp3',
        'bell': '/sounds/notification-bell.mp3',
        'chime': '/sounds/notification-chime.mp3',
        'alert': '/sounds/notification-alert.mp3',
      };

      const soundPath = soundMap[sound] || soundMap.default;

      // Check if we have a cached audio instance
      if (!audioCache[sound]) {
        audioCache[sound] = new Audio(soundPath);
      }

      const audio = audioCache[sound];
      
      // Reset the audio to the beginning if it's already played
      audio.currentTime = 0;
      
      // Play the sound
      audio.play()
        .then(() => resolve())
        .catch(err => {
          console.warn('Unable to play notification sound:', err);
          resolve(); // Resolve anyway to not block the notification flow
        });

      // Cleanup listeners
      audio.onended = () => resolve();
      audio.onerror = () => {
        console.warn('Error playing notification sound');
        resolve();  // Resolve anyway to not block the notification flow
      };
    } catch (error) {
      console.warn('Error initializing notification sound:', error);
      resolve();  // Resolve anyway to not block the notification flow
    }
  });
};

/**
 * Preload sounds for faster playback
 */
export const preloadNotificationSounds = (): void => {
  const sounds = ['default', 'bell', 'chime', 'alert'];
  
  sounds.forEach(sound => {
    try {
      const soundMap: Record<string, string> = {
        'default': '/sounds/notification-default.mp3',
        'bell': '/sounds/notification-bell.mp3',
        'chime': '/sounds/notification-chime.mp3',
        'alert': '/sounds/notification-alert.mp3',
      };

      const audio = new Audio(soundMap[sound]);
      audio.preload = 'auto';
      audioCache[sound] = audio;
    } catch (error) {
      console.warn(`Failed to preload sound: ${sound}`, error);
    }
  });
};
