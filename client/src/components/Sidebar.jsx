import { useState } from "react";
import AddPinModal from "./AddPinModal";

const Sidebar = ({ onAddPin, onEnableMapPickMode, pins = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>📍 Map Pins</h3>
          <p>
            {pins.length} pin{pins.length !== 1 ? "s" : ""} placed
          </p>
        </div>

        <div className="sidebar-content">
          <button
            className="secondary-btn add-pin-btn"
            onClick={() => setShowModal(true)}
          >
            <span>📍</span>
            Add New Pin
          </button>

          <div className="pins-list">
            {pins.length === 0 ? (
              <p className="no-pins">
                No pins yet. Click "Add New Pin" to get started!
              </p>
            ) : (
              pins.map((pin) => (
                <div key={pin._id} className="pin-item">
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
                    <div className="pin-comment">💬 {pin.comment}</div>
                    {pin.locationName && (
                      <div className="pin-location">
                        📍 {pin.locationName.substring(0, 50)}
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
