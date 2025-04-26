
// Simple notification sound player
export function playNotificationSound(soundType: string | boolean) {
  if (!soundType || soundType === false) return;
  
  try {
    // Define sound file paths based on type
    const soundMap: Record<string, string> = {
      chime: '/sounds/chime.mp3',
      bell: '/sounds/bell.mp3',
      alert: '/sounds/alert.mp3',
      default: '/sounds/notification.mp3'
    };
    
    // Get sound path or use default
    const soundPath = typeof soundType === 'string' && soundMap[soundType] 
      ? soundMap[soundType] 
      : soundMap.default;
    
    // Create and play audio
    const audio = new Audio(soundPath);
    audio.play().catch(err => {
      console.log("Could not play notification sound:", err);
    });
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
}
