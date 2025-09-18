# review.py
import json
import os
import time
from priority_queue import PriorityQueue

class ReviewManager:
    """
    Manages recipe reviews using a priority queue,
    persisted in a JSON file.
    """

    def __init__(self, reviews_file_path):
        # take the path to your JSON storage
        self.reviews_file_path = reviews_file_path
        self.reviews = self.load_reviews()
        self.review_queues = {}
        self.initialize_queues()

    def load_reviews(self):
        """Load reviews from the JSON file (or return empty dict)."""
        try:
            if os.path.exists(self.reviews_file_path):
                with open(self.reviews_file_path, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            print(f"Error loading reviews: {e}")
            return {}

    def save_reviews(self):
        """Write the in-memory reviews back to JSON."""
        try:
            with open(self.reviews_file_path, 'w') as f:
                json.dump(self.reviews, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving reviews: {e}")
            return False

    def initialize_queues(self):
        """Build a PriorityQueue of past reviews per recipe."""
        for recipe_name, reviews in self.reviews.items():
            pq = PriorityQueue()
            for rev in reviews:
                pq.insert(rev['rating'], rev)
            self.review_queues[recipe_name] = pq

    def add_review(self, recipe_name, username, rating, comment):
        """Add a new review, queue it, persist it, and return it."""
        review = {
            'username': username,
            'rating': rating,
            'comment': comment,
            'timestamp': time.time()
        }

        # add to dict
        self.reviews.setdefault(recipe_name, []).append(review)
        # add to PQ
        if recipe_name not in self.review_queues:
            self.review_queues[recipe_name] = PriorityQueue()
        self.review_queues[recipe_name].insert(rating, review)
        # persist
        self.save_reviews()
        return review

    def get_top_reviews(self, recipe_name, limit=5):
        """Return the top-N reviews (by rating) for a recipe."""
        if recipe_name not in self.review_queues:
            return []
        # clone the queue so we don't destroy it
        clone = PriorityQueue()
        for prio, item in self.review_queues[recipe_name].heap:
            clone.insert(prio, item)
        top = []
        for _ in range(min(limit, clone.size)):
            top.append(clone.extract_max()[1])
        return top

    def get_all_reviews(self, recipe_name):
        """Return every review for a recipe in insertion order."""
        return self.reviews.get(recipe_name, [])

    def get_average_rating(self, recipe_name):
        """Compute the float average rating, or 0 if none."""
        revs = self.reviews.get(recipe_name, [])
        if not revs:
            return 0
        return sum(r['rating'] for r in revs) / len(revs)

    def get_top_rated_recipes(self, limit=10):
        """
        Return a list of (recipe_name, avg_rating) sorted
        descending by rating, limited to `limit`.
        """
        ratings = [
            (self.get_average_rating(name), name)
            for name in self.reviews
        ]
        ratings.sort(reverse=True)
        return [(name, avg) for avg, name in ratings[:limit]]
