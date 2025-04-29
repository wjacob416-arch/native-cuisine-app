
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TopRatedRecipes.css";

function TopRatedRecipes() {
  const [topRecipes, setTopRecipes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/get-top-rated-recipes");
        if (res.data.success) setTopRecipes(res.data.top_recipes || []);
        else setError("Failed to load top rated recipes");
      } catch {
        setError("Error connecting to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, []);

  const renderStars = (r) => Array.from({length:5},(_,i)=> i<r ? <span key={i} className="star filled">★</span> : <span key={i} className="star">☆</span>);

  if (loading) return <div className="loading-top-recipes"><div className="spinner"/>Loading top recipes...</div>;
  if (error)   return <div className="error-message">{error}</div>;

  return (
    <div className="top-rated-recipes">
      <h2>Top Rated Native American Recipes</h2>
      {topRecipes.length===0
        ? <p>No rated recipes yet.</p>
        : (
          <div className="top-recipes-list">
            {topRecipes.map(([name, rating], i)=>(
              <div key={i} className="top-recipe-item">
                <div className="top-recipe-rank">{i+1}</div>
                <div className="top-recipe-info">
                  <div className="top-recipe-name">{name}</div>
                  <div className="top-recipe-rating">
                    {renderStars(Math.round(rating))}
                    <span>({rating.toFixed(1)})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

export default TopRatedRecipes;
