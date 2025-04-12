
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NotificationSoundOption {
  id: string;
  name: string;
  file: string;
}

const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  { id: "default", name: "Default", file: "/sounds/notification-default.mp3" },
  { id: "bell", name: "Bell", file: "/sounds/notification-bell.mp3" },
  { id: "chime", name: "Chime", file: "/sounds/notification-chime.mp3" },
  { id: "alert", name: "Alert", file: "/sounds/notification-alert.mp3" },
  { id: "none", name: "None (Silent)", file: "" },
];

interface NotificationSoundCardProps {
  selectedSound: string;
  onSoundChange: (sound: string) => void;
}

export function NotificationSoundCard({ selectedSound, onSoundChange }: NotificationSoundCardProps) {
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  
  // Play the selected sound for preview
  const playSound = (soundId: string) => {
    if (soundId === "none") return;
    
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;
    
    setPlayingSound(soundId);
    
    // Create a dummy Audio object for demo purposes
    // In a real implementation, these sound files would need to exist
    console.log(`Playing sound: ${sound.file}`);
    
    // Simulate sound playing completed
    setTimeout(() => {
      setPlayingSound(null);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Sounds</CardTitle>
        <CardDescription>
          Choose which sound to play when you receive a notification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedSound} onValueChange={onSoundChange}>
          {NOTIFICATION_SOUNDS.map((sound, index) => (
            <React.Fragment key={sound.id}>
              {index > 0 && <Separator className="my-2" />}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={sound.id} id={`sound-${sound.id}`} />
                  <Label htmlFor={`sound-${sound.id}`} className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      {sound.id === "none" ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span>{sound.name}</span>
                    </div>
                  </Label>
                </div>
                {sound.id !== "none" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => playSound(sound.id)} 
                    disabled={playingSound === sound.id}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="h-4 w-4" />
                    <span className="sr-only">Play {sound.name} sound</span>
                  </Button>
                )}
              </div>
            </React.Fragment>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
