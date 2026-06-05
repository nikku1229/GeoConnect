import { useState, useEffect } from "react";

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
              <p>{result.display_name.split(",")[0]}</p>
              <small>{result.display_name}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
