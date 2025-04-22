
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChatTypeSelectorProps {
  onValueChange: (value: "direct" | "group") => void;
}

export const ChatTypeSelector = ({ onValueChange }: ChatTypeSelectorProps) => {
  return (
    <TabsList className="w-full">
      <TabsTrigger value="direct" className="flex-1">Direct Message</TabsTrigger>
      <TabsTrigger value="group" className="flex-1">Group Chat</TabsTrigger>
    </TabsList>
  );
};
