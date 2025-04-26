
/**
 * Play notification sound based on the sound name
 * @param sound - The sound name to play
 */
export const playNotificationSound = (sound: string): Promise<void> => {
  let audioPath;
  
  switch (sound) {
    case 'chime':
      audioPath = '/sounds/chime.mp3';
      break;
    case 'bell':
      audioPath = '/sounds/bell.mp3';
      break;
    case 'ping':
      audioPath = '/sounds/ping.mp3';
      break;
    case 'pop':
      audioPath = '/sounds/pop.mp3';
      break;
    default:
      audioPath = '/sounds/chime.mp3';
  }
  
  // Log that we're trying to play a sound, useful for debugging
  console.log(`Attempting to play notification sound: ${sound}`);
  
  // Create and play the audio
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.5; // Set volume to 50%
      
      audio.onended = () => {
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('Error playing notification sound:', error);
        reject(error);
      };
      
      // Play the sound
      const playPromise = audio.play();
      
      // Modern browsers return a promise from audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented
          // Show a UI element to let the user manually start playback
          console.warn('Audio playback was prevented by the browser:', error);
          resolve(); // Resolve anyway to prevent hanging
        });
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      reject(error);
    }
  });
};

/**
 * Check if notification sounds are supported in the current browser
 * @returns Boolean indicating whether notification sounds are supported
 */
export const areNotificationSoundsSupported = (): boolean => {
  return typeof Audio !== 'undefined';
};
