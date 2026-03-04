"""
Script pour ajouter 20+ repas et recettes pour chaque plan nutritionnel
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

# ==================== REPAS PRISE DE MASSE (FR) ====================
mass_gain_meals_fr = [
    # Petits déjeuners
    {
        "name": "Bowl Protéiné au Fromage Blanc",
        "description": "Fromage blanc riche en protéines avec fruits et granola",
        "calories": 650,
        "protein": 45,
        "carbs": 70,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg",
        "recipe": {
            "ingredients": [
                "400g fromage blanc 0%",
                "1 banane",
                "100g granola",
                "30g miel",
                "50g myrtilles",
                "30g amandes effilées"
            ],
            "steps": [
                "Verser le fromage blanc dans un grand bol",
                "Couper la banane en rondelles",
                "Ajouter le granola et les myrtilles",
                "Arroser de miel",
                "Parsemer d'amandes effilées",
                "Servir immédiatement"
            ],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Omelette 6 Oeufs Complète",
        "description": "Omelette XXL avec légumes et fromage pour maximum de protéines",
        "calories": 720,
        "protein": 52,
        "carbs": 15,
        "fat": 48,
        "image_url": "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
        "recipe": {
            "ingredients": [
                "6 oeufs entiers",
                "100g jambon",
                "50g gruyère râpé",
                "1 poivron",
                "100g champignons",
                "Sel, poivre, herbes"
            ],
            "steps": [
                "Battre les oeufs avec sel et poivre",
                "Faire revenir les légumes à la poêle",
                "Ajouter le jambon coupé en dés",
                "Verser les oeufs battus",
                "Cuire à feu moyen 5 minutes",
                "Ajouter le fromage, plier et servir"
            ],
            "prep_time": "10 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Pancakes Protéinés Banane",
        "description": "Pancakes moelleux enrichis en protéines",
        "calories": 580,
        "protein": 40,
        "carbs": 65,
        "fat": 16,
        "image_url": "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
        "recipe": {
            "ingredients": [
                "100g flocons d'avoine",
                "2 bananes mûres",
                "4 oeufs",
                "30g whey vanille",
                "1 cuillère de cannelle",
                "Sirop d'érable pour servir"
            ],
            "steps": [
                "Mixer les flocons d'avoine en farine",
                "Écraser les bananes dans un bol",
                "Ajouter les oeufs et la whey",
                "Mélanger jusqu'à consistance lisse",
                "Cuire les pancakes à la poêle",
                "Servir avec sirop d'érable"
            ],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Smoothie Gainer Chocolat",
        "description": "Shake hypercalorique pour prise de masse rapide",
        "calories": 850,
        "protein": 50,
        "carbs": 95,
        "fat": 28,
        "image_url": "https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg",
        "recipe": {
            "ingredients": [
                "500ml lait entier",
                "2 bananes",
                "60g whey chocolat",
                "50g beurre de cacahuète",
                "50g flocons d'avoine",
                "1 cuillère de cacao"
            ],
            "steps": [
                "Verser le lait dans le blender",
                "Ajouter les bananes coupées",
                "Incorporer la whey et le beurre de cacahuète",
                "Ajouter les flocons d'avoine et le cacao",
                "Mixer pendant 2 minutes",
                "Servir frais"
            ],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    # Déjeuners
    {
        "name": "Poulet Grillé Riz Complet",
        "description": "Classique de la prise de masse: poulet et riz",
        "calories": 750,
        "protein": 55,
        "carbs": 80,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg",
        "recipe": {
            "ingredients": [
                "300g blanc de poulet",
                "200g riz complet cuit",
                "150g brocolis",
                "2 cuillères huile d'olive",
                "Épices cajun",
                "Sauce soja"
            ],
            "steps": [
                "Cuire le riz selon les instructions",
                "Assaisonner le poulet avec les épices",
                "Griller le poulet 6 min de chaque côté",
                "Cuire les brocolis à la vapeur",
                "Dresser le riz, le poulet tranché et les brocolis",
                "Arroser de sauce soja"
            ],
            "prep_time": "10 min",
            "cook_time": "25 min"
        }
    },
    {
        "name": "Steak Haché Patates Douces",
        "description": "Combo viande rouge et glucides complexes",
        "calories": 820,
        "protein": 48,
        "carbs": 70,
        "fat": 35,
        "image_url": "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        "recipe": {
            "ingredients": [
                "250g steak haché 15%",
                "300g patates douces",
                "100g haricots verts",
                "1 oignon",
                "2 gousses d'ail",
                "Huile d'olive, sel, poivre"
            ],
            "steps": [
                "Couper les patates en cubes et rôtir 25 min",
                "Former 2 steaks avec la viande hachée",
                "Cuire les steaks selon préférence",
                "Faire sauter l'oignon et l'ail",
                "Cuire les haricots verts à la vapeur",
                "Assembler tous les éléments"
            ],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    {
        "name": "Saumon Quinoa Avocat",
        "description": "Repas riche en oméga-3 et protéines",
        "calories": 780,
        "protein": 45,
        "carbs": 55,
        "fat": 42,
        "image_url": "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg",
        "recipe": {
            "ingredients": [
                "200g pavé de saumon",
                "150g quinoa cuit",
                "1 avocat",
                "Jus de citron",
                "Graines de sésame",
                "Sauce teriyaki"
            ],
            "steps": [
                "Cuire le quinoa selon les instructions",
                "Assaisonner le saumon avec sel et poivre",
                "Cuire le saumon à la poêle 4 min par côté",
                "Couper l'avocat en tranches",
                "Dresser le quinoa, saumon et avocat",
                "Arroser de sauce teriyaki et citron"
            ],
            "prep_time": "10 min",
            "cook_time": "20 min"
        }
    },
    {
        "name": "Pasta Bolognaise Maison",
        "description": "Pâtes complètes avec sauce viande maison",
        "calories": 850,
        "protein": 48,
        "carbs": 90,
        "fat": 28,
        "image_url": "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
        "recipe": {
            "ingredients": [
                "200g pâtes complètes",
                "250g viande hachée boeuf",
                "400g sauce tomate",
                "1 oignon, 2 carottes",
                "Parmesan râpé",
                "Herbes italiennes"
            ],
            "steps": [
                "Faire revenir l'oignon et les carottes",
                "Ajouter la viande et faire dorer",
                "Incorporer la sauce tomate et les herbes",
                "Laisser mijoter 20 minutes",
                "Cuire les pâtes al dente",
                "Mélanger et servir avec parmesan"
            ],
            "prep_time": "15 min",
            "cook_time": "35 min"
        }
    },
    {
        "name": "Bowl Thon Riz Édamame",
        "description": "Bol japonais riche en protéines",
        "calories": 680,
        "protein": 52,
        "carbs": 65,
        "fat": 22,
        "image_url": "https://images.pexels.com/photos/8697540/pexels-photo-8697540.jpeg",
        "recipe": {
            "ingredients": [
                "200g thon en conserve",
                "200g riz à sushi cuit",
                "100g édamame",
                "1 avocat",
                "Sauce soja, wasabi",
                "Graines de sésame"
            ],
            "steps": [
                "Cuire le riz à sushi",
                "Égoutter le thon",
                "Cuire les édamame",
                "Trancher l'avocat",
                "Assembler dans un bol",
                "Assaisonner avec sauce soja et sésame"
            ],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Curry Poulet Lentilles",
        "description": "Plat épicé riche en protéines végétales et animales",
        "calories": 720,
        "protein": 55,
        "carbs": 60,
        "fat": 25,
        "image_url": "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg",
        "recipe": {
            "ingredients": [
                "250g poulet",
                "150g lentilles corail",
                "400ml lait de coco",
                "2 cuillères pâte de curry",
                "Riz basmati",
                "Coriandre fraîche"
            ],
            "steps": [
                "Faire revenir le poulet coupé en morceaux",
                "Ajouter la pâte de curry",
                "Incorporer les lentilles et le lait de coco",
                "Laisser mijoter 20 minutes",
                "Cuire le riz séparément",
                "Servir avec coriandre fraîche"
            ],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    # Dîners
    {
        "name": "Entrecôte Purée Maison",
        "description": "Viande rouge premium avec purée crémeuse",
        "calories": 900,
        "protein": 55,
        "carbs": 50,
        "fat": 52,
        "image_url": "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg",
        "recipe": {
            "ingredients": [
                "250g entrecôte",
                "400g pommes de terre",
                "100ml crème fraîche",
                "50g beurre",
                "Fleur de sel",
                "Poivre du moulin"
            ],
            "steps": [
                "Cuire les pommes de terre 25 min",
                "Les écraser avec beurre et crème",
                "Sortir la viande 30 min avant cuisson",
                "Saisir l'entrecôte à feu vif",
                "Cuire 3-4 min par côté selon préférence",
                "Laisser reposer 5 min et servir"
            ],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    {
        "name": "Dinde Rôtie Légumes Grillés",
        "description": "Repas complet à haute teneur en protéines",
        "calories": 650,
        "protein": 58,
        "carbs": 35,
        "fat": 28,
        "image_url": "https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg",
        "recipe": {
            "ingredients": [
                "300g escalope de dinde",
                "200g courgettes",
                "200g poivrons",
                "100g oignons",
                "Herbes de Provence",
                "Huile d'olive"
            ],
            "steps": [
                "Préchauffer le four à 200°C",
                "Couper les légumes en morceaux",
                "Les disposer sur une plaque avec huile",
                "Assaisonner la dinde",
                "Enfourner le tout 25 minutes",
                "Servir chaud"
            ],
            "prep_time": "15 min",
            "cook_time": "25 min"
        }
    },
    {
        "name": "Burger Maison Double",
        "description": "Double steak avec cheddar fondant",
        "calories": 950,
        "protein": 60,
        "carbs": 55,
        "fat": 55,
        "image_url": "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
        "recipe": {
            "ingredients": [
                "300g steak haché",
                "2 tranches cheddar",
                "1 pain burger complet",
                "Tomate, salade, oignon",
                "Sauce burger",
                "Cornichons"
            ],
            "steps": [
                "Former 2 steaks de 150g",
                "Cuire les steaks 4 min par côté",
                "Ajouter le cheddar pour fondre",
                "Toaster le pain légèrement",
                "Monter le burger avec garnitures",
                "Servir avec frites maison"
            ],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Tacos au Boeuf Maison",
        "description": "Tacos riches en protéines",
        "calories": 780,
        "protein": 48,
        "carbs": 60,
        "fat": 38,
        "image_url": "https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg",
        "recipe": {
            "ingredients": [
                "300g viande hachée",
                "4 tortillas de maïs",
                "100g fromage râpé",
                "Guacamole, salsa",
                "Crème fraîche",
                "Épices mexicaines"
            ],
            "steps": [
                "Cuire la viande avec les épices",
                "Chauffer les tortillas",
                "Préparer le guacamole",
                "Garnir les tortillas de viande",
                "Ajouter fromage et garnitures",
                "Servir avec salsa et crème"
            ],
            "prep_time": "20 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Wok Crevettes Nouilles",
        "description": "Wok asiatique protéiné",
        "calories": 700,
        "protein": 45,
        "carbs": 70,
        "fat": 25,
        "image_url": "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg",
        "recipe": {
            "ingredients": [
                "250g crevettes décortiquées",
                "200g nouilles aux oeufs",
                "Légumes wok (150g)",
                "Sauce soja, huile sésame",
                "Gingembre, ail",
                "Oignons verts"
            ],
            "steps": [
                "Cuire les nouilles et réserver",
                "Faire sauter les crevettes",
                "Ajouter les légumes",
                "Incorporer les nouilles",
                "Assaisonner avec sauces",
                "Servir chaud garni d'oignons"
            ],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    # Collations
    {
        "name": "Shake Post-Training",
        "description": "Récupération optimale après l'entraînement",
        "calories": 450,
        "protein": 40,
        "carbs": 50,
        "fat": 10,
        "image_url": "https://images.pexels.com/photos/3625713/pexels-photo-3625713.jpeg",
        "recipe": {
            "ingredients": [
                "400ml lait écrémé",
                "50g whey vanille",
                "1 banane",
                "30g miel",
                "Glaçons"
            ],
            "steps": [
                "Verser le lait dans le blender",
                "Ajouter la whey et la banane",
                "Incorporer le miel",
                "Mixer avec glaçons",
                "Boire dans les 30 min post-training"
            ],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Toast Avocat Oeufs",
        "description": "Collation protéinée et lipides sains",
        "calories": 480,
        "protein": 22,
        "carbs": 35,
        "fat": 30,
        "image_url": "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg",
        "recipe": {
            "ingredients": [
                "2 tranches pain complet",
                "1 avocat mûr",
                "2 oeufs",
                "Piment d'Espelette",
                "Sel, poivre",
                "Graines de sésame"
            ],
            "steps": [
                "Toaster le pain",
                "Écraser l'avocat et assaisonner",
                "Pocher ou cuire les oeufs",
                "Tartiner l'avocat sur le pain",
                "Déposer les oeufs dessus",
                "Saupoudrer de graines"
            ],
            "prep_time": "5 min",
            "cook_time": "5 min"
        }
    },
    {
        "name": "Yaourt Grec Muesli Fruits",
        "description": "Snack protéiné et énergétique",
        "calories": 420,
        "protein": 25,
        "carbs": 50,
        "fat": 12,
        "image_url": "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
        "recipe": {
            "ingredients": [
                "250g yaourt grec",
                "60g muesli",
                "100g fruits frais",
                "20g miel",
                "Noix concassées"
            ],
            "steps": [
                "Verser le yaourt dans un bol",
                "Ajouter le muesli",
                "Disposer les fruits frais",
                "Arroser de miel",
                "Parsemer de noix"
            ],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Cottage Cheese Fruits Secs",
        "description": "Caséine et bons lipides avant la nuit",
        "calories": 380,
        "protein": 35,
        "carbs": 25,
        "fat": 15,
        "image_url": "https://images.pexels.com/photos/4397899/pexels-photo-4397899.jpeg",
        "recipe": {
            "ingredients": [
                "300g cottage cheese",
                "30g amandes",
                "30g noix",
                "20g miel",
                "Cannelle"
            ],
            "steps": [
                "Verser le cottage cheese dans un bol",
                "Ajouter les fruits secs",
                "Arroser de miel",
                "Saupoudrer de cannelle",
                "Mélanger et déguster"
            ],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Wrap Poulet César",
        "description": "Wrap protéiné façon salade César",
        "calories": 520,
        "protein": 38,
        "carbs": 40,
        "fat": 22,
        "image_url": "https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg",
        "recipe": {
            "ingredients": [
                "150g poulet grillé",
                "1 grande tortilla",
                "Salade romaine",
                "Parmesan",
                "Sauce César",
                "Croûtons"
            ],
            "steps": [
                "Trancher le poulet grillé",
                "Étaler la sauce sur la tortilla",
                "Disposer la salade et le poulet",
                "Ajouter parmesan et croûtons",
                "Rouler serré",
                "Couper en deux et servir"
            ],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Riz au Lait Protéiné",
        "description": "Dessert réconfortant enrichi en protéines",
        "calories": 450,
        "protein": 30,
        "carbs": 60,
        "fat": 10,
        "image_url": "https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg",
        "recipe": {
            "ingredients": [
                "100g riz rond",
                "500ml lait",
                "30g whey vanille",
                "30g sucre",
                "Cannelle",
                "Zeste de citron"
            ],
            "steps": [
                "Cuire le riz dans le lait à feu doux",
                "Remuer régulièrement 25 min",
                "Retirer du feu",
                "Incorporer la whey et le sucre",
                "Ajouter zeste et cannelle",
                "Servir tiède ou froid"
            ],
            "prep_time": "5 min",
            "cook_time": "30 min"
        }
    }
]

# ==================== REPAS PERTE DE POIDS (FR) ====================
weight_loss_meals_fr = [
    # Petits déjeuners légers
    {
        "name": "Oeufs Brouillés Légumes",
        "description": "Petit-déjeuner protéiné faible en glucides",
        "calories": 280,
        "protein": 22,
        "carbs": 8,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg",
        "recipe": {
            "ingredients": [
                "3 oeufs",
                "100g épinards frais",
                "50g tomates cerises",
                "1 cuillère huile d'olive",
                "Sel, poivre, herbes"
            ],
            "steps": [
                "Battre les oeufs légèrement",
                "Faire revenir les épinards",
                "Ajouter les tomates coupées",
                "Verser les oeufs et brouiller",
                "Assaisonner et servir chaud"
            ],
            "prep_time": "5 min",
            "cook_time": "8 min"
        }
    },
    {
        "name": "Smoothie Vert Détox",
        "description": "Boisson légère riche en fibres",
        "calories": 180,
        "protein": 8,
        "carbs": 30,
        "fat": 3,
        "image_url": "https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg",
        "recipe": {
            "ingredients": [
                "100g épinards",
                "1 pomme verte",
                "1/2 concombre",
                "Jus de citron",
                "Gingembre frais",
                "300ml eau"
            ],
            "steps": [
                "Laver tous les ingrédients",
                "Couper la pomme et le concombre",
                "Mixer le tout avec l'eau",
                "Ajouter citron et gingembre",
                "Filtrer si désiré",
                "Servir frais"
            ],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Yaourt 0% Fruits Rouges",
        "description": "Petit-déjeuner léger et rassasiant",
        "calories": 150,
        "protein": 15,
        "carbs": 18,
        "fat": 1,
        "image_url": "https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg",
        "recipe": {
            "ingredients": [
                "200g yaourt grec 0%",
                "100g fruits rouges",
                "10g graines de chia",
                "Édulcorant si besoin"
            ],
            "steps": [
                "Verser le yaourt dans un bol",
                "Ajouter les fruits rouges",
                "Parsemer de graines de chia",
                "Mélanger délicatement",
                "Déguster immédiatement"
            ],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Omelette Blanche Champignons",
        "description": "Sans jaune pour moins de calories",
        "calories": 160,
        "protein": 24,
        "carbs": 5,
        "fat": 5,
        "image_url": "https://images.pexels.com/photos/8697541/pexels-photo-8697541.jpeg",
        "recipe": {
            "ingredients": [
                "5 blancs d'oeufs",
                "150g champignons",
                "Herbes fraîches",
                "Spray cuisson",
                "Sel, poivre"
            ],
            "steps": [
                "Battre les blancs d'oeufs",
                "Faire sauter les champignons",
                "Verser les blancs sur les champignons",
                "Cuire à feu doux",
                "Plier et servir avec herbes"
            ],
            "prep_time": "5 min",
            "cook_time": "8 min"
        }
    },
    # Déjeuners minceur
    {
        "name": "Salade Poulet Grillé",
        "description": "Salade complète faible en calories",
        "calories": 320,
        "protein": 38,
        "carbs": 12,
        "fat": 14,
        "image_url": "https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg",
        "recipe": {
            "ingredients": [
                "200g blanc de poulet",
                "200g salade mixte",
                "100g concombre",
                "50g tomates cerises",
                "Vinaigrette légère",
                "Graines de tournesol"
            ],
            "steps": [
                "Griller le poulet et le trancher",
                "Laver et préparer les légumes",
                "Assembler dans un grand bol",
                "Ajouter le poulet",
                "Assaisonner avec vinaigrette",
                "Parsemer de graines"
            ],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Saumon Vapeur Légumes Verts",
        "description": "Repas léger riche en oméga-3",
        "calories": 350,
        "protein": 35,
        "carbs": 15,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg",
        "recipe": {
            "ingredients": [
                "180g pavé de saumon",
                "200g haricots verts",
                "100g brocolis",
                "Citron, aneth",
                "Sel, poivre"
            ],
            "steps": [
                "Préparer le cuiseur vapeur",
                "Assaisonner le saumon",
                "Cuire le saumon et légumes 15 min",
                "Arroser de jus de citron",
                "Garnir d'aneth",
                "Servir immédiatement"
            ],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Buddha Bowl Quinoa",
        "description": "Bowl végétarien équilibré",
        "calories": 380,
        "protein": 18,
        "carbs": 45,
        "fat": 14,
        "image_url": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
        "recipe": {
            "ingredients": [
                "100g quinoa cuit",
                "100g pois chiches",
                "1/2 avocat",
                "Légumes variés",
                "Sauce tahini légère",
                "Graines de sésame"
            ],
            "steps": [
                "Cuire le quinoa",
                "Rincer les pois chiches",
                "Préparer les légumes",
                "Assembler tous les ingrédients",
                "Arroser de sauce tahini",
                "Parsemer de sésame"
            ],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Soupe Légumes Maison",
        "description": "Soupe détox très faible en calories",
        "calories": 120,
        "protein": 5,
        "carbs": 20,
        "fat": 2,
        "image_url": "https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg",
        "recipe": {
            "ingredients": [
                "2 carottes",
                "2 poireaux",
                "1 courgette",
                "1 oignon",
                "Bouillon de légumes",
                "Herbes fraîches"
            ],
            "steps": [
                "Couper tous les légumes",
                "Les faire revenir légèrement",
                "Ajouter le bouillon",
                "Cuire 25 minutes",
                "Mixer si désiré",
                "Servir chaud avec herbes"
            ],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    {
        "name": "Cabillaud Citronné Épinards",
        "description": "Poisson blanc ultra maigre",
        "calories": 250,
        "protein": 40,
        "carbs": 8,
        "fat": 6,
        "image_url": "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg",
        "recipe": {
            "ingredients": [
                "200g filet de cabillaud",
                "200g épinards frais",
                "1 citron",
                "Ail, persil",
                "Sel, poivre"
            ],
            "steps": [
                "Assaisonner le cabillaud",
                "Cuire au four 15 min à 180°C",
                "Faire tomber les épinards à l'ail",
                "Presser le citron sur le poisson",
                "Dresser poisson sur épinards",
                "Garnir de persil"
            ],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Wrap Dinde Avocat",
        "description": "Wrap léger et rassasiant",
        "calories": 340,
        "protein": 32,
        "carbs": 28,
        "fat": 12,
        "image_url": "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg",
        "recipe": {
            "ingredients": [
                "120g blanc de dinde",
                "1 tortilla complète",
                "1/2 avocat",
                "Salade, tomate",
                "Moutarde de Dijon"
            ],
            "steps": [
                "Étaler la moutarde sur la tortilla",
                "Disposer la salade",
                "Ajouter la dinde tranchée",
                "Écraser l'avocat dessus",
                "Ajouter tomate",
                "Rouler et couper en deux"
            ],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    },
    # Dîners légers
    {
        "name": "Blanc de Poulet Ratatouille",
        "description": "Combo protéines et légumes méditerranéens",
        "calories": 300,
        "protein": 40,
        "carbs": 18,
        "fat": 8,
        "image_url": "https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg",
        "recipe": {
            "ingredients": [
                "200g blanc de poulet",
                "200g ratatouille maison",
                "Herbes de Provence",
                "1 filet huile d'olive",
                "Basilic frais"
            ],
            "steps": [
                "Préparer la ratatouille (ou utiliser surgelée)",
                "Griller le poulet assaisonné",
                "Réchauffer la ratatouille",
                "Dresser le poulet sur la ratatouille",
                "Garnir de basilic",
                "Servir chaud"
            ],
            "prep_time": "15 min",
            "cook_time": "20 min"
        }
    },
    {
        "name": "Salade Thon Niçoise Light",
        "description": "Version allégée de la classique",
        "calories": 280,
        "protein": 35,
        "carbs": 15,
        "fat": 10,
        "image_url": "https://images.pexels.com/photos/5916736/pexels-photo-5916736.jpeg",
        "recipe": {
            "ingredients": [
                "150g thon au naturel",
                "2 oeufs durs",
                "Haricots verts, tomates",
                "Olives noires",
                "Vinaigrette légère"
            ],
            "steps": [
                "Cuire les oeufs durs",
                "Préparer les légumes",
                "Émietter le thon",
                "Assembler tous les ingrédients",
                "Couper les oeufs en quartiers",
                "Assaisonner et servir"
            ],
            "prep_time": "15 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Crevettes Sautées Courgettes",
        "description": "Repas marin ultra léger",
        "calories": 220,
        "protein": 32,
        "carbs": 10,
        "fat": 7,
        "image_url": "https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg",
        "recipe": {
            "ingredients": [
                "200g crevettes décortiquées",
                "300g courgettes",
                "2 gousses d'ail",
                "Citron, persil",
                "1 cuillère huile d'olive"
            ],
            "steps": [
                "Couper les courgettes en dés",
                "Les faire sauter à feu vif",
                "Ajouter les crevettes et l'ail",
                "Cuire 3-4 minutes",
                "Arroser de citron",
                "Parsemer de persil"
            ],
            "prep_time": "10 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Omelette Légumes du Soleil",
        "description": "Dîner léger et savoureux",
        "calories": 260,
        "protein": 20,
        "carbs": 12,
        "fat": 15,
        "image_url": "https://images.pexels.com/photos/1437268/pexels-photo-1437268.jpeg",
        "recipe": {
            "ingredients": [
                "3 oeufs",
                "1 tomate",
                "1/2 courgette",
                "1/2 poivron",
                "Herbes fraîches",
                "Spray cuisson"
            ],
            "steps": [
                "Couper les légumes en petits dés",
                "Les faire revenir",
                "Battre les oeufs",
                "Verser sur les légumes",
                "Cuire à feu doux",
                "Plier et servir"
            ],
            "prep_time": "10 min",
            "cook_time": "12 min"
        }
    },
    {
        "name": "Filet de Dinde Asperges",
        "description": "Repas protéiné très faible en glucides",
        "calories": 230,
        "protein": 42,
        "carbs": 8,
        "fat": 4,
        "image_url": "https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg",
        "recipe": {
            "ingredients": [
                "200g filet de dinde",
                "250g asperges vertes",
                "Jus de citron",
                "Herbes",
                "Sel, poivre"
            ],
            "steps": [
                "Griller la dinde 6 min par côté",
                "Cuire les asperges à la vapeur",
                "Assaisonner le tout",
                "Arroser de citron",
                "Dresser et servir",
                "Garnir d'herbes"
            ],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    # Collations minceur
    {
        "name": "Bâtonnets Légumes Houmous",
        "description": "Snack croquant et protéiné",
        "calories": 150,
        "protein": 8,
        "carbs": 15,
        "fat": 7,
        "image_url": "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
        "recipe": {
            "ingredients": [
                "100g carottes",
                "100g concombre",
                "100g céleri",
                "50g houmous",
                "Paprika"
            ],
            "steps": [
                "Couper les légumes en bâtonnets",
                "Disposer autour du houmous",
                "Saupoudrer de paprika",
                "Servir frais"
            ],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Fromage Blanc 0% Citron",
        "description": "Collation protéinée sans matière grasse",
        "calories": 100,
        "protein": 18,
        "carbs": 6,
        "fat": 0,
        "image_url": "https://images.pexels.com/photos/4397899/pexels-photo-4397899.jpeg",
        "recipe": {
            "ingredients": [
                "200g fromage blanc 0%",
                "Zeste de citron",
                "Édulcorant",
                "Menthe fraîche"
            ],
            "steps": [
                "Verser le fromage blanc",
                "Râper le zeste de citron",
                "Ajouter l'édulcorant",
                "Mélanger et servir frais"
            ],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Oeuf Dur Avocat",
        "description": "Snack équilibré en protéines et lipides",
        "calories": 180,
        "protein": 10,
        "carbs": 4,
        "fat": 14,
        "image_url": "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg",
        "recipe": {
            "ingredients": [
                "1 oeuf",
                "1/4 avocat",
                "Sel, poivre",
                "Piment d'Espelette"
            ],
            "steps": [
                "Cuire l'oeuf dur 10 min",
                "Refroidir et écaler",
                "Couper en deux",
                "Accompagner d'avocat",
                "Assaisonner"
            ],
            "prep_time": "2 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Smoothie Protéiné Light",
        "description": "Shake faible en calories",
        "calories": 140,
        "protein": 25,
        "carbs": 8,
        "fat": 2,
        "image_url": "https://images.pexels.com/photos/3625713/pexels-photo-3625713.jpeg",
        "recipe": {
            "ingredients": [
                "30g whey",
                "200ml lait d'amande",
                "50g fruits rouges",
                "Glaçons"
            ],
            "steps": [
                "Verser le lait d'amande",
                "Ajouter la whey",
                "Incorporer les fruits",
                "Mixer avec glaçons",
                "Servir immédiatement"
            ],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Thé Vert Matcha Protéiné",
        "description": "Boisson énergisante et brûle-graisse",
        "calories": 80,
        "protein": 15,
        "carbs": 4,
        "fat": 1,
        "image_url": "https://images.pexels.com/photos/5946720/pexels-photo-5946720.jpeg",
        "recipe": {
            "ingredients": [
                "1 cuillère matcha",
                "15g whey vanille",
                "250ml eau chaude",
                "Glaçons"
            ],
            "steps": [
                "Dissoudre le matcha dans l'eau",
                "Ajouter la whey",
                "Bien mélanger",
                "Servir chaud ou sur glace"
            ],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Salade de Fruits Light",
        "description": "Dessert vitaminé sans sucre ajouté",
        "calories": 100,
        "protein": 2,
        "carbs": 24,
        "fat": 0,
        "image_url": "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg",
        "recipe": {
            "ingredients": [
                "1 kiwi",
                "100g fraises",
                "1/2 pamplemousse",
                "Menthe fraîche",
                "Jus de citron"
            ],
            "steps": [
                "Couper tous les fruits",
                "Les mélanger dans un bol",
                "Arroser de jus de citron",
                "Décorer de menthe",
                "Servir frais"
            ],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    }
]

# ==================== ENGLISH VERSIONS ====================
mass_gain_meals_en = [
    {
        "name": "Protein Cottage Cheese Bowl",
        "description": "High-protein cottage cheese with fruits and granola",
        "calories": 650,
        "protein": 45,
        "carbs": 70,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg",
        "recipe": {
            "ingredients": ["400g cottage cheese", "1 banana", "100g granola", "30g honey", "50g blueberries", "30g sliced almonds"],
            "steps": ["Pour cottage cheese into bowl", "Slice banana", "Add granola and blueberries", "Drizzle with honey", "Top with almonds", "Serve immediately"],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "6-Egg Power Omelette",
        "description": "XXL omelette with veggies and cheese for maximum protein",
        "calories": 720,
        "protein": 52,
        "carbs": 15,
        "fat": 48,
        "image_url": "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg",
        "recipe": {
            "ingredients": ["6 whole eggs", "100g ham", "50g cheddar", "1 bell pepper", "100g mushrooms", "Salt, pepper, herbs"],
            "steps": ["Beat eggs with salt and pepper", "Sauté vegetables", "Add diced ham", "Pour beaten eggs", "Cook 5 min on medium heat", "Add cheese, fold and serve"],
            "prep_time": "10 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Banana Protein Pancakes",
        "description": "Fluffy pancakes enriched with protein",
        "calories": 580,
        "protein": 40,
        "carbs": 65,
        "fat": 16,
        "image_url": "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
        "recipe": {
            "ingredients": ["100g oats", "2 ripe bananas", "4 eggs", "30g vanilla whey", "Cinnamon", "Maple syrup"],
            "steps": ["Blend oats into flour", "Mash bananas", "Add eggs and whey", "Mix until smooth", "Cook pancakes", "Serve with maple syrup"],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Chocolate Gainer Shake",
        "description": "High-calorie shake for fast mass gain",
        "calories": 850,
        "protein": 50,
        "carbs": 95,
        "fat": 28,
        "image_url": "https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg",
        "recipe": {
            "ingredients": ["500ml whole milk", "2 bananas", "60g chocolate whey", "50g peanut butter", "50g oats", "1 tbsp cocoa"],
            "steps": ["Pour milk in blender", "Add chopped bananas", "Add whey and peanut butter", "Add oats and cocoa", "Blend 2 minutes", "Serve cold"],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Grilled Chicken Brown Rice",
        "description": "Classic mass gain combo: chicken and rice",
        "calories": 750,
        "protein": 55,
        "carbs": 80,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg",
        "recipe": {
            "ingredients": ["300g chicken breast", "200g brown rice cooked", "150g broccoli", "2 tbsp olive oil", "Cajun spices", "Soy sauce"],
            "steps": ["Cook rice as directed", "Season chicken with spices", "Grill chicken 6 min each side", "Steam broccoli", "Plate rice, sliced chicken and broccoli", "Drizzle with soy sauce"],
            "prep_time": "10 min",
            "cook_time": "25 min"
        }
    },
    {
        "name": "Beef Patties Sweet Potatoes",
        "description": "Red meat and complex carbs combo",
        "calories": 820,
        "protein": 48,
        "carbs": 70,
        "fat": 35,
        "image_url": "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        "recipe": {
            "ingredients": ["250g ground beef 15%", "300g sweet potatoes", "100g green beans", "1 onion", "2 garlic cloves", "Olive oil, salt, pepper"],
            "steps": ["Cube sweet potatoes and roast 25 min", "Form 2 patties with ground beef", "Cook patties to preference", "Sauté onion and garlic", "Steam green beans", "Assemble all elements"],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    {
        "name": "Salmon Quinoa Avocado",
        "description": "Omega-3 and protein rich meal",
        "calories": 780,
        "protein": 45,
        "carbs": 55,
        "fat": 42,
        "image_url": "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg",
        "recipe": {
            "ingredients": ["200g salmon fillet", "150g cooked quinoa", "1 avocado", "Lemon juice", "Sesame seeds", "Teriyaki sauce"],
            "steps": ["Cook quinoa as directed", "Season salmon with salt and pepper", "Pan-fry salmon 4 min per side", "Slice avocado", "Plate quinoa, salmon and avocado", "Drizzle with teriyaki and lemon"],
            "prep_time": "10 min",
            "cook_time": "20 min"
        }
    },
    {
        "name": "Homemade Pasta Bolognese",
        "description": "Whole wheat pasta with homemade meat sauce",
        "calories": 850,
        "protein": 48,
        "carbs": 90,
        "fat": 28,
        "image_url": "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg",
        "recipe": {
            "ingredients": ["200g whole wheat pasta", "250g ground beef", "400g tomato sauce", "1 onion, 2 carrots", "Parmesan", "Italian herbs"],
            "steps": ["Sauté onion and carrots", "Add meat and brown", "Add tomato sauce and herbs", "Simmer 20 minutes", "Cook pasta al dente", "Mix and serve with parmesan"],
            "prep_time": "15 min",
            "cook_time": "35 min"
        }
    },
    {
        "name": "Tuna Rice Edamame Bowl",
        "description": "Japanese bowl rich in protein",
        "calories": 680,
        "protein": 52,
        "carbs": 65,
        "fat": 22,
        "image_url": "https://images.pexels.com/photos/8697540/pexels-photo-8697540.jpeg",
        "recipe": {
            "ingredients": ["200g canned tuna", "200g sushi rice cooked", "100g edamame", "1 avocado", "Soy sauce, wasabi", "Sesame seeds"],
            "steps": ["Cook sushi rice", "Drain tuna", "Cook edamame", "Slice avocado", "Assemble in bowl", "Season with soy sauce and sesame"],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Chicken Lentil Curry",
        "description": "Spicy dish rich in plant and animal proteins",
        "calories": 720,
        "protein": 55,
        "carbs": 60,
        "fat": 25,
        "image_url": "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg",
        "recipe": {
            "ingredients": ["250g chicken", "150g red lentils", "400ml coconut milk", "2 tbsp curry paste", "Basmati rice", "Fresh coriander"],
            "steps": ["Sauté chicken pieces", "Add curry paste", "Add lentils and coconut milk", "Simmer 20 minutes", "Cook rice separately", "Serve with fresh coriander"],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    {
        "name": "Ribeye Steak Mashed Potatoes",
        "description": "Premium red meat with creamy mash",
        "calories": 900,
        "protein": 55,
        "carbs": 50,
        "fat": 52,
        "image_url": "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg",
        "recipe": {
            "ingredients": ["250g ribeye steak", "400g potatoes", "100ml cream", "50g butter", "Sea salt", "Black pepper"],
            "steps": ["Boil potatoes 25 min", "Mash with butter and cream", "Rest meat 30 min before cooking", "Sear steak on high heat", "Cook 3-4 min per side to preference", "Rest 5 min and serve"],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    {
        "name": "Roasted Turkey Grilled Veggies",
        "description": "Complete high-protein meal",
        "calories": 650,
        "protein": 58,
        "carbs": 35,
        "fat": 28,
        "image_url": "https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg",
        "recipe": {
            "ingredients": ["300g turkey breast", "200g zucchini", "200g bell peppers", "100g onions", "Herbes de Provence", "Olive oil"],
            "steps": ["Preheat oven to 200°C", "Cut vegetables into chunks", "Place on baking tray with oil", "Season turkey", "Roast everything 25 minutes", "Serve hot"],
            "prep_time": "15 min",
            "cook_time": "25 min"
        }
    },
    {
        "name": "Homemade Double Burger",
        "description": "Double patty with melted cheddar",
        "calories": 950,
        "protein": 60,
        "carbs": 55,
        "fat": 55,
        "image_url": "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
        "recipe": {
            "ingredients": ["300g ground beef", "2 cheddar slices", "1 whole wheat bun", "Tomato, lettuce, onion", "Burger sauce", "Pickles"],
            "steps": ["Form 2 patties of 150g", "Cook patties 4 min per side", "Add cheddar to melt", "Lightly toast bun", "Build burger with toppings", "Serve with homemade fries"],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Homemade Beef Tacos",
        "description": "Protein-rich tacos",
        "calories": 780,
        "protein": 48,
        "carbs": 60,
        "fat": 38,
        "image_url": "https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg",
        "recipe": {
            "ingredients": ["300g ground beef", "4 corn tortillas", "100g shredded cheese", "Guacamole, salsa", "Sour cream", "Mexican spices"],
            "steps": ["Cook meat with spices", "Heat tortillas", "Prepare guacamole", "Fill tortillas with meat", "Add cheese and toppings", "Serve with salsa and cream"],
            "prep_time": "20 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Shrimp Noodle Stir-Fry",
        "description": "Asian protein-packed wok",
        "calories": 700,
        "protein": 45,
        "carbs": 70,
        "fat": 25,
        "image_url": "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg",
        "recipe": {
            "ingredients": ["250g peeled shrimp", "200g egg noodles", "150g wok vegetables", "Soy sauce, sesame oil", "Ginger, garlic", "Green onions"],
            "steps": ["Cook noodles and set aside", "Stir-fry shrimp", "Add vegetables", "Add noodles", "Season with sauces", "Serve hot with green onions"],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Post-Workout Shake",
        "description": "Optimal recovery after training",
        "calories": 450,
        "protein": 40,
        "carbs": 50,
        "fat": 10,
        "image_url": "https://images.pexels.com/photos/3625713/pexels-photo-3625713.jpeg",
        "recipe": {
            "ingredients": ["400ml skim milk", "50g vanilla whey", "1 banana", "30g honey", "Ice cubes"],
            "steps": ["Pour milk in blender", "Add whey and banana", "Add honey", "Blend with ice", "Drink within 30 min post-workout"],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Avocado Egg Toast",
        "description": "Protein snack with healthy fats",
        "calories": 480,
        "protein": 22,
        "carbs": 35,
        "fat": 30,
        "image_url": "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg",
        "recipe": {
            "ingredients": ["2 whole wheat bread slices", "1 ripe avocado", "2 eggs", "Espelette pepper", "Salt, pepper", "Sesame seeds"],
            "steps": ["Toast bread", "Mash avocado and season", "Poach or fry eggs", "Spread avocado on toast", "Top with eggs", "Sprinkle with seeds"],
            "prep_time": "5 min",
            "cook_time": "5 min"
        }
    },
    {
        "name": "Greek Yogurt Muesli Fruits",
        "description": "Protein and energy snack",
        "calories": 420,
        "protein": 25,
        "carbs": 50,
        "fat": 12,
        "image_url": "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
        "recipe": {
            "ingredients": ["250g Greek yogurt", "60g muesli", "100g fresh fruits", "20g honey", "Crushed walnuts"],
            "steps": ["Pour yogurt in bowl", "Add muesli", "Arrange fresh fruits", "Drizzle with honey", "Top with walnuts"],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Cottage Cheese Dried Fruits",
        "description": "Casein and healthy fats before bed",
        "calories": 380,
        "protein": 35,
        "carbs": 25,
        "fat": 15,
        "image_url": "https://images.pexels.com/photos/4397899/pexels-photo-4397899.jpeg",
        "recipe": {
            "ingredients": ["300g cottage cheese", "30g almonds", "30g walnuts", "20g honey", "Cinnamon"],
            "steps": ["Pour cottage cheese in bowl", "Add dried fruits", "Drizzle with honey", "Sprinkle cinnamon", "Mix and enjoy"],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Chicken Caesar Wrap",
        "description": "Protein wrap Caesar style",
        "calories": 520,
        "protein": 38,
        "carbs": 40,
        "fat": 22,
        "image_url": "https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg",
        "recipe": {
            "ingredients": ["150g grilled chicken", "1 large tortilla", "Romaine lettuce", "Parmesan", "Caesar dressing", "Croutons"],
            "steps": ["Slice grilled chicken", "Spread sauce on tortilla", "Layer lettuce and chicken", "Add parmesan and croutons", "Roll tightly", "Cut in half and serve"],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Protein Rice Pudding",
        "description": "Comforting dessert enriched with protein",
        "calories": 450,
        "protein": 30,
        "carbs": 60,
        "fat": 10,
        "image_url": "https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg",
        "recipe": {
            "ingredients": ["100g short grain rice", "500ml milk", "30g vanilla whey", "30g sugar", "Cinnamon", "Lemon zest"],
            "steps": ["Cook rice in milk on low heat", "Stir regularly for 25 min", "Remove from heat", "Stir in whey and sugar", "Add zest and cinnamon", "Serve warm or cold"],
            "prep_time": "5 min",
            "cook_time": "30 min"
        }
    }
]

weight_loss_meals_en = [
    {
        "name": "Veggie Scrambled Eggs",
        "description": "High-protein low-carb breakfast",
        "calories": 280,
        "protein": 22,
        "carbs": 8,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg",
        "recipe": {
            "ingredients": ["3 eggs", "100g fresh spinach", "50g cherry tomatoes", "1 tbsp olive oil", "Salt, pepper, herbs"],
            "steps": ["Beat eggs lightly", "Sauté spinach", "Add chopped tomatoes", "Pour eggs and scramble", "Season and serve hot"],
            "prep_time": "5 min",
            "cook_time": "8 min"
        }
    },
    {
        "name": "Green Detox Smoothie",
        "description": "Light fiber-rich drink",
        "calories": 180,
        "protein": 8,
        "carbs": 30,
        "fat": 3,
        "image_url": "https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg",
        "recipe": {
            "ingredients": ["100g spinach", "1 green apple", "1/2 cucumber", "Lemon juice", "Fresh ginger", "300ml water"],
            "steps": ["Wash all ingredients", "Chop apple and cucumber", "Blend with water", "Add lemon and ginger", "Strain if desired", "Serve cold"],
            "prep_time": "5 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "0% Greek Yogurt Berries",
        "description": "Light and filling breakfast",
        "calories": 150,
        "protein": 15,
        "carbs": 18,
        "fat": 1,
        "image_url": "https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg",
        "recipe": {
            "ingredients": ["200g 0% Greek yogurt", "100g mixed berries", "10g chia seeds", "Sweetener if needed"],
            "steps": ["Pour yogurt in bowl", "Add berries", "Sprinkle chia seeds", "Mix gently", "Enjoy immediately"],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Egg White Mushroom Omelette",
        "description": "No yolk for fewer calories",
        "calories": 160,
        "protein": 24,
        "carbs": 5,
        "fat": 5,
        "image_url": "https://images.pexels.com/photos/8697541/pexels-photo-8697541.jpeg",
        "recipe": {
            "ingredients": ["5 egg whites", "150g mushrooms", "Fresh herbs", "Cooking spray", "Salt, pepper"],
            "steps": ["Beat egg whites", "Sauté mushrooms", "Pour whites over mushrooms", "Cook on low heat", "Fold and serve with herbs"],
            "prep_time": "5 min",
            "cook_time": "8 min"
        }
    },
    {
        "name": "Grilled Chicken Salad",
        "description": "Complete low-calorie salad",
        "calories": 320,
        "protein": 38,
        "carbs": 12,
        "fat": 14,
        "image_url": "https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg",
        "recipe": {
            "ingredients": ["200g chicken breast", "200g mixed greens", "100g cucumber", "50g cherry tomatoes", "Light vinaigrette", "Sunflower seeds"],
            "steps": ["Grill and slice chicken", "Wash and prep vegetables", "Assemble in large bowl", "Add chicken", "Dress with vinaigrette", "Top with seeds"],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Steamed Salmon Green Veggies",
        "description": "Light omega-3 rich meal",
        "calories": 350,
        "protein": 35,
        "carbs": 15,
        "fat": 18,
        "image_url": "https://images.pexels.com/photos/3655916/pexels-photo-3655916.jpeg",
        "recipe": {
            "ingredients": ["180g salmon fillet", "200g green beans", "100g broccoli", "Lemon, dill", "Salt, pepper"],
            "steps": ["Prepare steamer", "Season salmon", "Steam salmon and veggies 15 min", "Squeeze lemon over fish", "Garnish with dill", "Serve immediately"],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Quinoa Buddha Bowl",
        "description": "Balanced vegetarian bowl",
        "calories": 380,
        "protein": 18,
        "carbs": 45,
        "fat": 14,
        "image_url": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
        "recipe": {
            "ingredients": ["100g cooked quinoa", "100g chickpeas", "1/2 avocado", "Mixed vegetables", "Light tahini sauce", "Sesame seeds"],
            "steps": ["Cook quinoa", "Rinse chickpeas", "Prep vegetables", "Assemble all ingredients", "Drizzle with tahini", "Sprinkle sesame"],
            "prep_time": "15 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Homemade Vegetable Soup",
        "description": "Very low-calorie detox soup",
        "calories": 120,
        "protein": 5,
        "carbs": 20,
        "fat": 2,
        "image_url": "https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg",
        "recipe": {
            "ingredients": ["2 carrots", "2 leeks", "1 zucchini", "1 onion", "Vegetable broth", "Fresh herbs"],
            "steps": ["Chop all vegetables", "Lightly sauté", "Add broth", "Cook 25 minutes", "Blend if desired", "Serve hot with herbs"],
            "prep_time": "15 min",
            "cook_time": "30 min"
        }
    },
    {
        "name": "Lemon Cod Spinach",
        "description": "Ultra-lean white fish",
        "calories": 250,
        "protein": 40,
        "carbs": 8,
        "fat": 6,
        "image_url": "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg",
        "recipe": {
            "ingredients": ["200g cod fillet", "200g fresh spinach", "1 lemon", "Garlic, parsley", "Salt, pepper"],
            "steps": ["Season cod", "Bake 15 min at 180°C", "Wilt spinach with garlic", "Squeeze lemon over fish", "Plate fish on spinach", "Garnish with parsley"],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Turkey Avocado Wrap",
        "description": "Light and filling wrap",
        "calories": 340,
        "protein": 32,
        "carbs": 28,
        "fat": 12,
        "image_url": "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg",
        "recipe": {
            "ingredients": ["120g turkey breast", "1 whole wheat tortilla", "1/2 avocado", "Lettuce, tomato", "Dijon mustard"],
            "steps": ["Spread mustard on tortilla", "Layer lettuce", "Add sliced turkey", "Mash avocado on top", "Add tomato", "Roll and cut in half"],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Chicken Breast Ratatouille",
        "description": "Mediterranean protein and veggie combo",
        "calories": 300,
        "protein": 40,
        "carbs": 18,
        "fat": 8,
        "image_url": "https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg",
        "recipe": {
            "ingredients": ["200g chicken breast", "200g homemade ratatouille", "Herbes de Provence", "Drizzle olive oil", "Fresh basil"],
            "steps": ["Prepare ratatouille (or use frozen)", "Grill seasoned chicken", "Heat ratatouille", "Plate chicken on ratatouille", "Garnish with basil", "Serve hot"],
            "prep_time": "15 min",
            "cook_time": "20 min"
        }
    },
    {
        "name": "Light Tuna Niçoise Salad",
        "description": "Lightened version of the classic",
        "calories": 280,
        "protein": 35,
        "carbs": 15,
        "fat": 10,
        "image_url": "https://images.pexels.com/photos/5916736/pexels-photo-5916736.jpeg",
        "recipe": {
            "ingredients": ["150g tuna in water", "2 boiled eggs", "Green beans, tomatoes", "Black olives", "Light vinaigrette"],
            "steps": ["Boil eggs hard", "Prep vegetables", "Flake tuna", "Assemble all ingredients", "Quarter eggs", "Dress and serve"],
            "prep_time": "15 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Sautéed Shrimp Zucchini",
        "description": "Ultra-light seafood meal",
        "calories": 220,
        "protein": 32,
        "carbs": 10,
        "fat": 7,
        "image_url": "https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg",
        "recipe": {
            "ingredients": ["200g peeled shrimp", "300g zucchini", "2 garlic cloves", "Lemon, parsley", "1 tbsp olive oil"],
            "steps": ["Dice zucchini", "Stir-fry on high heat", "Add shrimp and garlic", "Cook 3-4 minutes", "Squeeze lemon", "Garnish with parsley"],
            "prep_time": "10 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Sunny Veggie Omelette",
        "description": "Light and tasty dinner",
        "calories": 260,
        "protein": 20,
        "carbs": 12,
        "fat": 15,
        "image_url": "https://images.pexels.com/photos/1437268/pexels-photo-1437268.jpeg",
        "recipe": {
            "ingredients": ["3 eggs", "1 tomato", "1/2 zucchini", "1/2 bell pepper", "Fresh herbs", "Cooking spray"],
            "steps": ["Dice vegetables small", "Sauté vegetables", "Beat eggs", "Pour over vegetables", "Cook on low heat", "Fold and serve"],
            "prep_time": "10 min",
            "cook_time": "12 min"
        }
    },
    {
        "name": "Turkey Fillet Asparagus",
        "description": "Very low-carb protein meal",
        "calories": 230,
        "protein": 42,
        "carbs": 8,
        "fat": 4,
        "image_url": "https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg",
        "recipe": {
            "ingredients": ["200g turkey fillet", "250g green asparagus", "Lemon juice", "Herbs", "Salt, pepper"],
            "steps": ["Grill turkey 6 min per side", "Steam asparagus", "Season everything", "Squeeze lemon", "Plate and serve", "Garnish with herbs"],
            "prep_time": "10 min",
            "cook_time": "15 min"
        }
    },
    {
        "name": "Veggie Sticks Hummus",
        "description": "Crunchy protein snack",
        "calories": 150,
        "protein": 8,
        "carbs": 15,
        "fat": 7,
        "image_url": "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
        "recipe": {
            "ingredients": ["100g carrots", "100g cucumber", "100g celery", "50g hummus", "Paprika"],
            "steps": ["Cut vegetables into sticks", "Arrange around hummus", "Sprinkle with paprika", "Serve cold"],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "0% Cottage Cheese Lemon",
        "description": "Fat-free protein snack",
        "calories": 100,
        "protein": 18,
        "carbs": 6,
        "fat": 0,
        "image_url": "https://images.pexels.com/photos/4397899/pexels-photo-4397899.jpeg",
        "recipe": {
            "ingredients": ["200g 0% cottage cheese", "Lemon zest", "Sweetener", "Fresh mint"],
            "steps": ["Pour cottage cheese", "Grate lemon zest", "Add sweetener", "Mix and serve cold"],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Boiled Egg Avocado",
        "description": "Balanced protein and fat snack",
        "calories": 180,
        "protein": 10,
        "carbs": 4,
        "fat": 14,
        "image_url": "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg",
        "recipe": {
            "ingredients": ["1 egg", "1/4 avocado", "Salt, pepper", "Espelette pepper"],
            "steps": ["Boil egg 10 min", "Cool and peel", "Cut in half", "Serve with avocado", "Season"],
            "prep_time": "2 min",
            "cook_time": "10 min"
        }
    },
    {
        "name": "Light Protein Smoothie",
        "description": "Low-calorie shake",
        "calories": 140,
        "protein": 25,
        "carbs": 8,
        "fat": 2,
        "image_url": "https://images.pexels.com/photos/3625713/pexels-photo-3625713.jpeg",
        "recipe": {
            "ingredients": ["30g whey", "200ml almond milk", "50g berries", "Ice cubes"],
            "steps": ["Pour almond milk", "Add whey", "Add berries", "Blend with ice", "Serve immediately"],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Protein Matcha Green Tea",
        "description": "Energizing fat-burning drink",
        "calories": 80,
        "protein": 15,
        "carbs": 4,
        "fat": 1,
        "image_url": "https://images.pexels.com/photos/5946720/pexels-photo-5946720.jpeg",
        "recipe": {
            "ingredients": ["1 tbsp matcha", "15g vanilla whey", "250ml hot water", "Ice cubes"],
            "steps": ["Dissolve matcha in water", "Add whey", "Mix well", "Serve hot or over ice"],
            "prep_time": "3 min",
            "cook_time": "0 min"
        }
    },
    {
        "name": "Light Fruit Salad",
        "description": "No added sugar vitamin dessert",
        "calories": 100,
        "protein": 2,
        "carbs": 24,
        "fat": 0,
        "image_url": "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg",
        "recipe": {
            "ingredients": ["1 kiwi", "100g strawberries", "1/2 grapefruit", "Fresh mint", "Lemon juice"],
            "steps": ["Cut all fruits", "Mix in bowl", "Squeeze lemon", "Decorate with mint", "Serve cold"],
            "prep_time": "10 min",
            "cook_time": "0 min"
        }
    }
]

async def update_supplements():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=== Mise à jour des plans nutritionnels ===\n")
    
    # Update French Mass Gain pack
    result = await db.supplements.update_one(
        {"title": "Pack Prise de Masse"},
        {"$set": {"meals": mass_gain_meals_fr}}
    )
    print(f"Pack Prise de Masse FR: {result.modified_count} modifié(s) - {len(mass_gain_meals_fr)} repas")
    
    # Update French Weight Loss pack
    result = await db.supplements.update_one(
        {"title": "Pack Perte de Poids"},
        {"$set": {"meals": weight_loss_meals_fr}}
    )
    print(f"Pack Perte de Poids FR: {result.modified_count} modifié(s) - {len(weight_loss_meals_fr)} repas")
    
    # Update English Mass Gain pack
    result = await db.supplements.update_one(
        {"title": "Mass Gain Pack"},
        {"$set": {"meals": mass_gain_meals_en}}
    )
    print(f"Mass Gain Pack EN: {result.modified_count} modifié(s) - {len(mass_gain_meals_en)} repas")
    
    # Update English Weight Loss pack
    result = await db.supplements.update_one(
        {"title": "Weight Loss Pack"},
        {"$set": {"meals": weight_loss_meals_en}}
    )
    print(f"Weight Loss Pack EN: {result.modified_count} modifié(s) - {len(weight_loss_meals_en)} repas")
    
    print("\n=== Résumé ===")
    print(f"Total repas Prise de Masse: {len(mass_gain_meals_fr)} (FR) + {len(mass_gain_meals_en)} (EN)")
    print(f"Total repas Perte de Poids: {len(weight_loss_meals_fr)} (FR) + {len(weight_loss_meals_en)} (EN)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_supplements())
