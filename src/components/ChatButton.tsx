import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "./ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatButtonProps {
  specialistId: string;
  specialistName: string;
  specialistAvatar: string;
}

export default function ChatButton({
  specialistId,
  specialistName,
  specialistAvatar,
}: ChatButtonProps) {
  const { user, isPremium } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const openChat = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para chatear");
      return;
    }

    if (!isPremium) {
      toast.error("El chat está disponible solo para usuarios Premium");
      return;
    }

    // Check if conversation exists
    const { data: existingConv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("specialist_id", specialistId)
      .single();

    if (existingConv) {
      setConversationId(existingConv.id);
      setIsOpen(true);
      return;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        specialist_id: specialistId,
        specialist_name: specialistName,
      })
      .select()
      .single();

    if (error) {
      toast.error("Error al iniciar chat");
      console.error(error);
      return;
    }

    setConversationId(newConv.id);
    setIsOpen(true);
    
    // Create notification for new chat
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Chat iniciado",
      message: `Chat con ${specialistName} iniciado`,
      type: "chat",
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openChat}
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Chat
      </Button>

      {isOpen && conversationId && (
        <ChatWindow
          conversationId={conversationId}
          specialistName={specialistName}
          specialistAvatar={specialistAvatar}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
