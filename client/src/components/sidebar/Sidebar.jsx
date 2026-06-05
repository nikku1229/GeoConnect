import { useState } from "react";
import AddPinModal from "./AddPinModal/AddPinModal";
import LeftToggleIcon from "../../assets/LeftToggleIcon.svg";
import RightToggleIcon from "../../assets/RightToggleIcon.svg";
import LeftArrowIcon from "../../assets/LeftArrowIcon.svg";
import PinIcon from "../../assets/PinIcon.svg";
import SearchIcon from "../../assets/SearchIcon.svg";

const Sidebar = ({
  onAddPin,
  onEnableMapPickMode,
  onDeletePin,
  pins = [],
  onSearchLocation,
  searchResult,
  searchDistance,
  isSearching,
  onClearSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSidebarFeatures, setShowSidebarFeatures] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    await onSearchLocation(searchQuery);
    setSearchLoading(false);
  };

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

      case "search":
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
              <h3>Search Location</h3>
              <p>Find any place and see distance</p>
            </div>

            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search city, place, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className="secondary-btn"
                onClick={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>

            {isSearching && (
              <div className="searching-indicator">
                <span>🔍 Searching for location...</span>
              </div>
            )}

            {searchResult && (
              <div className="search-result-info">
                <div className="result-header">
                  <span>
                    Shared by:{" "}
                    <strong>
                      {searchResult.searchedBy || searchResult.username}
                    </strong>
                  </span>
                  {(searchResult.searchedBy || searchResult.username) ===
                    localStorage.getItem("username") && (
                    <button className="clear-btn" onClick={onClearSearch}>
                      Clear
                    </button>
                  )}
                </div>
                <div className="result-location">
                  <p>{searchResult.location.name.split(",")[0]}</p>
                </div>
                {searchDistance && (
                  <div className="result-distance">
                    Distance from you: <strong>{searchDistance} km</strong>
                  </div>
                )}
                <div className="result-note">
                  This location will disappear after 1 minute
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <ul>
            <li onClick={() => setShowSidebarFeatures("comment")}>
              <img src={PinIcon} alt="Add" />
              Add Comment
            </li>
            <li onClick={() => setShowSidebarFeatures("search")}>
              <img src={SearchIcon} alt="Search" />
              Search Location
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
        sidebarToggle={() => setIsOpen(false)}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddPin={onAddPin}
        onEnableMapPickMode={onEnableMapPickMode}
      />
    </>
  );
};

export default Sidebar;
