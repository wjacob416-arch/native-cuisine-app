import sqlite3
import time
import requests
from bs4 import BeautifulSoup
from recipe_scrapers import scrape_me

class RecipeScraper:
    """
    Scrapes recipes and persists them into a SQLite database table 'recipies'.
    Filters for Native American relevance before saving.
    """

    def __init__(self, db_path):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        # Ensure name uniqueness by creating an index
        self.conn.execute(
            'CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_name ON recipies(name)'
        )
        self.conn.commit()

    def recipe_exists(self, name):
        cur = self.conn.execute(
            'SELECT 1 FROM recipies WHERE name = ?', (name,)
        )
        return cur.fetchone() is not None

    def save_recipe(self, recipe):
        """Insert a recipe into the database if not already present."""
        if self.recipe_exists(recipe['name']):
            return False
        self.conn.execute(
            'INSERT INTO recipies(name, ingredients, instructions) VALUES (?, ?, ?)',
            (
                recipe['name'],
                '\n'.join(recipe['ingredients']),
                '\n'.join(recipe['instructions'])
            )
        )
        self.conn.commit()
        return True

    def is_native_american_recipe(self, recipe_data):
        # (same filtering logic as before)
        keywords = [
            'native american', 'indigenous', 'tribal', 'first nations',
            'wild rice', 'three sisters', 'succotash', 'pemmican', 'wojapi',
            'bannock', 'fry bread', 'venison', 'elk', 'bison', 'buffalo',
            'sumac', 'sage', 'cranberry', 'blueberry'
        ]
        title = recipe_data.get('name', '').lower()
        if any(k in title for k in keywords):
            return True
        ingredients_text = ' '.join(recipe_data.get('ingredients', [])).lower()
        return any(k in ingredients_text for k in keywords)

    def extract_ingredients_from_soup(self, soup):
        # (unchanged extraction logic)
        ...

    def extract_instructions_from_soup(self, soup):
        # (unchanged extraction logic)
        ...

    def scrape_recipe(self, url):
        """Scrape a single recipe, filter, and return it or None."""
        try:
            scraper = scrape_me(url, wild_mode=True)
            recipe = {
                'name': scraper.title(),
                'ingredients': scraper.ingredients(),
                'instructions': (
                    scraper.instructions_list()
                    if hasattr(scraper, 'instructions_list')
                    else scraper.instructions().split('\n')
                )
            }
        except Exception:
            # fallback to BeautifulSoup
            resp = requests.get(url)
            soup = BeautifulSoup(resp.text, 'html.parser')
            title_elem = soup.select_one('h1')
            recipe = {
                'name': title_elem.text.strip() if title_elem else 'Unknown',
                'ingredients': self.extract_ingredients_from_soup(soup),
                'instructions': self.extract_instructions_from_soup(soup)
            }

        if self.is_native_american_recipe(recipe):
            return recipe
        return None

    def scrape_recipes_from_urls(self, urls):
        """Scrape and save multiple URLs into the database."""
        added = []
        for url in urls:
            time.sleep(1)
            rec = self.scrape_recipe(url)
            if rec and self.save_recipe(rec):
                added.append(rec)
        return added

    def scrape_search_results(self, search_urls, max_recipes=50):
        """Search, scrape, and save up to max_recipes recipes."""
        links = []
        for url in search_urls:
            # extract links based on domain
            if 'allrecipes.com' in url:
                links += self.extract_recipe_links_from_allrecipes(url)
            # add other domains...
            time.sleep(2)
        # include additional hardcoded Native American URLs...
        links = list(dict.fromkeys(links))[:max_recipes]

        return self.scrape_recipes_from_urls(links)
