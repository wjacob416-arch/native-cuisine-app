// App.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

import AutoScraper     from "./AutoScraper";
import RecipeReviews   from "./RecipeReviews";
import AddReview       from "./AddReview";
import TrendingRecipes from "./TrendingRecipes";

/* ──────────────────────────────────────────────────────────────── */

export default function App() {
  /* ---------- core state ---------- */
  const [recipes, setRecipes]       = useState([]);
  const [search, setSearch]         = useState("");
  const [ingredient, setIngredient] = useState("");

  /* autosuggestions */
  const [recipeSug, setRecipeSug] = useState([]), [showRS, setShowRS] = useState(false);
  const [ingSug,    setIngSug]    = useState([]), [showIS, setShowIS] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const [expanded,   setExpanded]   = useState(null);
  const [showRev,    setShowRev]    = useState(false);
  const [showAddRev, setShowAddRev] = useState(false);

  const [showTrend,     setShowTrend]   = useState(false);
  const [trendVersion,  setTrendVer]    = useState(0);   /* NEW */

  const recipeBoxRef     = useRef(null);
  const ingredientBoxRef = useRef(null);

  /* ---------- fetch recipes ---------- */
  const fetchRecipes = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (search)     params.name       = search;
      if (ingredient) params.ingredient = ingredient;
      const { data } = await axios.get("/get-greatlakes", { params });
      setRecipes(data["Great Lakes"] || []);
      if (!(data["Great Lakes"] || []).length) setError("No recipes found.");
    } catch { setError("Backend unreachable."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchRecipes(); }, []);

  /* ---------- suggestions (debounced) ---------- */
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setRecipeSug([]); setShowRS(false); return; }
      try {
        const { data } = await axios.get("/suggest-recipes", { params:{q:search.trim()} });
        setRecipeSug(data.suggestions || []); setShowRS(true);
      } catch { setRecipeSug([]); setShowRS(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!ingredient.trim()) { setIngSug([]); setShowIS(false); return; }
      try {
        const { data } = await axios.get("/suggest-ingredients",{params:{q:ingredient.trim()}});
        setIngSug(data.suggestions || []); setShowIS(true);
      } catch { setIngSug([]); setShowIS(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [ingredient]);

  /* ---------- hide suggestions on outside click ---------- */
  useEffect(() => {
    const h = e => {
      if (recipeBoxRef.current && !recipeBoxRef.current.contains(e.target))
        setShowRS(false);
      if (ingredientBoxRef.current && !ingredientBoxRef.current.contains(e.target))
        setShowIS(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ---------- helpers ---------- */
  const onSubmit = e => { e.preventDefault(); fetchRecipes(); };

  /* count a view & tell TrendingRecipes to refresh */
  const openRecipe = async (idx, name) => {
    if (expanded === idx) {           // closing the same card
      setExpanded(null); setShowRev(false); setShowAddRev(false);
      return;
    }
    setExpanded(idx); setShowRev(false); setShowAddRev(false);

    try {
      await axios.post("/record-view", { name });
      setTrendVer(v => v + 1);        /* NEW → signal refresh */
    } catch { console.error("Failed to record view");}
  };

  /* ======================== UI ========================= */
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🍲 Native American Cuisine: Great Lakes Region</h1>
      </header>

      <main className="app-main">
        <AutoScraper onScrapingComplete={fetchRecipes} />

        {/* ---------------- search bar ---------------- */}
        <div className="search-container">
          <form onSubmit={onSubmit} className="search-form">
            {/* recipe name */}
            <div className="recipe-search-container" ref={recipeBoxRef}>
              <input
                className="search-input"
                placeholder="Search by recipe name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => { if (recipeSug.length) setShowRS(true); }}
              />
              {showRS && (
                <ul className="suggestions">
                  {recipeSug.map((s,i)=>
                    <li key={i} className="suggestion-item"
                        onClick={()=>{ setSearch(s); setShowRS(false); }}>
                      {s}
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* ingredient */}
            <div className="ingredient-search-container" ref={ingredientBoxRef}>
              <input
                className="search-input"
                placeholder="Filter by ingredient"
                value={ingredient}
                onChange={e => setIngredient(e.target.value)}
                onFocus={() => { if (ingSug.length) setShowIS(true); }}
              />
              {showIS && (
                <ul className="ingredient-suggestions">
                  {ingSug.map((s,i)=>
                    <li key={i} className="suggestion-item"
                        onClick={()=>{ setIngredient(s); setShowIS(false); }}>
                      {s}
                    </li>
                  )}
                </ul>
              )}
            </div>

            <button type="submit" className="search-button">Search</button>
          </form>
        </div>

        {/* -------- single trending button -------- */}
        <div className="admin-controls">
          <button className="admin-button"
                  onClick={() => setShowTrend(!showTrend)}>
            {showTrend ? "Hide Trending Recipes" : "Show Trending Recipes"}
          </button>
        </div>

        {/* pass refresh trigger down */}
        {showTrend && <TrendingRecipes refresh={trendVersion} />}

        {loading && <div className="loading"><p>Loading recipes…</p></div>}
        {error   && <div className="error-message">{error}</div>}

        {/* ---------------- recipe list ---------------- */}
        <div className="recipes-container">
          {recipes.map((r, idx) => (
            <div className="recipe-card" key={idx}>
              <div className="recipe-header"
                   onClick={() => openRecipe(idx, r.name)}>
                <h2>{r.name}</h2>
                <span>{expanded === idx ? "▲" : "▼"}</span>
              </div>

              {expanded === idx && (
                <div className="recipe-details">
                  <div className="recipe-actions">
                    <button onClick={()=>{ setShowRev(true); setShowAddRev(false); }}>
                      Reviews
                    </button>
                    <button onClick={()=>{ setShowAddRev(true); setShowRev(false); }}>
                      Add Review
                    </button>
                    <button onClick={()=> openRecipe(idx, r.name)}>Close</button>
                  </div>

                  {showRev ? (
                    <RecipeReviews recipeName={r.name} />
                  ) : showAddRev ? (
                    <AddReview recipeName={r.name}
                               onReviewAdded={()=>{ setShowAddRev(false); setShowRev(true); }} />
                  ) : (
                    <>
                      <div className="ingredients">
                        <h3>Ingredients</h3>
                        <ul>{r.ingredients.map((ing,i)=><li key={i}>{ing}</li>)}</ul>
                      </div>
                      <div className="instructions">
                        <h3>Instructions</h3>
                        <ol>{r.instructions.map((stp,i)=><li key={i}>{stp}</li>)}</ol>
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
