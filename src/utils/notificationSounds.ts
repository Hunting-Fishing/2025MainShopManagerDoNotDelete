
// Cache for preloaded sounds
const audioCache: Record<string, HTMLAudioElement> = {};

// List of available notification sounds
const NOTIFICATION_SOUNDS = {
  default: '/sounds/notification-default.mp3',
  chime: '/sounds/notification-chime.mp3',
  bell: '/sounds/notification-bell.mp3',
  soft: '/sounds/notification-soft.mp3'
};

/**
 * Preload notification sounds for better performance
 */
export const preloadNotificationSounds = (): void => {
  Object.entries(NOTIFICATION_SOUNDS).forEach(([name, path]) => {
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audioCache[name] = audio;
    } catch (err) {
      console.error(`Failed to preload sound: ${name}`, err);
    }
  });
};

/**
 * Play a notification sound by name
 * @param sound The name of the sound to play
 */
export const playNotificationSound = async (sound: string = 'default'): Promise<void> => {
  if (sound === 'none') return;
  
  try {
    // Use the cached audio if available
    const soundName = NOTIFICATION_SOUNDS[sound as keyof typeof NOTIFICATION_SOUNDS] 
      ? sound 
      : 'default';
    
    let audio = audioCache[soundName];
    
    // Create a new audio instance if not cached
    if (!audio) {
      const soundPath = NOTIFICATION_SOUNDS[soundName as keyof typeof NOTIFICATION_SOUNDS];
      audio = new Audio(soundPath);
      audioCache[soundName] = audio;
    }
    
    // Reset and play
    audio.currentTime = 0;
    await audio.play();
  } catch (err) {
    console.error('Error playing notification sound:', err);
  }
};
