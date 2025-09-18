import React, { useState } from "react";
import axios from "axios";
import "./AddReview.css";

function AddReview({ recipeName, onReviewAdded }) {
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
      const response = await axios.post("/add-review", {
        recipe_name: recipeName,
        username,
        rating,
        comment,
      });

      if (response.data.success) {
        setSuccess(true);
        setUsername("");
        setRating(5);
        setComment("");

        if (onReviewAdded) {
          setTimeout(() => {
            onReviewAdded();
          }, 1500);
        }
      } else {
        setError(response.data.error || "Failed to add review");
      }
    } catch (err) {
      console.error("Error adding review:", err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStarSelector = () => {
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

      {success ? (
        <div className="success-message">
          <p>Thank you for your review!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="username">Your Name</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your name"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Your Rating</label>
            <div className="star-rating">{renderStarSelector()}</div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Comments (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this recipe"
              className="form-control"
              rows={4}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddReview;
