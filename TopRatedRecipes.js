import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TopRatedRecipes.css";

function TopRatedRecipes() {
  const [topRecipes, setTopRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use relative path so CRA proxy forwards to Flask/SQLite backend
        const response = await axios.get("/get-top-rated-recipes");

        if (response.data.success) {
          setTopRecipes(response.data.top_recipes || []);
        } else {
          setError("Failed to load top rated recipes");
        }
      } catch (err) {
        console.error("Error fetching top recipes:", err);
        setError("Error connecting to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopRecipes();
  }, []);

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          {i <= rating ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="top-rated-recipes">
      <h2>Top Rated Native American Recipes</h2>

      {loading ? (
        <div className="loading-top-recipes">
          <div className="spinner"></div>
          <p>Loading top recipes...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : topRecipes.length === 0 ? (
        <p className="no-top-recipes">
          No rated recipes yet. Be the first to rate a recipe!
        </p>
      ) : (
        <div className="top-recipes-list">
          {topRecipes.map(([name, rating], index) => (
            <div key={index} className="top-recipe-item">
              <div className="top-recipe-rank">{index + 1}</div>
              <div className="top-recipe-info">
                <div className="top-recipe-name">{name}</div>
                <div className="top-recipe-rating">
                  {renderStars(Math.round(rating))}
                  <span className="rating-value">({rating.toFixed(1)})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopRatedRecipes;
