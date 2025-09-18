import React, { useState } from "react";
import axios from "axios";
import "./RecipeImporter.css";

function RecipeImporter() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [importedRecipe, setImportedRecipe] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use relative path for CRA proxy integration with Flask/SQLite backend
      const response = await axios.post("/import-recipe", { url });

      if (response.data.success) {
        setImportedRecipe(response.data.recipe);
      } else {
        setError(response.data.error || "Failed to import recipe");
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = () => {
    // Assuming backend persistence, this could POST to a "save" endpoint
    alert("Recipe added to your collection!");
    setImportedRecipe(null);
  };

  return (
    <div className="recipe-importer">
      <h2>Import Recipe from Website</h2>
      <form onSubmit={handleImport} className="import-form">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste recipe URL here (e.g., Allrecipes)"
          className="url-input"
          required
        />
        <button type="submit" className="import-button" disabled={loading}>
          {loading ? "Importing..." : "Import Recipe"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {importedRecipe && (
        <div className="imported-recipe">
          <h3>{importedRecipe.name}</h3>
          <div className="ingredients">
            <h4>Ingredients:</h4>
            <ul>
              {importedRecipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>
          <div className="instructions">
            <h4>Instructions:</h4>
            <ol>
              {importedRecipe.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
          <button onClick={handleAddToCollection} className="add-button">
            Add to My Collection
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeImporter;
