import React, { useState } from "react";
import axios from "axios";

function AutoScraper({ onScrapingComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage]     = useState("");
  const [error, setError]         = useState(null);
  const [hasScraped, setHasScraped]= useState(false);

  const triggerAutoScrape = async () => {
    if (hasScraped) return;
    setIsLoading(true);
    setMessage("Automatically scraping Native American recipes...");
    setError(null);
    try {
      const res = await axios.get("/auto-scrape");
      if (res.data.success) {
        setMessage(`Added ${res.data.new_recipes.length} recipes!`);
        onScrapingComplete?.();
      } else {
        setError("Failed to scrape recipes");
      }
    } catch {
      setError("Error connecting to server. Please try again.");
    } finally {
      setIsLoading(false);
      setHasScraped(true);
    }
  };

  const handleManualScrape = () => {
    setHasScraped(false);
    triggerAutoScrape();
  };

  return (
    <div className="auto-scraper">
      {isLoading
        ? <div className="loading-message"><div className="spinner"/><p>{message}</p></div>
        : error
          ? <div className="error-message"><p>{error}</p><button onClick={handleManualScrape}>Retry</button></div>
          : message
            ? <div className="success-message"><p>{message}</p><button onClick={handleManualScrape}>Scrape Again</button></div>
            : null
      }
    </div>
  );
}

export default AutoScraper;
