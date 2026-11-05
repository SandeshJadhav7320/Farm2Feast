
import { useState } from "react";

import AIChatButton from "./AIChatButton";
import AIChatWindow from "./AIChatWindow";

export default function AIChatAssistant() {

  // Controls whether the chat window is visible
  const [isOpen, setIsOpen] = useState(false);

  // Opens or closes the chat window
  const toggleChat = () => {
    setIsOpen((previous) => !previous);
  };

  // Closes the chat window
  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={isOpen ? "block" : "hidden"}>
        <AIChatWindow onClose={closeChat} />
      </div>

      <AIChatButton
        isOpen={isOpen}
        onClick={toggleChat}
      />
    </>
  );
}
