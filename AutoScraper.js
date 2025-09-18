import React, { useState } from "react";
import axios from "axios";
import "./AutoScraper.css";

function AutoScraper({ onScrapingComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [hasScraped, setHasScraped] = useState(false);

  // Trigger automatic scraping
  const triggerAutoScrape = async () => {
    if (hasScraped) return; // prevent duplicate

    setIsLoading(true);
    setMessage("Automatically scraping Native American recipes...");
    setError(null);

    try {
      // Use relative path to integrate with Flask/SQLite backend
      const response = await axios.get("/auto-scrape");

      if (response.data.success) {
        setMessage(
          `Successfully added ${response.data.new_recipes.length} new Native American recipes!`
        );
        if (onScrapingComplete) onScrapingComplete();
      } else {
        setError("Failed to scrape recipes");
      }
    } catch (err) {
      console.error("Error auto-scraping:", err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setIsLoading(false);
      setHasScraped(true);
    }
  };

  // Allow manual retry
  const handleManualScrape = () => {
    setHasScraped(false);
    triggerAutoScrape();
  };

  return (
    <div className="auto-scraper">
      {/* Initial or success state shows message if loading has completed */}
      {isLoading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>{message}</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleManualScrape} className="retry-button">
            Retry Scraping
          </button>
        </div>
      )}

      {!isLoading && message && !error && (
        <div className="success-message">
          <p>{message}</p>
          <button
            onClick={handleManualScrape}
            className="scrape-again-button"
          >
            Scrape Again
          </button>
        </div>
      )}

      {/* Optionally trigger scraping manually if no message yet */}
      {!isLoading && !message && !error && (
        <button onClick={triggerAutoScrape} className="scrape-button">
          Scrape Recipes
        </button>
      )}
    </div>
  );
}

export default AutoScraper;
