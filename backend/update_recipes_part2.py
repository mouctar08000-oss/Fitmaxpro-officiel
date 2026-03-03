#!/usr/bin/env python3
"""
Script pour compléter TOUTES les recettes restantes.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Suite des recettes complètes
MORE_RECIPES = {
    # === SUITE PACK PRISE DE MASSE ===
    "Smoothie Gainer Chocolat": {
        "proteins": 40,
        "fats": 20,
        "recipe": {
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "300ml de lait entier",
                "2 bananes mûres congelées",
                "40g de whey protéine chocolat (1,5 scoop)",
                "2 cuillères à soupe de beurre de cacahuète (30g)",
                "30g de flocons d'avoine",
                "1 cuillère à soupe de cacao en poudre non sucré",
                "1 cuillère à soupe de miel",
                "5-6 glaçons"
            ],
            "steps": [
                "Verser le lait dans le blender en premier",
                "Ajouter les flocons d'avoine et laisser tremper 2 minutes",
                "Ajouter les bananes congelées coupées en morceaux",
                "Incorporer la whey, le beurre de cacahuète et le cacao",
                "Ajouter le miel et les glaçons",
                "Mixer à haute vitesse pendant 60-90 secondes",
                "Racler les bords et mixer à nouveau si nécessaire",
                "Verser dans un grand shaker ou verre de 500ml",
                "Servir immédiatement pour profiter de la texture crémeuse"
            ],
            "tips": [
                "Congeler les bananes la veille pour une texture glacée",
                "Ajouter une poignée d'épinards pour plus de nutriments sans goût",
                "Boire dans les 30 minutes post-entraînement"
            ],
            "substitutions": {
                "lait entier": "Lait d'avoine ou d'amande enrichi",
                "beurre de cacahuète": "Beurre d'amande ou noisette",
                "whey chocolat": "Whey vanille + cacao"
            }
        }
    },
    "Pasta Bolognaise Maison": {
        "proteins": 45,
        "fats": 22,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "30 min",
            "servings": 2,
            "difficulty": "Moyen",
            "ingredients": [
                "200g de pâtes complètes (penne ou spaghetti)",
                "300g de boeuf haché 5% MG",
                "400g de tomates concassées en conserve",
                "1 oignon moyen haché",
                "2 gousses d'ail émincées",
                "1 carotte râpée",
                "1 branche de céleri émincée",
                "2 cuillères à soupe d'huile d'olive",
                "1 cuillère à café d'origan séché",
                "1 feuille de laurier",
                "50g de parmesan râpé",
                "Sel et poivre",
                "Basilic frais pour servir"
            ],
            "steps": [
                "Faire chauffer l'huile dans une grande casserole à feu moyen",
                "Faire revenir l'oignon 3 minutes jusqu'à ce qu'il soit translucide",
                "Ajouter l'ail, la carotte et le céleri, cuire 2 minutes",
                "Augmenter le feu et ajouter le boeuf haché",
                "Faire dorer la viande en l'émiettant à la spatule pendant 5 minutes",
                "Verser les tomates concassées et ajouter le laurier et l'origan",
                "Saler, poivrer et laisser mijoter 20 minutes à feu doux en remuant occasionnellement",
                "Pendant ce temps, cuire les pâtes selon les instructions du paquet",
                "Les égoutter en réservant une tasse d'eau de cuisson",
                "Retirer le laurier de la sauce",
                "Ajouter les pâtes directement dans la sauce bolognaise",
                "Mélanger délicatement, ajouter un peu d'eau de cuisson si trop sec",
                "Servir dans des assiettes creuses avec le parmesan et le basilic"
            ],
            "tips": [
                "Ne pas hésiter à laisser mijoter plus longtemps pour plus de saveur",
                "Ajouter une pincée de sucre si la sauce est trop acide",
                "Peut se préparer la veille et réchauffer"
            ],
            "substitutions": {
                "boeuf haché": "Dinde hachée ou protéines de soja",
                "pâtes complètes": "Pâtes de lentilles ou konjac"
            }
        }
    },
    "Bowl Thon Riz Édamame": {
        "proteins": 45,
        "fats": 15,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "20 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "120g de thon en conserve au naturel (égoutté)",
                "100g de riz à sushi ou riz rond",
                "80g d'édamames écossés (frais ou surgelés)",
                "1/2 avocat mûr",
                "1 carotte râpée",
                "50g de chou rouge émincé",
                "2 cuillères à soupe de sauce soja",
                "1 cuillère à café d'huile de sésame",
                "1 cuillère à café de graines de sésame",
                "2 cuillères à soupe de mayonnaise légère",
                "1 cuillère à café de sriracha (optionnel)"
            ],
            "steps": [
                "Rincer le riz plusieurs fois jusqu'à ce que l'eau soit claire",
                "Cuire le riz selon les instructions (environ 15-18 minutes)",
                "Faire cuire les édamames 5 minutes dans l'eau bouillante salée",
                "Les égoutter et les refroidir sous l'eau froide",
                "Émietter le thon égoutté dans un bol",
                "Préparer la sauce spicy mayo : mélanger mayonnaise et sriracha",
                "Couper l'avocat en lamelles",
                "Râper la carotte et émincer le chou rouge",
                "Dresser le riz tiède au fond d'un grand bol",
                "Disposer harmonieusement le thon, les édamames, l'avocat, la carotte et le chou",
                "Arroser de sauce soja et d'huile de sésame",
                "Parsemer de graines de sésame",
                "Servir avec la sauce spicy mayo à côté"
            ],
            "tips": [
                "Le riz à sushi donne la meilleure texture pour ce bowl",
                "Ajouter du gingembre mariné (gari) pour plus d'authenticité",
                "Peut se préparer en meal prep pour plusieurs jours"
            ],
            "substitutions": {
                "thon": "Saumon fumé ou crevettes",
                "riz à sushi": "Riz complet ou quinoa",
                "édamames": "Pois chiches ou fèves"
            }
        }
    },
    "Curry Poulet Lentilles": {
        "proteins": 52,
        "fats": 18,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "35 min",
            "servings": 2,
            "difficulty": "Moyen",
            "ingredients": [
                "300g de blanc de poulet en cubes",
                "150g de lentilles corail (poids cru)",
                "400ml de lait de coco léger",
                "1 oignon moyen haché",
                "3 gousses d'ail émincées",
                "1 morceau de gingembre frais (3cm) râpé",
                "2 cuillères à soupe de pâte de curry rouge ou jaune",
                "200g de tomates concassées",
                "200g d'épinards frais",
                "2 cuillères à soupe d'huile de coco",
                "1 cuillère à café de curcuma",
                "Coriandre fraîche pour servir",
                "Sel et poivre"
            ],
            "steps": [
                "Rincer les lentilles corail et les mettre de côté",
                "Couper le poulet en cubes de 3cm",
                "Faire chauffer l'huile de coco dans une grande cocotte à feu moyen",
                "Faire revenir l'oignon 3 minutes jusqu'à ce qu'il soit doré",
                "Ajouter l'ail et le gingembre, cuire 1 minute",
                "Incorporer la pâte de curry et le curcuma, mélanger 30 secondes",
                "Ajouter les morceaux de poulet et les saisir 3-4 minutes",
                "Verser le lait de coco et les tomates concassées",
                "Ajouter les lentilles corail et 200ml d'eau",
                "Porter à ébullition puis réduire le feu",
                "Laisser mijoter 25-30 minutes jusqu'à ce que les lentilles soient tendres",
                "Ajouter les épinards en fin de cuisson, remuer jusqu'à ce qu'ils soient flétris",
                "Ajuster l'assaisonnement",
                "Servir parsemé de coriandre fraîche"
            ],
            "tips": [
                "Les lentilles corail cuisent vite et épaississent le curry",
                "Ajouter du bouillon de poulet si le curry est trop épais",
                "Se congèle très bien pour les meal prep"
            ],
            "substitutions": {
                "poulet": "Crevettes ou pois chiches",
                "lait de coco": "Crème de soja",
                "lentilles corail": "Lentilles vertes (cuisson plus longue)"
            }
        }
    },
    "Entrecôte Purée Maison": {
        "proteins": 55,
        "fats": 35,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "25 min",
            "servings": 1,
            "difficulty": "Moyen",
            "ingredients": [
                "200g d'entrecôte de boeuf (épaisseur 2-3cm)",
                "400g de pommes de terre à chair farineuse (Bintje, Mona Lisa)",
                "50ml de lait chaud",
                "30g de beurre",
                "1 gousse d'ail entière",
                "1 branche de thym",
                "1 cuillère à soupe d'huile d'olive",
                "Sel et poivre du moulin",
                "Fleur de sel pour servir",
                "Muscade râpée"
            ],
            "steps": [
                "Sortir l'entrecôte du frigo 30 minutes avant cuisson",
                "Éplucher les pommes de terre et les couper en morceaux égaux",
                "Les mettre dans une casserole d'eau froide salée",
                "Porter à ébullition et cuire 20 minutes jusqu'à ce qu'elles soient tendres",
                "Égoutter et remettre dans la casserole sur feu doux 1 minute pour sécher",
                "Écraser les pommes de terre au presse-purée (pas au mixeur)",
                "Ajouter le beurre froid en morceaux et mélanger",
                "Incorporer progressivement le lait chaud",
                "Assaisonner de sel, poivre et muscade",
                "Sécher l'entrecôte avec du papier absorbant, saler et poivrer généreusement",
                "Faire chauffer une poêle en fonte à feu très vif avec l'huile",
                "Saisir l'entrecôte 2-3 min par côté pour une cuisson saignante",
                "Ajouter le beurre, l'ail et le thym, arroser la viande",
                "Laisser reposer 5 minutes sur une planche, trancher",
                "Servir avec la purée, arroser du jus de cuisson et ajouter la fleur de sel"
            ],
            "tips": [
                "Une poêle très chaude garantit une belle croûte",
                "Le repos de la viande est crucial pour une viande juteuse",
                "Ne jamais mixer la purée sous peine de texture collante"
            ],
            "substitutions": {
                "entrecôte": "Faux-filet ou bavette",
                "pommes de terre": "Patates douces"
            }
        }
    },
    "Dinde Rôtie Légumes Grillés": {
        "proteins": 50,
        "fats": 8,
        "recipe": {
            "prep_time": "20 min",
            "cook_time": "35 min",
            "servings": 2,
            "difficulty": "Facile",
            "ingredients": [
                "350g de filet de dinde",
                "1 courgette moyenne",
                "1 poivron rouge",
                "1 poivron jaune",
                "200g de champignons de Paris",
                "1 oignon rouge",
                "3 cuillères à soupe d'huile d'olive",
                "2 gousses d'ail émincées",
                "1 cuillère à café de paprika fumé",
                "1 cuillère à café d'herbes de Provence",
                "Jus d'un demi-citron",
                "Sel et poivre"
            ],
            "steps": [
                "Préchauffer le four à 200°C",
                "Couper la dinde en gros cubes de 4cm",
                "Préparer la marinade : huile, paprika, herbes, ail, citron, sel et poivre",
                "Badigeonner la dinde avec la moitié de la marinade",
                "Couper tous les légumes en gros morceaux",
                "Mélanger les légumes avec le reste de la marinade",
                "Disposer les légumes sur une grande plaque de cuisson",
                "Enfourner les légumes pour 15 minutes",
                "Ajouter les cubes de dinde sur les légumes",
                "Poursuivre la cuisson 20 minutes en retournant à mi-cuisson",
                "La dinde doit être dorée et les légumes caramélisés",
                "Servir chaud directement dans le plat"
            ],
            "tips": [
                "Couper les légumes de taille similaire pour une cuisson uniforme",
                "Ne pas surcharger la plaque pour permettre la caramélisation",
                "Ajouter des quartiers de citron grillés pour servir"
            ],
            "substitutions": {
                "dinde": "Poulet ou tofu ferme",
                "légumes proposés": "Aubergines, fenouil, patates douces"
            }
        }
    },
    "Burger Maison Double": {
        "proteins": 60,
        "fats": 40,
        "recipe": {
            "prep_time": "20 min",
            "cook_time": "15 min",
            "servings": 1,
            "difficulty": "Moyen",
            "ingredients": [
                "250g de boeuf haché frais 15% MG (pour 2 steaks)",
                "1 pain burger brioché ou complet",
                "2 tranches de cheddar",
                "2 feuilles de laitue",
                "2 tranches de tomate",
                "4 rondelles de cornichon",
                "1/2 oignon rouge en rondelles",
                "2 cuillères à soupe de sauce burger (ketchup + mayo + moutarde)",
                "1 cuillère à soupe d'huile",
                "Sel et poivre"
            ],
            "steps": [
                "Sortir la viande du frigo 15 minutes avant",
                "Diviser la viande en 2 boules de 125g",
                "Former des steaks de 1,5cm d'épaisseur, légèrement plus larges que le pain",
                "Faire une petite empreinte au centre de chaque steak (évite le gonflement)",
                "Assaisonner généreusement de sel et poivre sur les deux faces",
                "Faire chauffer une poêle en fonte à feu vif",
                "Cuire les steaks 3 minutes par côté pour une cuisson à point",
                "Dans la dernière minute, poser une tranche de cheddar sur chaque steak",
                "Toaster légèrement les pains coupés en deux",
                "Étaler la sauce sur les deux faces du pain",
                "Sur la base, déposer la laitue, la tomate et l'oignon",
                "Empiler les deux steaks au fromage",
                "Ajouter les cornichons et refermer le burger",
                "Piquer avec un pic en bois si nécessaire",
                "Servir immédiatement"
            ],
            "tips": [
                "Ne jamais écraser les steaks pendant la cuisson",
                "Le cheddar fond mieux si la poêle est couverte 30 secondes",
                "Servir avec des frites de patates douces maison"
            ],
            "substitutions": {
                "boeuf": "Dinde ou steak végétal",
                "cheddar": "Raclette ou gouda",
                "pain brioché": "Pain complet ou sans gluten"
            }
        }
    },
    "Shake Post-Training": {
        "proteins": 45,
        "fats": 8,
        "recipe": {
            "prep_time": "3 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "40g de whey protéine vanille ou chocolat",
                "300ml de lait écrémé ou demi-écrémé",
                "1 banane mûre",
                "1 cuillère à soupe de miel ou sirop d'agave",
                "5g de créatine monohydrate (optionnel)",
                "1 pincée de cannelle",
                "4-5 glaçons"
            ],
            "steps": [
                "Verser le lait dans le shaker ou blender",
                "Ajouter la whey et mélanger rapidement",
                "Couper la banane en morceaux et l'ajouter",
                "Incorporer le miel et la créatine si utilisée",
                "Ajouter les glaçons et la cannelle",
                "Mixer ou secouer vigoureusement pendant 30 secondes",
                "Boire dans les 30 minutes suivant l'entraînement",
                "Rincer immédiatement le shaker"
            ],
            "tips": [
                "La fenêtre anabolique idéale est dans les 30 minutes post-training",
                "La banane apporte des glucides rapides pour reconstituer le glycogène",
                "Ajouter des flocons d'avoine pour un shake plus consistant"
            ],
            "substitutions": {
                "whey": "Protéine végétale (pois, riz)",
                "banane": "Mangue ou fruits rouges",
                "lait": "Eau pour une digestion plus légère"
            }
        }
    },
    "Toast Avocat Oeufs": {
        "proteins": 22,
        "fats": 28,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "5 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "2 tranches de pain complet ou aux céréales",
                "1 avocat mûr",
                "2 oeufs",
                "1/2 citron (jus)",
                "1 cuillère à café de graines de sésame",
                "1 pincée de piment d'Espelette ou flocons de chili",
                "Quelques pousses d'épinards ou roquette",
                "Sel et poivre",
                "1 cuillère à café de vinaigre blanc (pour pocher)"
            ],
            "steps": [
                "Faire griller les tranches de pain",
                "Couper l'avocat en deux, retirer le noyau",
                "Écraser la chair à la fourchette avec le jus de citron, sel et poivre",
                "Pour des oeufs pochés : porter de l'eau à frémissement avec le vinaigre",
                "Créer un tourbillon et y glisser délicatement l'oeuf cassé dans un ramequin",
                "Pocher 3 minutes pour un jaune coulant",
                "Retirer avec une écumoire et égoutter sur papier absorbant",
                "Tartiner généreusement le guacamole sur les toasts",
                "Déposer les pousses vertes",
                "Placer un oeuf poché sur chaque toast",
                "Saupoudrer de graines de sésame et piment",
                "Servir immédiatement pour profiter du jaune coulant"
            ],
            "tips": [
                "L'avocat doit céder légèrement sous le doigt",
                "Ajouter une goutte de tabasco dans le guacamole pour relever",
                "Alterner avec des oeufs au plat pour varier"
            ],
            "substitutions": {
                "avocat": "Houmous ou cream cheese",
                "oeufs pochés": "Oeufs brouillés ou au plat",
                "pain complet": "Pain de seigle ou galette de sarrasin"
            }
        }
    },
    "Yaourt Grec Muesli Fruits": {
        "proteins": 25,
        "fats": 15,
        "recipe": {
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "250g de yaourt grec nature 0% ou 2%",
                "50g de muesli sans sucre ajouté",
                "1 pomme ou poire",
                "50g de fruits rouges (frais ou surgelés décongelés)",
                "20g de noix ou amandes concassées",
                "1 cuillère à soupe de miel ou sirop d'érable",
                "1 pincée de cannelle"
            ],
            "steps": [
                "Verser le yaourt grec dans un grand bol ou jar",
                "Laver et couper la pomme en petits dés (garder la peau)",
                "Laver les fruits rouges si frais",
                "Ajouter le muesli sur le yaourt",
                "Disposer les morceaux de pomme et les fruits rouges",
                "Parsemer des noix concassées",
                "Arroser de miel en filet",
                "Saupoudrer de cannelle",
                "Servir immédiatement ou conserver au frais 1h max"
            ],
            "tips": [
                "Pour un petit-déjeuner express, préparer la veille dans un jar",
                "Le yaourt grec contient 2 fois plus de protéines que le yaourt classique",
                "Congeler les fruits rouges pour un effet rafraîchissant"
            ],
            "substitutions": {
                "yaourt grec": "Skyr ou fromage blanc",
                "muesli": "Granola maison ou flocons d'avoine",
                "pomme": "Banane ou mangue"
            }
        }
    },
    
    # === SUITE PACK PERTE DE POIDS ===
    "Yaourt 0% Fruits Rouges": {
        "proteins": 12,
        "fats": 2,
        "recipe": {
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "200g de yaourt nature 0% MG",
                "80g de framboises fraîches",
                "50g de myrtilles",
                "30g de fraises coupées",
                "1 cuillère à soupe de graines de chia",
                "Quelques feuilles de menthe fraîche",
                "Zeste d'un demi-citron",
                "Édulcorant naturel (optionnel)"
            ],
            "steps": [
                "Verser le yaourt dans un bol",
                "Laver délicatement tous les fruits rouges",
                "Équeuter et couper les fraises en quartiers",
                "Disposer les fruits rouges harmonieusement sur le yaourt",
                "Saupoudrer les graines de chia",
                "Zester le citron directement au-dessus",
                "Décorer de feuilles de menthe",
                "Servir immédiatement"
            ],
            "tips": [
                "Les fruits surgelés décongelés libèrent un jus délicieux",
                "Les graines de chia apportent des fibres et des oméga-3",
                "Éviter d'ajouter du sucre : les fruits sont suffisamment sucrés"
            ],
            "substitutions": {
                "yaourt 0%": "Skyr ou fromage blanc maigre",
                "fruits rouges": "Kiwi et ananas pour varier"
            }
        }
    },
    "Omelette Blanche Champignons": {
        "proteins": 28,
        "fats": 8,
        "recipe": {
            "prep_time": "8 min",
            "cook_time": "8 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "4 blancs d'oeufs (environ 130g)",
                "1 oeuf entier",
                "150g de champignons de Paris émincés",
                "1 échalote émincée",
                "1 gousse d'ail hachée",
                "1 cuillère à café d'huile d'olive",
                "Persil frais haché",
                "Sel et poivre blanc"
            ],
            "steps": [
                "Séparer les blancs des jaunes (garder 1 jaune)",
                "Battre les blancs avec l'oeuf entier, sel et poivre",
                "Faire chauffer l'huile dans une poêle antiadhésive à feu moyen",
                "Faire revenir l'échalote 2 minutes",
                "Ajouter les champignons et l'ail, cuire 4-5 minutes jusqu'à ce qu'ils soient dorés",
                "Verser le mélange d'oeufs sur les champignons",
                "Cuire à feu doux en soulevant les bords pour laisser l'oeuf cru couler en dessous",
                "Quand l'omelette est presque prise, replier en deux",
                "Glisser dans l'assiette et parsemer de persil"
            ],
            "tips": [
                "Les blancs d'oeufs sont très faibles en calories et riches en protéines",
                "Ajouter l'oeuf entier évite une texture trop caoutchouteuse",
                "Varier avec des épinards ou des tomates séchées"
            ],
            "substitutions": {
                "champignons de Paris": "Shiitake ou pleurotes",
                "échalote": "Oignon nouveau"
            }
        }
    },
    "Soupe Légumes Maison": {
        "proteins": 8,
        "fats": 5,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "30 min",
            "servings": 4,
            "difficulty": "Facile",
            "ingredients": [
                "2 poireaux",
                "3 carottes",
                "2 pommes de terre moyennes",
                "1 branche de céleri",
                "1 courgette",
                "1 oignon",
                "2 gousses d'ail",
                "1 litre de bouillon de légumes",
                "1 cuillère à soupe d'huile d'olive",
                "1 bouquet garni (thym, laurier)",
                "Sel et poivre",
                "Persil frais pour servir"
            ],
            "steps": [
                "Éplucher et laver tous les légumes",
                "Couper les poireaux en rondelles, les carottes en dés",
                "Couper les pommes de terre et la courgette en cubes",
                "Émincer l'oignon et le céleri, hacher l'ail",
                "Faire chauffer l'huile dans une grande casserole",
                "Faire revenir l'oignon et le poireau 5 minutes",
                "Ajouter tous les autres légumes et mélanger",
                "Verser le bouillon et ajouter le bouquet garni",
                "Porter à ébullition puis réduire le feu",
                "Laisser mijoter 25-30 minutes jusqu'à ce que les légumes soient tendres",
                "Retirer le bouquet garni",
                "Mixer la soupe selon la texture désirée (lisse ou avec morceaux)",
                "Ajuster l'assaisonnement et servir avec du persil"
            ],
            "tips": [
                "Se conserve 4 jours au frigo, se congèle très bien",
                "Ajouter un filet de crème légère pour plus d'onctuosité",
                "Varier les légumes selon la saison"
            ],
            "substitutions": {
                "pommes de terre": "Patates douces ou butternut",
                "bouillon de légumes": "Eau + cube de bouillon"
            }
        }
    },
    "Cabillaud Citronné Épinards": {
        "proteins": 35,
        "fats": 6,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "15 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "180g de filet de cabillaud frais",
                "200g d'épinards frais",
                "1 citron (jus et zeste)",
                "2 gousses d'ail émincées",
                "1 cuillère à soupe d'huile d'olive",
                "1 cuillère à café de câpres",
                "Sel et poivre blanc",
                "Aneth frais"
            ],
            "steps": [
                "Sortir le cabillaud du frigo 15 minutes avant",
                "Assaisonner le poisson de sel, poivre et zeste de citron",
                "Faire chauffer l'huile dans une poêle à feu moyen",
                "Déposer le cabillaud côté peau et cuire 4 minutes sans toucher",
                "Retourner délicatement et cuire 3 minutes",
                "Retirer le poisson et le garder au chaud",
                "Dans la même poêle, faire revenir l'ail 30 secondes",
                "Ajouter les épinards et les faire tomber 2 minutes",
                "Ajouter les câpres et le jus de citron",
                "Dresser les épinards en lit, poser le cabillaud dessus",
                "Décorer d'aneth frais et servir immédiatement"
            ],
            "tips": [
                "Le cabillaud doit être nacré et s'effeuiller facilement",
                "Ne pas trop cuire pour garder le moelleux",
                "Accompagner de riz complet pour un repas plus consistant"
            ],
            "substitutions": {
                "cabillaud": "Colin, lieu noir ou sole",
                "épinards": "Blettes ou bok choy"
            }
        }
    },
    "Wrap Dinde Avocat": {
        "proteins": 32,
        "fats": 18,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "1 grande tortilla complète ou wrap",
                "100g de blanc de dinde tranché finement",
                "1/2 avocat mûr",
                "50g de roquette ou jeunes pousses",
                "30g de fromage frais allégé",
                "1/4 de concombre en bâtonnets",
                "Quelques tomates cerises coupées",
                "Jus d'un demi-citron vert",
                "Sel, poivre et paprika"
            ],
            "steps": [
                "Écraser l'avocat avec le citron vert, sel et paprika",
                "Étaler le fromage frais sur toute la surface du wrap",
                "Ajouter une couche de guacamole au centre",
                "Disposer les tranches de dinde sur le guacamole",
                "Ajouter la roquette, le concombre et les tomates",
                "Assaisonner de sel et poivre",
                "Replier les côtés du wrap vers l'intérieur",
                "Rouler fermement le wrap en partant du bas",
                "Couper en diagonale pour servir",
                "Maintenir avec un cure-dent si nécessaire"
            ],
            "tips": [
                "Chauffer légèrement la tortilla pour la rendre plus souple",
                "Ne pas surcharger pour pouvoir bien rouler",
                "Se conserve 4h au frais, idéal pour le déjeuner au bureau"
            ],
            "substitutions": {
                "dinde": "Poulet ou jambon",
                "tortilla": "Grande feuille de laitue pour version low-carb"
            }
        }
    },
    "Crevettes Sautées Courgettes": {
        "proteins": 30,
        "fats": 8,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "10 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "200g de crevettes décortiquées (fraîches ou surgelées décongelées)",
                "2 courgettes moyennes",
                "2 gousses d'ail émincées",
                "1 cuillère à soupe d'huile d'olive",
                "1/2 citron (jus)",
                "1 cuillère à café de paprika",
                "Piment d'Espelette (optionnel)",
                "Persil frais haché",
                "Sel et poivre"
            ],
            "steps": [
                "Si crevettes surgelées, bien les sécher après décongélation",
                "Couper les courgettes en demi-rondelles ou en tagliatelles avec un épluche-légumes",
                "Assaisonner les crevettes de paprika, sel et poivre",
                "Faire chauffer l'huile dans un wok ou grande poêle à feu vif",
                "Saisir les crevettes 1-2 minutes de chaque côté, réserver",
                "Dans la même poêle, faire sauter les courgettes 3-4 minutes",
                "Elles doivent rester légèrement croquantes",
                "Ajouter l'ail et cuire 30 secondes",
                "Remettre les crevettes, ajouter le jus de citron",
                "Mélanger rapidement et retirer du feu",
                "Parsemer de persil et servir immédiatement"
            ],
            "tips": [
                "Les crevettes cuisent très vite, ne pas trop cuire",
                "Utiliser un spiraliseur pour des tagliatelles de courgettes",
                "Ajouter des tomates cerises pour plus de couleur"
            ],
            "substitutions": {
                "crevettes": "Saint-Jacques ou calamars",
                "courgettes": "Poivrons ou pois gourmands"
            }
        }
    },
    "Filet de Dinde Asperges": {
        "proteins": 42,
        "fats": 5,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "20 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "180g de filet de dinde",
                "200g d'asperges vertes fraîches",
                "1 cuillère à soupe d'huile d'olive",
                "1 gousse d'ail émincée",
                "1/2 citron (jus et zeste)",
                "1 cuillère à café d'herbes de Provence",
                "Sel et poivre",
                "Quelques copeaux de parmesan (optionnel)"
            ],
            "steps": [
                "Casser la base ligneuse des asperges (elles cassent naturellement au bon endroit)",
                "Aplatir légèrement le filet de dinde pour une épaisseur uniforme",
                "Assaisonner la dinde de sel, poivre et herbes de Provence",
                "Faire chauffer l'huile dans une poêle à feu moyen-vif",
                "Cuire la dinde 5-6 minutes par côté selon l'épaisseur",
                "Retirer et laisser reposer 3 minutes",
                "Dans la même poêle, faire sauter les asperges 4-5 minutes",
                "Ajouter l'ail en fin de cuisson",
                "Arroser du jus de citron et ajouter le zeste",
                "Trancher la dinde et disposer sur les asperges",
                "Ajouter les copeaux de parmesan si désiré"
            ],
            "tips": [
                "Les asperges doivent rester légèrement croquantes",
                "La dinde doit atteindre 74°C à coeur",
                "Servir avec du quinoa pour un repas plus copieux"
            ],
            "substitutions": {
                "dinde": "Blanc de poulet",
                "asperges": "Haricots verts ou brocolis"
            }
        }
    },
    "Fromage Blanc 0% Citron": {
        "proteins": 18,
        "fats": 0,
        "recipe": {
            "prep_time": "3 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "250g de fromage blanc 0% MG",
                "1 citron (zeste et 1/2 jus)",
                "1 cuillère à café de miel ou édulcorant",
                "Quelques feuilles de menthe",
                "1 cuillère à soupe de graines de pavot (optionnel)"
            ],
            "steps": [
                "Verser le fromage blanc dans un bol",
                "Zester le citron directement au-dessus",
                "Ajouter le jus d'un demi-citron",
                "Incorporer le miel et bien mélanger",
                "Parsemer de graines de pavot si utilisées",
                "Décorer de feuilles de menthe",
                "Servir frais"
            ],
            "tips": [
                "Parfait en collation ou en dessert léger",
                "Le citron aide à la digestion et à la détox",
                "Ajouter des fruits frais pour plus de gourmandise"
            ],
            "substitutions": {
                "fromage blanc": "Skyr ou yaourt grec 0%",
                "miel": "Sirop d'agave ou édulcorant"
            }
        }
    }
}

async def update_more_recipes():
    print("Mise à jour des recettes complémentaires...")
    
    supplements = await db.supplements.find({}).to_list(100)
    updated_count = 0
    
    for supplement in supplements:
        supplement_id = supplement.get('supplement_id')
        meals = supplement.get('meals', [])
        modified = False
        
        for i, meal in enumerate(meals):
            meal_name = meal.get('name', '')
            
            if meal_name in MORE_RECIPES:
                recipe_data = MORE_RECIPES[meal_name]
                
                if meal.get('proteins') is None or str(meal.get('proteins')) == 'None':
                    meals[i]['proteins'] = recipe_data['proteins']
                    modified = True
                    
                if meal.get('fats') is None or str(meal.get('fats')) == 'None':
                    meals[i]['fats'] = recipe_data['fats']
                    modified = True
                
                meals[i]['recipe'] = recipe_data['recipe']
                modified = True
                
                print(f"  ✓ Mise à jour: {meal_name}")
        
        if modified:
            await db.supplements.update_one(
                {"supplement_id": supplement_id},
                {"$set": {"meals": meals}}
            )
            updated_count += 1
    
    print(f"\n✅ Mise à jour terminée - {updated_count} suppléments modifiés")

if __name__ == "__main__":
    asyncio.run(update_more_recipes())
