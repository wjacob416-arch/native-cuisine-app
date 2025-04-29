import React, { useState } from "react";
import axios from "axios";
import "./RecipeScraper.css";

function RecipeImporter() {
  const [url, setUrl]               = useState("");
  const [loading, setLoading]       = useState(false);
  const [importedRecipe, setImportedRecipe] = useState(null);
  const [error, setError]           = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/import-recipe", { url });
      if (res.data.success) setImportedRecipe(res.data.recipe);
      else                  setError(res.data.error || "Failed to import recipe");
    } catch {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = () => {
    alert("Recipe added to your collection!");
    setImportedRecipe(null);
  };

  return (
    <div className="recipe-importer">
      <h2>Import Recipe from Website</h2>
      <form onSubmit={handleImport} className="import-form">
        <input
          type="text"
          value={url}
          onChange={(e)=>setUrl(e.target.value)}
          placeholder="Paste recipe URL"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Importing..." : "Import Recipe"}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {importedRecipe && (
        <div className="imported-recipe">
          <h3>{importedRecipe.name}</h3>
          <h4>Ingredients:</h4>
          <ul>{importedRecipe.ingredients.map((i,idx)=><li key={idx}>{i}</li>)}</ul>
          <h4>Instructions:</h4>
          <ol>{importedRecipe.instructions.map((s,idx)=><li key={idx}>{s}</li>)}</ol>
          <button onClick={handleAddToCollection}>Add to My Collection</button>
        </div>
      )}
    </div>
  );
}

export default RecipeImporter;
