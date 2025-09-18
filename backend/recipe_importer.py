from recipe_scrapers import scrape_me
from flask import Blueprint, request, jsonify

recipe_importer = Blueprint('recipe_importer', __name__)

@recipe_importer.route('/import-recipe', methods=['POST'])
def import_recipe():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({"success": False, "error": "No URL provided"}), 400
    
    try:
        # Scrape the recipe
        scraper = scrape_me(url)
        
        # Extract recipe data
        recipe = {
            "name": scraper.title(),
            "ingredients": scraper.ingredients(),
            "instructions": scraper.instructions_list() if hasattr(scraper, 'instructions_list') else scraper.instructions().split('\n'),
            "notes": "",  # Add any additional notes here
        }
        
        # You could add logic here to save to your recipes.json file
        # or return it to the frontend for user confirmation
        
        return jsonify({
            "success": True, 
            "recipe": recipe,
            "message": "Recipe successfully imported! You can now add it to your collection."
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
