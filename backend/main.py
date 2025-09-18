import os, re, sqlite3, time, heapq
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from trie import Trie
from priority_queue import PriorityQueue
from recipe_scraper import RecipeScraper
from review import ReviewManager
from recipe_scrapers import scrape_me

app = Flask(__name__)
CORS(app)                       # allow localhost:3000 → 5000

# ─── Paths & DB ───────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DB_PATH     = os.path.join(BASE_DIR, "recipes.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")

# ─── Reviews manager (JSON) ──────────────────────────────────────────────
REVIEWS_FILE   = os.path.join(BASE_DIR, "reviews.json")
review_manager = ReviewManager(REVIEWS_FILE)

# ─── DB helper ───────────────────────────────────────────────────────────
def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_db(_):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

# ─── Initialize schema & ensure view counter table ───────────────────────
with app.app_context():
    db = get_db()
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        db.executescript(f.read())
    db.execute(
        """CREATE TABLE IF NOT EXISTS recipe_views(
               name  TEXT PRIMARY KEY,
               views INTEGER NOT NULL DEFAULT 0
           );"""
    )
    db.commit()

# ─── Tries for autocomplete ──────────────────────────────────────────────
recipe_trie     = Trie()
ingredient_trie = Trie()

# ─── Priority queue (unused here) ────────────────────────────────────────
task_queue = PriorityQueue()

def load_tasks_from_db():
    rows = get_db().execute(
        "SELECT id, priority, payload FROM tasks WHERE status='pending'"
    ).fetchall()
    for r in rows:
        task_queue.insert(r["priority"], (r["id"], r["payload"]))

with app.app_context():
    cur = get_db().execute("SELECT name, ingredients FROM recipies")
    for row in cur.fetchall():
        recipe_trie.insert(row["name"])
        for token in re.findall(r"[A-Za-z]+", row["ingredients"]):
            ingredient_trie.insert(token.lower())
    load_tasks_from_db()

# ─────────────────────────────  ROUTES  ──────────────────────────────────
@app.route("/get-greatlakes")
def get_recipes():
    name_q = request.args.get("name", "").lower().strip()
    ing_q  = request.args.get("ingredient", "").lower().strip()

    sql = "SELECT id, name, ingredients, instructions FROM recipies"
    clauses, params = [], []
    if name_q:
        clauses.append("LOWER(name) LIKE ?");        params.append(f"%{name_q}%")
    if ing_q:
        clauses.append("LOWER(ingredients) LIKE ?"); params.append(f"%{ing_q}%")
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)

    rows = get_db().execute(sql, params).fetchall()
    out  = []
    for r in rows:
        out.append({
            "id":             r["id"],
            "name":           r["name"],
            "ingredients":    r["ingredients"].split("\n"),
            "instructions":   r["instructions"].split("\n"),
            "average_rating": review_manager.get_average_rating(r["name"])
        })
    return jsonify({"Great Lakes": out,
                    "message": "Filtered results" if clauses else "All recipes"})

# ─── Autosuggest ─────────────────────────────────────────────────────────
@app.route("/suggest-recipes")
def suggest_recipes():
    q = request.args.get("q", "").lower().strip()
    if not q:
        return jsonify(suggestions=[])
    rows = get_db().execute(
        "SELECT name FROM recipies WHERE LOWER(name) LIKE ? LIMIT 10",
        (f"%{q}%",)
    ).fetchall()
    return jsonify(suggestions=[r["name"] for r in rows])

@app.route("/suggest-ingredients")
def suggest_ingredients():
    q = request.args.get("q", "").lower().strip()
    if not q:
        return jsonify(suggestions=[])
    return jsonify(suggestions=ingredient_trie.autocomplete(q)[:10])

# ─── Record a view (CORS-safe) ───────────────────────────────────────────
@app.route("/record-view", methods=["POST", "OPTIONS"])
def record_view():
    # Handle browser pre-flight
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify(success=False, error="Missing recipe name"), 400

    db = get_db()
    db.execute(
        """INSERT INTO recipe_views(name, views) VALUES(?,1)
           ON CONFLICT(name) DO UPDATE SET views = views + 1""",
        (name,)
    )
    db.commit()
    return jsonify(success=True)

# ─── Trending by view count ──────────────────────────────────────────────
@app.route("/trending")
def trending():
    """Return top-N recipes ranked by view count using a max-heap."""
    limit = int(request.args.get("limit", 10))

    # 1. Fetch all view counters (name, views)
    rows = get_db().execute(
        "SELECT name, views FROM recipe_views"
    ).fetchall()

    # 2. Build a list of tuples (views, name)
    tuples = [(row["views"], row["name"]) for row in rows]

    # 3. Extract N largest items with a max-heap (heapq.nlargest)
    top = heapq.nlargest(limit, tuples, key=lambda t: t[0])

    # 4. Re-shape for JSON
    out = [{"name": name, "views": views} for views, name in top]
    return jsonify(success=True, trending=out)
# ─── Reviews, import, etc. (unchanged) ──────────────────────────────────
@app.route("/add-review", methods=["POST"])
def add_review():
    data    = request.get_json() or {}
    name    = data.get("recipe_name")
    user    = data.get("username")
    rating  = data.get("rating")
    comment = data.get("comment", "")
    if not (name and user and rating):
        return jsonify(success=False, error="Missing fields"), 400
    rating = float(rating)
    if not 1 <= rating <= 5:
        return jsonify(success=False, error="Rating must be 1–5"), 400
    rev = review_manager.add_review(name, user, rating, comment)
    return jsonify(success=True, review=rev)

@app.route("/get-reviews/<recipe_name>")
def get_reviews(recipe_name):
    return jsonify(success=True,
                   reviews=review_manager.get_all_reviews(recipe_name),
                   average_rating=review_manager.get_average_rating(recipe_name))

# other endpoints (get-top-rated, import-recipe, scraping…) remain unchanged

if __name__ == "__main__":
    app.run(debug=True)
