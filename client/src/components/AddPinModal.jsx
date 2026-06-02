import { useState, useEffect } from "react";

// LocationSearch Component
const LocationSearch = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="location-search">
      <input
        type="text"
        placeholder="Search city, place, address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {loading && <div className="search-loading">Searching...</div>}
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => (
            <li
              key={result.place_id}
              onClick={() => {
                onSelect({
                  lat: parseFloat(result.lat),
                  lng: parseFloat(result.lon),
                  name: result.display_name,
                });
                setQuery("");
                setResults([]);
              }}
            >
              <strong>{result.display_name.split(",")[0]}</strong>
              <br />
              <small>{result.display_name}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Main AddPinModal Component
const AddPinModal = ({ isOpen, onClose, onAddPin, onEnableMapPickMode }) => {
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState(null);
  const [searchMode, setSearchMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingComment, setPendingComment] = useState(""); // Store comment for map pick

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setLocation(null);
      setError("");
      setSearchMode(true);
      setPendingComment("");
    }
  }, [isOpen]);

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setError("");
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Please enter a comment");
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
    if (!comment.trim()) {
      setError("Please enter a comment first before picking on map");
      return;
    }
    // Store comment and enable map pick mode
    setPendingComment(comment.trim());
    onClose();
    if (onEnableMapPickMode) {
      onEnableMapPickMode(comment.trim()); // Pass comment to parent
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📍 Add New Pin</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
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
              className={searchMode ? "active" : ""}
              onClick={() => setSearchMode(true)}
            >
              🔍 Search Location
            </button>
            <button
              className={!searchMode ? "active" : ""}
              onClick={handlePickOnMap}
            >
              📍 Pick on Map
            </button>
          </div>

          {searchMode && (
            <div className="field">
              <label>Search Location</label>
              <LocationSearch onSelect={handleLocationSelect} />
              {location && (
                <div className="selected-location">
                  ✅ Selected: {location.name.substring(0, 100)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="primary-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="secondary-btn"
            onClick={handleSubmit}
            disabled={loading || !comment || !location}
          >
            {loading ? "Adding..." : "Add Pin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPinModal;
