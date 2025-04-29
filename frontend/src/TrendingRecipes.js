// TrendingRecipes.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TrendingRecipes.css";

/**
 * Most-viewed recipes panel
 * - Refreshes every 10 s (polling)
 * - Also refreshes instantly whenever the parent bumps `refresh`
 */
export default function TrendingRecipes({ limit = 10, pollMs = 10000, refresh = 0 }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /** request helper */
  const load = async (spinner = false) => {
    if (spinner) setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/trending", { params: { limit } });
      if (data.success) setList(data.trending || []);
      else               setError("Server refused request");
    } catch {
      setError("Error reaching server.");
    } finally { if (spinner) setLoading(false); }
  };

  /* first load + polling */
  useEffect(() => {
    load(true);
    const id = setInterval(() => load(false), pollMs);
    return () => clearInterval(id);
  }, [limit, pollMs]);

  /* immediate refresh when parent notifies */
  useEffect(() => { if (!loading) load(false); }, [refresh]);  // eslint-disable-line

  /* rank style helpers */
  const rankColor = idx =>
    idx === 0 ? "#ffd700" : idx === 1 ? "#c0c0c0" : idx === 2 ? "#cd7f32" : "#8b4513";
  const rankFont  = idx => (idx < 3 ? "#333" : "#fff");

  /* ---------------- UI ---------------- */
  return (
    <div className="trending-recipes">
      <h2>Most-Viewed Native American Recipes</h2>

      {loading ? (
        <div className="loading-trending">
          <div className="spinner" />
          Loading trending recipes…
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : list.length === 0 ? (
        <div className="no-trending">No views yet.</div>
      ) : (
        <div className="trending-list">
          {list.map(({ name, views }, idx) => (
            <div key={idx} className="trending-item">
              <div
                className="trending-rank"
                style={{ backgroundColor: rankColor(idx), color: rankFont(idx) }}
              >
                {idx + 1}
              </div>
              <div className="trending-info">
                <div className="trending-name">{name}</div>
                <div className="trending-views">{views} views</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
