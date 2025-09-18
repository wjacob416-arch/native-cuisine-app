import React, { useState } from "react";
import axios from "axios";
import "./RecipeScraper.css";

function RecipeScraper() {
  const [urls, setUrls] = useState("");
  const [searchUrls, setSearchUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("individual"); // "individual" or "search"
  const [maxRecipes, setMaxRecipes] = useState(50);

  // Predefined list of single‐recipe URLs
  const predefinedUrls = [
    "https://www.allrecipes.com/recipe/6880/indian-fry-bread/",
    "https://www.allrecipes.com/recipe/141828/traditional-bannock/",
    "https://www.allrecipes.com/recipe/214831/native-american-wild-rice/",
    "https://www.allrecipes.com/recipe/254402/three-sisters-soup/",
    "https://www.allrecipes.com/recipe/222144/native-american-succotash/",
    "https://www.food.com/recipe/pemmican-native-american-survival-food-104815",
    "https://www.food.com/recipe/wojapi-native-american-pudding-253990",
    "https://www.tasteofhome.com/recipes/wild-rice-with-dried-blueberries/",
    "https://www.tasteofhome.com/recipes/wild-rice-mushroom-soup/",
    "https://www.tasteofhome.com/recipes/wild-rice-stuffed-squash/",
  ];

  // Predefined search-result pages
  const predefinedSearchUrls = [
    "https://www.food.com/search/native+american",
    "https://www.allrecipes.com/search?q=native+american",
    "https://www.foodnetwork.com/search/native-american-",
  ];

  const handleLoadPredefined = () => {
    if (activeTab === "individual") {
      setUrls(predefinedUrls.join("\n"));
    } else {
      setSearchUrls(predefinedSearchUrls.join("\n"));
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      if (activeTab === "individual") {
        const urlList = urls
          .split("\n")
          .map((u) => u.trim())
          .filter((u) => u);

        if (!urlList.length) {
          setError("Please enter at least one URL");
          setLoading(false);
          return;
        }

        // ← Relative path integrates with your Flask/SQLite backend via CRA proxy
        response = await axios.post("/scrape-native-recipes", {
          urls: urlList,
        });
      } else {
        const searchUrlList = searchUrls
          .split("\n")
          .map((u) => u.trim())
          .filter((u) => u);

        if (!searchUrlList.length) {
          setError("Please enter at least one search URL");
          setLoading(false);
          return;
        }

        response = await axios.post("/scrape-search-results", {
          search_urls: searchUrlList,
          max_recipes: maxRecipes,
        });
      }

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || "Failed to scrape recipes");
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-scraper">
      <h2>Bulk Recipe Scraper</h2>
      <p>
        Add URLs to scrape Native American recipes and add them to the
        database.
      </p>

      <div className="tab-buttons">
        <button
          className={`tab-button ${
            activeTab === "individual" ? "active" : ""
          }`}
          onClick={() => setActiveTab("individual")}
        >
          Individual Recipe URLs
        </button>
        <button
          className={`tab-button ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Search Results Pages
        </button>
      </div>

      <button
        onClick={handleLoadPredefined}
        className="load-predefined-button"
      >
        Load Predefined URLs
      </button>

      <form onSubmit={handleScrape} className="scraper-form">
        {activeTab === "individual" ? (
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="Enter recipe URLs, one per line"
            className="urls-textarea"
            rows={10}
          />
        ) : (
          <>
            <textarea
              value={searchUrls}
              onChange={(e) => setSearchUrls(e.target.value)}
              placeholder="Enter search URLs, one per line"
              className="urls-textarea"
              rows={5}
            />
            <div className="max-recipes">
              <label htmlFor="max-recipes">
                Maximum recipes to scrape:
              </label>
              <input
                id="max-recipes"
                type="number"
                min="1"
                max="200"
                value={maxRecipes}
                onChange={(e) =>
                  setMaxRecipes(parseInt(e.target.value, 10))
                }
                className="max-recipes-input"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="scrape-button"
          disabled={loading}
        >
          {loading ? "Scraping..." : "Scrape Recipes"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-message">
          <h3>Scraping Complete!</h3>
          <p>{result.message}</p>

          {result.new_recipes.length > 0 && (
            <div className="new-recipes">
              <h4>Newly Added Recipes:</h4>
              <ul>
                {result.new_recipes.map((r, idx) => (
                  <li key={idx}>{r.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecipeScraper;
