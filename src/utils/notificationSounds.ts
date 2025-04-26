
export function playNotificationSound(sound: string) {
  try {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.play().catch(err => {
      console.error("Error playing notification sound:", err);
    });
  } catch (e) {
    console.error("Error creating Audio object:", e);
  }
}
