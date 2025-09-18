import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RecipeReviews.css";

function RecipeReviews({ recipeName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use relative path so CRA proxy forwards to Flask/SQLite backend
        const response = await axios.get(
          `/get-reviews/${encodeURIComponent(recipeName)}`
        );

        if (response.data.success) {
          setReviews(response.data.reviews || []);
          setAverageRating(response.data.average_rating || 0);
        } else {
          setError("Failed to load reviews");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Error connecting to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (recipeName) {
      fetchReviews();
    }
  }, [recipeName]);

  // Format UNIX timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Render star icons
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          {i <= rating ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="recipe-reviews">
      <h3>Reviews for {recipeName}</h3>

      {averageRating > 0 && (
        <div className="average-rating">
          <p>Average Rating: {averageRating.toFixed(1)}</p>
          <div className="stars">{renderStars(Math.round(averageRating))}</div>
        </div>
      )}

      {loading ? (
        <div className="loading-reviews">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : reviews.length === 0 ? (
        <p className="no-reviews">
          No reviews yet. Be the first to review this recipe!
        </p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-header">
                <div className="review-user">{review.username}</div>
                <div className="review-date">
                  {formatDate(review.timestamp)}
                </div>
              </div>
              <div className="review-rating">
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <div className="review-comment">{review.comment}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeReviews;
