// PantryTracker.js
import React, { useEffect, useState } from "react";
import "./PantryTracker.css";

/**
 * props.uniqueIngredients = array of unique strings
 * onClose = () => void
 */
export default function PantryTracker({ uniqueIngredients, onClose }) {
  // load from localStorage or start empty
  const [pantry, setPantry] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pantry") || "{}");
    } catch {
      return {};
    }
  });

  // keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("pantry", JSON.stringify(pantry));
  }, [pantry]);

  // helper to change a single quantity
  const updateQty = (ing, qty) =>
    setPantry(prev => ({ ...prev, [ing]: qty < 0 ? 0 : qty }));

  return (
    <div className="pantry-tracker">
      <div className="pantry-header">
        <h2>Your Pantry</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="pantry-body">
        {uniqueIngredients.map(ing => (
          <div key={ing} className="pantry-row">
            <span className="pantry-name">{ing}</span>
            <input
              type="number"
              min="0"
              value={pantry[ing] ?? ""}
              className="pantry-input"
              onChange={e => updateQty(ing, Number(e.target.value))}
            />
          </div>
        ))}
        {uniqueIngredients.length === 0 && (
          <p className="empty-note">No ingredients loaded yet.</p>
        )}
      </div>
    </div>
  );
}
