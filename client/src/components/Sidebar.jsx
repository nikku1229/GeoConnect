import { useState } from "react";
import AddPinModal from "./AddPinModal";
import LeftToggleIcon from "../assets/LeftToggleIcon.svg";
import LeftArrowIcon from "../assets/LeftArrowIcon.svg";
import RightToggleIcon from "../assets/RightToggleIcon.svg";
import PinIcon from "../assets/PinIcon.svg";

const Sidebar = ({ onAddPin, onEnableMapPickMode, onDeletePin, pins = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSidebarFeatures, setShowSidebarFeatures] = useState("");

  const fetchSidebar = () => {
    switch (showSidebarFeatures) {
      case "comment":
        return (
          <div className="comment-container">
            <div className="map-pin-header">
              <div className="backbtn">
                <img
                  src={LeftArrowIcon}
                  alt="Back"
                  onClick={() => setShowSidebarFeatures("")}
                />
              </div>
              <h3>Comment Pins</h3>
              <p>
                {pins.length} pin{pins.length !== 1 ? "s" : ""} placed
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={() => setShowModal(true)}
            >
              Add New Pin
            </button>
            <div className="pins-list">
              {pins.length === 0 ? (
                <p className="no-pins">
                  No pins yet. Click "Add New Pin" to get started!
                </p>
              ) : (
                pins.map((pin) => (
                  <div
                    key={pin._id}
                    className="pin-item"
                    onDoubleClick={() => onDeletePin(pin._id)}
                  >
                    <div className="pin-avatar">
                      {pin.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="pin-details">
                      <div className="pin-user">
                        {pin.userName}
                        {pin.userId === localStorage.getItem("userId") && (
                          <span className="pin-own-badge">You</span>
                        )}
                      </div>
                      <div className="pin-comment">{pin.comment}</div>
                      {pin.locationName && (
                        <div className="pin-location">
                          {pin.locationName.substring(0, 50)}
                        </div>
                      )}
                      <div className="pin-time">
                        {new Date(pin.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <ul>
            <li onClick={() => setShowSidebarFeatures("comment")}>
              <img src={PinIcon} alt="Add" />
              Add Comment
            </li>
          </ul>
        );
    }
  };

  return (
    <>
      <div className={`sidebar-toggle-container ${isOpen ? "open" : "close"}`}>
        <button className="primary-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <>
              <img src={LeftToggleIcon} alt="Close" />
            </>
          ) : (
            <>
              <img src={RightToggleIcon} alt="Open" />
            </>
          )}
        </button>
      </div>
      <div className={`sidebar-container ${isOpen ? "open" : "close"}`}>
        {fetchSidebar()}
      </div>

      <AddPinModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddPin={onAddPin}
        onEnableMapPickMode={onEnableMapPickMode}
      />
    </>
  );
};

export default Sidebar;
