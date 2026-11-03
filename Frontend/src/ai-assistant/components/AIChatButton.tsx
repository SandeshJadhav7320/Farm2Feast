
import { MessageCircle, X } from "lucide-react";

interface AIChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function AIChatButton({
  isOpen,
  onClick,
}: AIChatButtonProps) {

  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      className="fixed bottom-6 right-6 z-50
                 flex h-14 w-14 items-center justify-center
                 rounded-full bg-green-700 text-white
                 shadow-lg transition-all duration-300
                 hover:scale-110 hover:bg-green-800"
    >
      {isOpen ? (
        <X size={26} />
      ) : (
        <MessageCircle size={26} />
      )}
    </button>
  );
}
