import { useState, useCallback } from "react";

export const useChat = (socketRef, roomId, userId, username) => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  const sendMessage = useCallback(
    (e) => {
      e?.preventDefault();
      if (!message.trim()) return;

      socketRef.current?.emit("send_message", {
        roomId,
        userId,
        username,
        message: message.trim(),
      });

      setMessage("");
    },
    [message, socketRef, roomId, userId, username],
  );

  const addMessage = useCallback((msg) => {
    setChat((prev) => [...prev, msg]);
  }, []);

  return {
    chat,
    message,
    setMessage,
    sendMessage,
    addMessage,
    showChat,
    setShowChat,
  };
};
