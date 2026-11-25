
import { useState } from "react";

import AdminAIChatButton from "./AdminAIChatButton";
import AdminAIChatWindow from "./AdminAIChatWindow";

export default function AdminAIChatAssistant() {

  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen((previous) => !previous);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <AdminAIChatWindow onClose={closeChat} />
      )}

      <AdminAIChatButton
        isOpen={isOpen}
        onClick={toggleChat}
      />
    </>
  );
}
