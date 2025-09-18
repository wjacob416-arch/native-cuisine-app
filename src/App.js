// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

import RecipeReviews from "./RecipeReviews";
import AddReview from "./AddReview";
import TopRatedRecipes from "./TopRatedRecipes";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showTopRated, setShowTopRated] = useState(false);

  // fetch recipes
  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.name = search;
      if (ingredient) params.ingredient = ingredient;
      const res = await axios.get("/get-greatlakes", { params });
      const list = res.data["Great Lakes"] || [];
      setRecipes(list);
      if (!list.length) setError("No recipes found.");
    } catch (e) {
      setError(
        "Error connecting to server. Please make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const toggleRecipe = (idx) => {
    if (expandedRecipe === idx) {
      // close
      setExpandedRecipe(null);
      setShowReviews(false);
      setShowAddReview(false);
    } else {
      setExpandedRecipe(idx);
      setShowReviews(false);
      setShowAddReview(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🍲 Native American Cuisine: Great Lakes Region</h1>
      </header>

      <main className="app-main">
        {/* Search form */}
        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search by recipe name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Filter by ingredient"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        {/* Admin controls */}
        <div className="admin-controls">
          <button
            onClick={() => setShowTopRated(!showTopRated)}
            className="admin-button"
          >
            {showTopRated ? "Hide Top Rated" : "Show Top Rated Recipes"}
          </button>
        </div>

        {showTopRated && <TopRatedRecipes />}

        {loading && (
          <div className="loading">
            <p>Loading recipes…</p>
          </div>
        )}
        {error && !loading && (
          <div className="error-message">{error}</div>
        )}

        {/* Recipe list */}
        <div className="recipes-container">
          {recipes.map((recipe, idx) => (
            <div key={idx} className="recipe-card">
              <div
                className="recipe-header"
                onClick={() => toggleRecipe(idx)}
              >
                <h2>{recipe.name}</h2>
                <span>{expandedRecipe === idx ? "▲" : "▼"}</span>
              </div>

              {expandedRecipe === idx && (
                <div className="recipe-details">
                  {/* Action buttons */}
                  <div className="recipe-actions">
                    <button
                      onClick={() => {
                        setShowReviews(true);
                        setShowAddReview(false);
                      }}
                    >
                      Reviews
                    </button>
                    <button
                      onClick={() => {
                        setShowAddReview(true);
                        setShowReviews(false);
                      }}
                    >
                      Add Review
                    </button>
                    <button onClick={() => toggleRecipe(idx)}>
                      Close
                    </button>
                  </div>

                  {/* Either show reviews, add-review form, or the recipe itself */}
                  {showReviews ? (
                    <RecipeReviews recipeName={recipe.name} />
                  ) : showAddReview ? (
                    <AddReview
                      recipeName={recipe.name}
                      onReviewAdded={() => {
                        setShowAddReview(false);
                        setShowReviews(true);
                      }}
                    />
                  ) : (
                    <>
                      <div className="ingredients">
                        <h3>Ingredients</h3>
                        <ul>
                          {recipe.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="instructions">
                        <h3>Instructions</h3>
                        <ol>
                          {recipe.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
