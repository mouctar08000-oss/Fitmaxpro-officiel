"""
Script pour ajouter des recettes détaillées à tous les plats nutritionnels
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('.env')

# Recettes en français
RECIPES_FR = {
    "Poulet grillé aux légumes": {
        "ingredients": [
            "400g de blanc de poulet",
            "2 courgettes",
            "1 poivron rouge",
            "1 poivron jaune",
            "2 cuillères à soupe d'huile d'olive",
            "2 gousses d'ail émincées",
            "1 cuillère à café d'herbes de Provence",
            "Sel et poivre"
        ],
        "steps": [
            "Préchauffez le four à 200°C",
            "Coupez le poulet en morceaux et les légumes en dés",
            "Mélangez l'huile d'olive, l'ail et les herbes de Provence",
            "Badigeonnez le poulet et les légumes avec le mélange",
            "Disposez sur une plaque de cuisson",
            "Enfournez pendant 25-30 minutes",
            "Retournez à mi-cuisson pour une cuisson uniforme",
            "Servez chaud avec du riz complet"
        ],
        "prep_time": "15 min",
        "cook_time": "30 min",
        "servings": 4
    },
    "Saumon et riz complet": {
        "ingredients": [
            "4 pavés de saumon (150g chacun)",
            "300g de riz complet",
            "2 cuillères à soupe de sauce soja",
            "1 cuillère à soupe de miel",
            "1 citron (jus et zeste)",
            "2 cuillères à soupe d'huile de sésame",
            "Graines de sésame",
            "Ciboulette fraîche"
        ],
        "steps": [
            "Faites cuire le riz complet selon les instructions (environ 40 min)",
            "Mélangez sauce soja, miel, jus de citron et huile de sésame",
            "Faites mariner le saumon 15 minutes dans ce mélange",
            "Chauffez une poêle à feu moyen-vif",
            "Saisissez le saumon 3-4 min de chaque côté",
            "Arrosez régulièrement avec la marinade",
            "Servez sur le riz, parsemé de graines de sésame et ciboulette"
        ],
        "prep_time": "20 min",
        "cook_time": "40 min",
        "servings": 4
    },
    "Omelette protéinée": {
        "ingredients": [
            "4 œufs entiers",
            "4 blancs d'œufs",
            "100g de jambon de dinde",
            "50g de fromage râpé allégé",
            "1 tomate",
            "Quelques feuilles d'épinards",
            "1 cuillère à soupe d'huile d'olive",
            "Sel, poivre, fines herbes"
        ],
        "steps": [
            "Battez les œufs entiers et les blancs d'œufs ensemble",
            "Coupez le jambon en dés et la tomate en morceaux",
            "Chauffez l'huile dans une poêle antiadhésive",
            "Versez les œufs battus et laissez cuire à feu moyen",
            "Quand le dessous est pris, ajoutez jambon, tomate et épinards",
            "Saupoudrez de fromage râpé",
            "Pliez l'omelette en deux et laissez fondre le fromage",
            "Servez immédiatement avec des fines herbes"
        ],
        "prep_time": "10 min",
        "cook_time": "8 min",
        "servings": 2
    },
    "Bowl de quinoa aux légumineuses": {
        "ingredients": [
            "200g de quinoa",
            "1 boîte de pois chiches (400g)",
            "1 boîte de haricots rouges (400g)",
            "1 avocat",
            "1 concombre",
            "200g de tomates cerises",
            "Jus de 2 citrons",
            "4 cuillères à soupe d'huile d'olive",
            "Coriandre fraîche"
        ],
        "steps": [
            "Rincez et faites cuire le quinoa (15-20 min)",
            "Égouttez et rincez les pois chiches et haricots",
            "Coupez l'avocat, le concombre et les tomates",
            "Préparez la vinaigrette : citron, huile d'olive, sel",
            "Dans un bol, disposez le quinoa refroidi",
            "Ajoutez les légumineuses et les légumes frais",
            "Arrosez de vinaigrette",
            "Parsemez de coriandre fraîche et servez"
        ],
        "prep_time": "15 min",
        "cook_time": "20 min",
        "servings": 4
    },
    "Steak de thon et légumes vapeur": {
        "ingredients": [
            "4 steaks de thon (150g chacun)",
            "300g de brocolis",
            "200g de haricots verts",
            "2 carottes",
            "3 cuillères à soupe de sauce soja",
            "1 cuillère à soupe de gingembre râpé",
            "2 gousses d'ail",
            "Huile de sésame"
        ],
        "steps": [
            "Préparez la marinade : sauce soja, gingembre, ail",
            "Faites mariner le thon 30 minutes au frais",
            "Coupez les légumes en morceaux",
            "Faites cuire les légumes à la vapeur 15 minutes",
            "Saisissez le thon 2 min de chaque côté (rosé au centre)",
            "Disposez les légumes vapeur dans l'assiette",
            "Posez le thon dessus",
            "Arrosez d'un filet d'huile de sésame"
        ],
        "prep_time": "35 min",
        "cook_time": "20 min",
        "servings": 4
    },
    "Salade de poulet grillé": {
        "ingredients": [
            "400g de blanc de poulet",
            "200g de mesclun",
            "1 avocat",
            "100g de tomates cerises",
            "50g de noix",
            "50g de parmesan",
            "Vinaigrette balsamique",
            "Sel, poivre"
        ],
        "steps": [
            "Assaisonnez et grillez le poulet 6-7 min de chaque côté",
            "Laissez reposer 5 minutes puis tranchez",
            "Lavez et séchez le mesclun",
            "Coupez l'avocat et les tomates",
            "Disposez le mesclun dans les assiettes",
            "Ajoutez le poulet tranché, avocat et tomates",
            "Parsemez de noix et copeaux de parmesan",
            "Arrosez de vinaigrette et servez"
        ],
        "prep_time": "15 min",
        "cook_time": "15 min",
        "servings": 4
    },
    "Smoothie protéiné banane-beurre de cacahuète": {
        "ingredients": [
            "2 bananes mûres",
            "2 cuillères à soupe de beurre de cacahuète",
            "30g de protéine whey vanille",
            "400ml de lait d'amande",
            "1 cuillère à soupe de miel",
            "Quelques glaçons",
            "Cannelle (optionnel)"
        ],
        "steps": [
            "Pelez les bananes et coupez-les en morceaux",
            "Mettez tous les ingrédients dans un blender",
            "Mixez à haute vitesse pendant 1-2 minutes",
            "Ajoutez des glaçons si vous le souhaitez plus frais",
            "Goûtez et ajustez le miel si nécessaire",
            "Versez dans de grands verres",
            "Saupoudrez de cannelle",
            "Servez immédiatement"
        ],
        "prep_time": "5 min",
        "cook_time": "0 min",
        "servings": 2
    },
    "Wrap de dinde aux crudités": {
        "ingredients": [
            "4 grandes tortillas complètes",
            "300g de blanc de dinde tranché",
            "1 laitue iceberg",
            "2 tomates",
            "1 concombre",
            "100g de fromage frais allégé",
            "Moutarde à l'ancienne",
            "Sel, poivre"
        ],
        "steps": [
            "Lavez et émincez la laitue finement",
            "Coupez les tomates et le concombre en fines rondelles",
            "Tartinez chaque tortilla de fromage frais et moutarde",
            "Répartissez la laitue sur les tortillas",
            "Ajoutez les tranches de dinde",
            "Disposez tomates et concombre",
            "Assaisonnez de sel et poivre",
            "Roulez fermement et coupez en deux en diagonale"
        ],
        "prep_time": "10 min",
        "cook_time": "0 min",
        "servings": 4
    }
}

# Recettes en anglais
RECIPES_EN = {
    "Grilled Chicken with Vegetables": {
        "ingredients": [
            "400g chicken breast",
            "2 zucchinis",
            "1 red bell pepper",
            "1 yellow bell pepper",
            "2 tablespoons olive oil",
            "2 minced garlic cloves",
            "1 teaspoon herbs de Provence",
            "Salt and pepper"
        ],
        "steps": [
            "Preheat oven to 400°F (200°C)",
            "Cut chicken into pieces and vegetables into cubes",
            "Mix olive oil, garlic and herbs",
            "Brush chicken and vegetables with the mixture",
            "Arrange on a baking sheet",
            "Bake for 25-30 minutes",
            "Turn halfway through for even cooking",
            "Serve hot with brown rice"
        ],
        "prep_time": "15 min",
        "cook_time": "30 min",
        "servings": 4
    },
    "Salmon with Brown Rice": {
        "ingredients": [
            "4 salmon fillets (150g each)",
            "300g brown rice",
            "2 tablespoons soy sauce",
            "1 tablespoon honey",
            "1 lemon (juice and zest)",
            "2 tablespoons sesame oil",
            "Sesame seeds",
            "Fresh chives"
        ],
        "steps": [
            "Cook brown rice according to instructions (about 40 min)",
            "Mix soy sauce, honey, lemon juice and sesame oil",
            "Marinate salmon for 15 minutes in the mixture",
            "Heat a pan over medium-high heat",
            "Sear salmon 3-4 min per side",
            "Baste regularly with marinade",
            "Serve over rice, sprinkled with sesame seeds and chives"
        ],
        "prep_time": "20 min",
        "cook_time": "40 min",
        "servings": 4
    },
    "Protein Omelette": {
        "ingredients": [
            "4 whole eggs",
            "4 egg whites",
            "100g turkey ham",
            "50g low-fat grated cheese",
            "1 tomato",
            "A few spinach leaves",
            "1 tablespoon olive oil",
            "Salt, pepper, fine herbs"
        ],
        "steps": [
            "Beat whole eggs and egg whites together",
            "Cut ham into cubes and tomato into pieces",
            "Heat oil in a non-stick pan",
            "Pour in beaten eggs and cook over medium heat",
            "When bottom is set, add ham, tomato and spinach",
            "Sprinkle with grated cheese",
            "Fold omelette in half and let cheese melt",
            "Serve immediately with fine herbs"
        ],
        "prep_time": "10 min",
        "cook_time": "8 min",
        "servings": 2
    },
    "Quinoa Bowl with Legumes": {
        "ingredients": [
            "200g quinoa",
            "1 can chickpeas (400g)",
            "1 can red beans (400g)",
            "1 avocado",
            "1 cucumber",
            "200g cherry tomatoes",
            "Juice of 2 lemons",
            "4 tablespoons olive oil",
            "Fresh cilantro"
        ],
        "steps": [
            "Rinse and cook quinoa (15-20 min)",
            "Drain and rinse chickpeas and beans",
            "Cut avocado, cucumber and tomatoes",
            "Prepare dressing: lemon, olive oil, salt",
            "Place cooled quinoa in a bowl",
            "Add legumes and fresh vegetables",
            "Drizzle with dressing",
            "Garnish with fresh cilantro and serve"
        ],
        "prep_time": "15 min",
        "cook_time": "20 min",
        "servings": 4
    },
    "Tuna Steak with Steamed Vegetables": {
        "ingredients": [
            "4 tuna steaks (150g each)",
            "300g broccoli",
            "200g green beans",
            "2 carrots",
            "3 tablespoons soy sauce",
            "1 tablespoon grated ginger",
            "2 garlic cloves",
            "Sesame oil"
        ],
        "steps": [
            "Prepare marinade: soy sauce, ginger, garlic",
            "Marinate tuna for 30 minutes in the fridge",
            "Cut vegetables into pieces",
            "Steam vegetables for 15 minutes",
            "Sear tuna 2 min per side (pink in center)",
            "Arrange steamed vegetables on plate",
            "Place tuna on top",
            "Drizzle with sesame oil"
        ],
        "prep_time": "35 min",
        "cook_time": "20 min",
        "servings": 4
    },
    "Grilled Chicken Salad": {
        "ingredients": [
            "400g chicken breast",
            "200g mixed greens",
            "1 avocado",
            "100g cherry tomatoes",
            "50g walnuts",
            "50g parmesan",
            "Balsamic vinaigrette",
            "Salt, pepper"
        ],
        "steps": [
            "Season and grill chicken 6-7 min per side",
            "Let rest 5 minutes then slice",
            "Wash and dry mixed greens",
            "Cut avocado and tomatoes",
            "Arrange greens on plates",
            "Add sliced chicken, avocado and tomatoes",
            "Sprinkle with walnuts and parmesan shavings",
            "Drizzle with vinaigrette and serve"
        ],
        "prep_time": "15 min",
        "cook_time": "15 min",
        "servings": 4
    },
    "Protein Smoothie Banana-Peanut Butter": {
        "ingredients": [
            "2 ripe bananas",
            "2 tablespoons peanut butter",
            "30g vanilla whey protein",
            "400ml almond milk",
            "1 tablespoon honey",
            "Ice cubes",
            "Cinnamon (optional)"
        ],
        "steps": [
            "Peel bananas and cut into pieces",
            "Put all ingredients in a blender",
            "Blend on high speed for 1-2 minutes",
            "Add ice cubes if you want it colder",
            "Taste and adjust honey if needed",
            "Pour into tall glasses",
            "Sprinkle with cinnamon",
            "Serve immediately"
        ],
        "prep_time": "5 min",
        "cook_time": "0 min",
        "servings": 2
    },
    "Turkey Wrap with Raw Vegetables": {
        "ingredients": [
            "4 large whole wheat tortillas",
            "300g sliced turkey breast",
            "1 iceberg lettuce",
            "2 tomatoes",
            "1 cucumber",
            "100g low-fat cream cheese",
            "Whole grain mustard",
            "Salt, pepper"
        ],
        "steps": [
            "Wash and finely shred the lettuce",
            "Cut tomatoes and cucumber into thin slices",
            "Spread cream cheese and mustard on each tortilla",
            "Distribute lettuce on tortillas",
            "Add turkey slices",
            "Arrange tomatoes and cucumber",
            "Season with salt and pepper",
            "Roll tightly and cut diagonally in half"
        ],
        "prep_time": "10 min",
        "cook_time": "0 min",
        "servings": 4
    }
}

# Recette par défaut pour les plats non reconnus
DEFAULT_RECIPE_FR = {
    "ingredients": [
        "Voir les informations nutritionnelles ci-dessus",
        "Adaptez les quantités selon vos besoins"
    ],
    "steps": [
        "Préparez tous les ingrédients",
        "Suivez une méthode de cuisson saine (grillé, vapeur, four)",
        "Assaisonnez selon vos goûts",
        "Servez chaud"
    ],
    "prep_time": "15 min",
    "cook_time": "20 min",
    "servings": 2
}

DEFAULT_RECIPE_EN = {
    "ingredients": [
        "See nutritional information above",
        "Adjust quantities according to your needs"
    ],
    "steps": [
        "Prepare all ingredients",
        "Use a healthy cooking method (grilled, steamed, baked)",
        "Season to taste",
        "Serve hot"
    ],
    "prep_time": "15 min",
    "cook_time": "20 min",
    "servings": 2
}

async def add_recipes():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Get all supplements
    supplements = await db.supplements.find({}).to_list(100)
    
    updated_count = 0
    
    for supplement in supplements:
        language = supplement.get("language", "fr")
        meals = supplement.get("meals", [])
        
        if not meals:
            continue
            
        recipes_dict = RECIPES_FR if language == "fr" else RECIPES_EN
        default_recipe = DEFAULT_RECIPE_FR if language == "fr" else DEFAULT_RECIPE_EN
        
        updated = False
        for meal in meals:
            meal_name = meal.get("name", "")
            
            # Try to find a matching recipe
            recipe = None
            for recipe_name, recipe_data in recipes_dict.items():
                if recipe_name.lower() in meal_name.lower() or meal_name.lower() in recipe_name.lower():
                    recipe = recipe_data
                    break
            
            # Use default if no match
            if not recipe:
                recipe = default_recipe.copy()
            
            meal["recipe"] = recipe
            updated = True
        
        if updated:
            await db.supplements.update_one(
                {"supplement_id": supplement["supplement_id"]},
                {"$set": {"meals": meals}}
            )
            updated_count += 1
            print(f"Updated {supplement.get('title', supplement['supplement_id'])} - {len(meals)} meals")
    
    print(f"\n✅ Added recipes to {updated_count} supplements")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_recipes())
