-- Drop any existing tables so we start fresh
DROP TABLE IF EXISTS recipies;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS tasks;

-- Recipes table
CREATE TABLE recipies (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    ingredients  TEXT    NOT NULL,
    instructions TEXT    NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_name  TEXT    NOT NULL,
    username     TEXT    NOT NULL,
    rating       REAL    NOT NULL,
    comment      TEXT,
    timestamp    REAL    NOT NULL
);

-- Tasks table (for priority‐queue scheduling)
CREATE TABLE tasks (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    priority  INTEGER    NOT NULL,
    payload   TEXT       NOT NULL,
    status    TEXT       NOT NULL DEFAULT 'pending',
    created   TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial recipes
INSERT INTO recipies(name, ingredients, instructions) 
VALUES(
    'Creamy Potato & Wild Rice Soup',
    '6 strips bacon,
1 small onion, chopped,
2 C. washed and fully cooked Red Lake Nation Wild Rice,
3 C. Chicken Stock,
2 cans (10.75 oz.) Cream of Potato soup,
2 C. half & half,
1/2 C. sliced fresh mushrooms,
2 C. shredded cheddar cheese',
    'Combine all ingredients (except cheese & half & half) in a 3-quart saucepan or Dutch oven.
Simmer for about 20–30 minutes.
Turn off heat and gently pour in half & half.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Wild Rice Bread by Polly Rohde',
    '1 1/2 C. Buttermilk,
1/4 C. Oil,
1/4 C. Honey,
2 tsp. Salt,
1/2 tsp. Baking Soda,
3 1/2 C. Bread Flour (White),
1/2 C. Red Lake Nation Wild Rice Flour,
1/4 C. Wheat Germ,
1 1/4 tsp. Yeast,
4 tsp. Wheat Gluten,
1 C. Red Lake Nation Soup Bits (Cooked & cooled to room temperature)',
    'Place all ingredients, except wild rice, in bread machine according to manufacturer''s instructions.
Set machine to ''Basic Setting'' and 2# loaf size OR choose dough cycle.
Add cooked wild rice after dough has formed.
If using dough cycle, take dough out when finished and place in a greased loaf pan.
Let rise in a warm place until doubled in size.
Bake at 350°F for approximately 45 minutes or until bread sounds hollow when tapped.
Take out of pan and cool on a rack.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Wild Rice Stuffed Peppers',
    '1/2 C. Red Lake Nation Wild Rice, cooked,
4 Tbsp. butter,
1/4 C. diced red bell pepper,
1/4 C. diced yellow bell pepper,
1/4 C. diced orange bell pepper,
1/4 C. diced green onion,
1 C. vegetable stock,
1 C. bread cubes, dried,
1 Tbsp. fresh sage, chopped or 1 tsp. poultry seasoning,
3 bell peppers, halved & seeded,
4 oz. light cream cheese,
1 Tbsp. light sour cream,
1/4 C. Parmesan cheese, shredded',
    'Preheat the oven to 350°F. Chop the onion & bell peppers.
Melt butter in sauté pan on stove & sauté onions & peppers until tender-crisp. Add stock, bring to boil.
Remove from heat, add bread cubes & seasonings. Toss together to make stuffing.
Add softened cream cheese and Parmesan cheese. Mix well.
Stuff pepper halves with mixture, sprinkle with additional Parmesan, and bake 45 minutes or until browned on top & pepper is cooked through.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Small Batch Wild Blueberry Lime Jam',
    '4 C. wild blueberries,
1 C. granulated sugar,
zest of 2 limes,
1/4 C. lime juice,
pinch of salt',
    'Rinse fruit and pat dry. In a medium saucepan combine berries, sugar, salt, lime juice & zest.
Cook over medium heat until it reaches a low boil. Stir constantly and mash fruit with a potato masher.
Simmer for 25–30 minutes. Ladle into sterilized 8-oz jars, cover with clean lids & bands.
Process in a water bath for 10 minutes. Or refrigerate (consume within 14 days).
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Venison Chili',
    '1 lb. venison or ground turkey,
1 medium onion, chopped,
3 cloves garlic, minced,
1 tsp. pepper,
2 cans (14.5 oz.) diced tomatoes,
2 cans (14.5 oz.) chili beans,
1 can (14.5 oz.) tomato sauce,
3 Tbsp. chili powder,
1/2 C. brown sugar',
    'Coat large soup pot with a small amount of oil.
Brown the meat; drain grease.
Add onion, garlic, and pepper; sauté for a few minutes.
Add tomatoes, beans, sauce, chili powder, and brown sugar; stir.
Simmer 20 minutes, stirring occasionally. Season to taste.
Serve with cheese, sour cream, chives.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Maple Cinnamon Iced Tea',
    '4 C. water,
4 cinnamon sticks,
3 Tbsp. maple syrup,
2 whole nutmeg,
3 Lipton black tea bags',
    'Pour water, cinnamon, nutmeg, and syrup into saucepan.
Bring to a high boil; stir occasionally.
Remove from heat; add tea bags; steep 3–4 minutes.
Remove solids; pour into pitcher and chill.
Serve over ice.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Berry Wild Rice Breakfast',
    '3/4 C. blueberries, blackberries, raspberries,
1 Tbsp. butter,
1 C. cooked wild rice,
1/4 tsp. cinnamon,
salt and maple syrup to taste',
    'Melt butter in pan over low heat.
Add berries; cook 2 minutes.
Add rice, cinnamon, salt, and maple syrup; heat through.
Serve warm in a bowl.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Sumas Lemonade',
    'Sumac berries,
Water,
(Optional) Maple syrup or honey',
    'Add sumac to water; stir. Bring to simmer; remove from heat and let steep 20–60 minutes.
Strain out sumac; sweeten with maple syrup or honey to taste.
Serve chilled.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Apple Spinach Salad',
    '4 C. spinach leaves,
2 Tbsp. canola oil,
2 1/2 Tbsp. cider vinegar,
1 Tbsp. sugar,
1/4 tsp. salt,
1/4 C. red onion, chopped,
1 tart apple, bite-sized chunks,
1/4 C. dried berries',
    'Wash and dry spinach; tear into bite-sized pieces.
Whisk oil, vinegar, sugar, and salt; add apple, onion, and berries; let stand 10 minutes.
Toss with spinach and serve.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Toasted Pumpkin Seeds',
    '2 C. pumpkin seeds, cleaned,
2 Tbsp. olive oil,
1 Tbsp. salt',
    'Preheat oven to 325°F.
Toss seeds with oil and salt; spread on baking sheet.
Bake 45 minutes, stirring occasionally, until lightly toasted.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Curried Squash Soup',
    '5 lb. winter squash (e.g. Gete-okosoman), peeled and cubed,
1/2 Tbsp. oil,
1 medium onion, diced,
1 apple, peeled & diced,
1/2 tsp. curry powder,
1/4 tsp. cumin,
3/4 tsp. Worcestershire sauce,
1 C. vegetable stock,
3/4 C. whole milk,
Salt, pepper, cayenne, honey to taste',
    'Puree half the squash in blender.
Sauté onion, apple, and garlic in oil until softened (10 minutes); add to squash.
Stir in seasonings, stock, and milk; bring to boil.
Reduce heat; simmer 20 minutes. Adjust seasoning and serve.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Cactus Preserves',
    '2 qt. prickly pears, peeled, seeds removed,
1 slice orange (1/4" thick),
1 1/2 C. sugar,
2/3 C. water,
2 1/2 Tbsp. lemon juice',
    'Measure pears; peel, halve, and seed.
Cook pears and orange slice in syrup of sugar, water, and lemon juice until transparent.
Remove orange; pack preserves into sterile jars and seal.
'
);

INSERT INTO recipies(name, ingredients, instructions)
VALUES(
    'Cactus Date Conserve',
    '2 C. sliced prickly pear fruit (seeds removed),
18 dates, chopped & pitted,
Juice & rind of 1 orange,
2 slices canned pineapple, chopped,
4 tsp. lemon juice,
1/2 C. pineapple juice,
1 1/2 C. sugar,
1/3 C. broken walnut meats',
    'Combine all except walnuts; cook slowly in heavy pan until jam-like (≈5 minutes).
Stir in walnuts 5 minutes before end; pack into sterile jars and seal.
'
);
