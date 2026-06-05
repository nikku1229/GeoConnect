import SendIcon from "../../assets/SendIcon.svg";
import CloseIcon from "../../assets/CloseIcon.svg";

const ChatBox = ({
  chat,
  message,
  setMessage,
  sendMessage,
  showChat,
  setShowChat,
}) => {
  if (!showChat) return null;

  return (
    <div className="room-blocks chats">
      <div className="chat-block-title">
        <h3>Chats</h3>
        <strong className="close" onClick={() => setShowChat(false)}>
          <img src={CloseIcon} alt="close" />
        </strong>
      </div>
      <div className="seperator"></div>
      <div className="chat-messages">
        {chat.map((msg, i) => (
          <div key={i}>
            <p className="username">{msg.username}</p>
            <p className="user-msg">{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="seperator"></div>
      <div className="chat-input">
        <form onSubmit={sendMessage}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
          />
          <button type="submit" className="secondary-btn">
            <img src={SendIcon} alt="send" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
