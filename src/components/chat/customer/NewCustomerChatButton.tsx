
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createCustomerChatRoom } from "@/services/chat/chatCustomerService";
import { useAuthUser } from "@/hooks/useAuthUser";
import { MessagesSquare, Loader2 } from "lucide-react";
import { Customer } from "@/types/customer";

interface NewCustomerChatButtonProps {
  customer: Customer;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const NewCustomerChatButton = ({ 
  customer,
  variant = "outline", 
  size = "sm",
  className = ""
}: NewCustomerChatButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId, userName } = useAuthUser();

  const handleClick = async () => {
    if (!userId || !userName) {
      toast({
        title: "Error",
        description: "You must be logged in to start a chat",
        variant: "destructive"
      });
      return;
    }

    if (!customer?.id) {
      toast({
        title: "Error",
        description: "Customer information is missing",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const chatRoom = await createCustomerChatRoom(customer.id, userId, userName);
      
      if (chatRoom?.id) {
        navigate(`/chat/${chatRoom.id}`);
      } else {
        throw new Error("Failed to create chat room");
      }
    } catch (error) {
      console.error("Error creating customer chat:", error);
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <MessagesSquare className="h-4 w-4 mr-2" />
      )}
      Chat with Customer
    </Button>
  );
};
