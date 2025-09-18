import React, { useState } from "react";
import axios from "axios";
import "./AddReview.css";

export default function AddReview({ recipeName, onReviewAdded }) {
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { data } = await axios.post("/add-review", {
        recipe_name: recipeName,
        username,
        rating,
        comment
      });
      if (data.success) {
        setSuccess(true);
        setUsername("");
        setRating(5);
        setComment("");
        if (onReviewAdded) onReviewAdded();
      } else {
        setError("Server refused review: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
      if (err.response) setError(err.response.data.error || "Server error");
      else if (err.request) setError("No response from server");
      else setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // stars...
  const renderStars = () => {
    const stars = [];
    for (let i = 5; i >= 1; i--) {
      stars.push(
        <label key={i} className={i <= rating ? "star filled" : "star"}>
          <input
            type="radio"
            name="rating"
            value={i}
            checked={rating === i}
            onChange={() => setRating(i)}
          />
          {i <= rating ? "★" : "☆"}
        </label>
      );
    }
    return stars;
  };

  return (
    <div className="add-review">
      <h3>Add Your Review for {recipeName}</h3>
      {success && <div className="success-message">Review submitted!</div>}
      <form onSubmit={handleSubmit}>
        <label>Your Name</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <label>Your Rating</label>
        <div className="star-rating">{renderStars()}</div>
        <label>Your Comments (optional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
