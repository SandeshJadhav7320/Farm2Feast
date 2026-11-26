import { useState } from "react";

import AdminAIChatWindow from "./AdminAIChatWindow";

export default function AdminAIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FLOATING AI BUTTON */}
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-2xl text-white shadow-xl transition hover:scale-110 hover:bg-green-600"
        title="Open Admin AI Assistant"
      >
        🤖
      </button>

      {/* SINGLE CHAT WINDOW */}
      {isOpen && (
        <AdminAIChatWindow
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}