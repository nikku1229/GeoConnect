import UserIcon from "../../assets/UserIcon.svg";
import OutIcon from "../../assets/OutIcon.svg";
import CloseIcon from "../../assets/CloseIcon.svg";

const MembersList = ({
  users,
  creatorId,
  userId,
  showUsers,
  setShowUsers,
  isCreator,
  onKickUser,
}) => {
  if (!showUsers) return null;

  return (
    <div className="room-blocks members-list">
      <div className="member-block-title">
        <h3>Members</h3>
        <strong className="close" onClick={() => setShowUsers(false)}>
          <img src={CloseIcon} alt="close" />
        </strong>
      </div>
      <div className="seperator"></div>
      <div className="member-list">
        {Object.entries(users).map(([id, user]) => (
          <div key={id} className="member">
            <div className="avatar-name">
              <div className="avatar">
                <img src={UserIcon} alt="Img" />
              </div>
              <div className="name">
                {user.name} {id === creatorId && " 👑"}
                {id === userId && " (You)"}{" "}
                <span>{user.online ? "🟢" : "⚪"}</span>
              </div>
            </div>
            {isCreator && id !== userId && (
              <div className="kick" onClick={() => onKickUser(id)}>
                <img src={OutIcon} alt="kick" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;
