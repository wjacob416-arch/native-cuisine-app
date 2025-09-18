import os
import re
import sqlite3
import time
import heapq
from flask import Flask, jsonify, request, g
from flask_cors import CORS

from trie import Trie
from priority_queue import PriorityQueue
from recipe_scraper import RecipeScraper
from review import ReviewManager
from recipe_scrapers import scrape_me

app = Flask(__name__)
CORS(app)

# --- Paths & DB ---
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DB_PATH     = os.path.join(BASE_DIR, 'recipes.db')
SCHEMA_PATH = os.path.join(BASE_DIR, 'schema.sql')

# --- Reviews Manager (still JSON-based) ---
REVIEWS_FILE   = os.path.join(BASE_DIR, 'reviews.json')
review_manager = ReviewManager(REVIEWS_FILE)

# --- Database Helpers ---
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# --- Initialize the database using schema.sql ---
with app.app_context():
    db = get_db()
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        db.executescript(f.read())

# --- Tries for Autocomplete ---
recipe_trie     = Trie()
ingredient_trie = Trie()

# --- Priority Queue for Task Scheduling ---
task_queue = PriorityQueue()

def load_tasks_from_db():
    db   = get_db()
    rows = db.execute(
        "SELECT id, priority, payload FROM tasks WHERE status = 'pending'"
    ).fetchall()
    for r in rows:
        task_queue.insert(r['priority'], (r['id'], r['payload']))

with app.app_context():
    cur = get_db().execute("SELECT name, ingredients FROM recipies;")
    for row in cur.fetchall():
        recipe_trie.insert(row['name'])
        for token in re.findall(r"[A-Za-z]+", row['ingredients']):
            ingredient_trie.insert(token.lower())
    load_tasks_from_db()

# --- Routes ---

@app.route('/get-greatlakes', methods=['GET'])
def get_recipes():
    name_q = request.args.get('name', '').lower().strip()
    ing_q  = request.args.get('ingredient', '').lower().strip()

    sql     = "SELECT id, name, ingredients, instructions FROM recipies"
    params, clauses = [], []
    if name_q:
        clauses.append("LOWER(name) LIKE ?");  params.append(f"%{name_q}%")
    if ing_q:
        clauses.append("LOWER(ingredients) LIKE ?"); params.append(f"%{ing_q}%")
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)

    rows = get_db().execute(sql, params).fetchall()
    out = []
    for r in rows:
        out.append({
            'id': r['id'],
            'name': r['name'],
            'ingredients': r['ingredients'].split('\n'),
            'instructions': r['instructions'].split('\n'),
            'average_rating': review_manager.get_average_rating(r['name'])
        })

    return jsonify({ 'Great Lakes': out,
                     'message': 'Filtered results' if (name_q or ing_q) else 'All recipes' })

@app.route('/suggest-recipes', methods=['GET'])
def suggest_recipes():
    q = request.args.get('q','').lower().strip()
    if not q: return jsonify({'suggestions':[]})
    rows = get_db().execute(
        "SELECT name FROM recipies WHERE LOWER(name) LIKE ? LIMIT 10",
        (f"%{q}%",)
    ).fetchall()
    return jsonify({'suggestions':[r['name'] for r in rows]})

@app.route('/suggest-ingredients', methods=['GET'])
def suggest_ingredients():
    q = request.args.get('q','').lower().strip()
    if not q: return jsonify({'suggestions':[]})
    return jsonify({'suggestions':ingredient_trie.autocomplete(q)[:10]})

@app.route('/import-recipe', methods=['POST'])
def import_recipe():
    data = request.get_json() or {}
    url  = data.get('url')
    if not url:
        return jsonify({"success":False,"error":"No URL provided"}),400

    try:
        scraper      = scrape_me(url)
        name         = scraper.title()
        ingredients  = scraper.ingredients()
        instructions = (scraper.instructions_list()
                        if hasattr(scraper,'instructions_list')
                        else scraper.instructions().split('\n'))

        db = get_db()
        db.execute(
            "INSERT INTO recipies(name,ingredients,instructions) VALUES(?,?,?)",
            (name, '\n'.join(ingredients), '\n'.join(instructions))
        )
        db.commit()

        recipe_trie.insert(name)
        for ing in ingredients:
            for token in re.findall(r"[A-Za-z]+", ing):
                ingredient_trie.insert(token.lower())

        return jsonify({"success":True,
                        "recipe":{"name":name,
                                  "ingredients":ingredients,
                                  "instructions":instructions}})
    except Exception as e:
        return jsonify({"success":False,"error":str(e)}),500

@app.route('/add-review', methods=['POST'])
def add_review():
    data    = request.get_json() or {}
    name    = data.get('recipe_name')
    user    = data.get('username')
    rating  = data.get('rating')
    comment = data.get('comment','')
    if not (name and user and rating):
        return jsonify({'success':False,'error':'Missing fields'}),400
    rating = float(rating)
    if rating<1 or rating>5:
        return jsonify({'success':False,'error':'Rating must be 1–5'}),400

    rev = review_manager.add_review(name,user,rating,comment)
    return jsonify({'success':True,'review':rev})

@app.route('/get-reviews/<recipe_name>', methods=['GET'])
def get_reviews(recipe_name):
    return jsonify({
        'success':True,
        'reviews':review_manager.get_all_reviews(recipe_name),
        'average_rating':review_manager.get_average_rating(recipe_name)
    })

# --- TOP RATED & TRENDING ---

@app.route('/get-top-rated-recipes', methods=['GET'])
def get_top_rated():
    limit = int(request.args.get('limit',10))
    top   = review_manager.get_top_rated_recipes(limit)
    return jsonify({'success':True,'top_recipes':top})

@app.route('/trending', methods=['GET'])
def get_trending():
    # Build max-heap from (avg_rating, name)
    pq = []
    for name, rating in review_manager.get_top_rated_recipes(limit=100):
        heapq.heappush(pq, (-rating, name))
    limit = int(request.args.get('limit',5))
    out = []
    for _ in range(min(limit, len(pq))):
        neg, name = heapq.heappop(pq)
        out.append({'name':name,'average_rating':-neg})
    return jsonify({'success':True,'trending':out})

# --- Auto-scrape & other existing endpoints omitted for brevity ---

if __name__=='__main__':
    app.run(debug=True)
