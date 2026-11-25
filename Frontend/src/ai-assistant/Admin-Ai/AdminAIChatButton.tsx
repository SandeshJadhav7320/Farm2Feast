
import { MessageCircle, X, Sparkles } from "lucide-react";

interface AdminAIChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function AdminAIChatButton({
  isOpen,
  onClick,
}: AdminAIChatButtonProps) {

  return (
    <button
      onClick={onClick}
      aria-label={
        isOpen ? "Close Admin AI" : "Open Admin AI"
      }
      className="
        fixed bottom-6 right-6 z-50
        flex h-14 w-14 items-center justify-center
        rounded-full bg-green-700 text-white
        shadow-xl transition-all duration-300
        hover:scale-110 hover:bg-green-800
      "
    >
      {isOpen ? (
        <X size={26} />
      ) : (
        <Sparkles size={26} />
      )}
    </button>
  );
}
