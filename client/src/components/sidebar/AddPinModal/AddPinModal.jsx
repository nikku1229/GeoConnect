import { useState, useEffect } from "react";
import CloseIcon from "../../../assets/CloseIcon.svg";
import LocationSearch from "./LocationSearch";

const AddPinModal = ({
  sidebarToggle,
  isOpen,
  onClose,
  onAddPin,
  onEnableMapPickMode,
}) => {
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingComment, setPendingComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setLocation(null);
      setError("");
      setSearchMode(false);
      setPendingComment("");
    }
  }, [isOpen]);

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setError("");
  };

  const handleSubmit = async () => {
    if (!comment?.trim()) {
      setError("Please enter a comment to pin");
      return;
    }
    if (!location) {
      setError("Please select a location from search");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onAddPin({
        comment: comment.trim(),
        latitude: location.lat,
        longitude: location.lng,
        locationName: location.name || "",
      });
      setComment("");
      setLocation(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add pin");
    } finally {
      setLoading(false);
    }
  };

  const handlePickOnMap = () => {
    sidebarToggle();
    if (!comment.trim()) {
      setError("Please enter a comment first before picking on map");
      return;
    }
    setPendingComment(comment.trim());
    onClose();
    onEnableMapPickMode(comment.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Pin</h3>
          <div className="modal-close" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </div>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="field">
            <label>Comment / Message</label>
            <textarea
              placeholder="e.g., Meet me here, This is the spot, etc."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <small>{comment.length}/200</small>
          </div>

          <div className="location-mode-toggle">
            <button
              className={`primary-btn ${searchMode ? "active" : ""}`}
              onClick={() => setSearchMode(!searchMode)}
            >
              Search Location
            </button>
            <button
              className={`primary-btn ${!searchMode ? "active" : ""}`}
              onClick={handlePickOnMap}
            >
              Pick on Map
            </button>
          </div>

          {searchMode && (
            <div className="search-field">
              <label>Search Location</label>
              <LocationSearch onSelect={handleLocationSelect} />
              {location && (
                <div className="selected-location">
                  <span>Selected:</span> {location.name.substring(0, 100)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="primary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="secondary-btn" onClick={handleSubmit}>
            {loading ? "Adding..." : "Add Pin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPinModal;
