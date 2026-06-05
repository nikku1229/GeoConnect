import LeftArrowIcon from "../../assets/LeftArrowIcon.svg";
import OutIcon from "../../assets/OutIcon.svg";
import { useToast } from "../../context/ToastContext";

const RoomControls = ({
  roomId,
  roomPass,
  isCreator,
  users,
  onBack,
  onLeave,
}) => {
  const { showToast } = useToast();
  const onlineCount = Object.values(users).filter((u) => u?.online).length;
  const totalCount = Object.keys(users).length;

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showToast("Room ID copied!");
  };

  return (
    <>
      <div className="room-blocks top-left">
        <button onClick={onBack} className="primary-btn">
          <img src={LeftArrowIcon} alt="Back" />
        </button>
        <div className="room-id" onClick={copyRoomId}>
          {roomId}
          <br />
          <small>{isCreator ? `Pass: ${roomPass}` : ""}</small>
        </div>
      </div>

      <div className="room-blocks top-right">
        <div className="detail">
          <div className="indicator"></div>
          {onlineCount}/{totalCount} online
        </div>
        <button onClick={onLeave} className="primary-btn">
          <img src={OutIcon} alt="Leave" />
        </button>
      </div>
    </>
  );
};

export default RoomControls;
