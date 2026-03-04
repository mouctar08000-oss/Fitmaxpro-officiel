#!/usr/bin/env python3
"""
Script pour mettre à jour les recettes avec des informations complètes et détaillées.
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

# Recettes complètes avec tous les détails
COMPLETE_RECIPES = {
    # === PACK PRISE DE MASSE ===
    "Bowl Protéiné au Fromage Blanc": {
        "proteins": 45,
        "fats": 15,
        "recipe": {
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "400g de fromage blanc 0% ou 3%",
                "1 banane mûre (environ 120g)",
                "100g de granola aux noix",
                "30g de miel liquide (environ 2 cuillères à soupe)",
                "50g de myrtilles fraîches ou surgelées",
                "30g d'amandes effilées",
                "1 pincée de cannelle (optionnel)"
            ],
            "steps": [
                "Verser le fromage blanc dans un grand bol (choisir un bol profond pour bien mélanger)",
                "Éplucher et couper la banane en rondelles de 5mm d'épaisseur",
                "Disposer les rondelles de banane sur le fromage blanc en cercle",
                "Ajouter le granola en tas au centre du bol",
                "Répartir les myrtilles autour du granola",
                "Arroser généreusement de miel en filet",
                "Parsemer les amandes effilées sur l'ensemble",
                "Saupoudrer de cannelle si désiré",
                "Servir immédiatement pour garder le croustillant du granola"
            ],
            "tips": [
                "Préférer le fromage blanc à 3% pour plus de crémeux",
                "Congeler les myrtilles 5 min avant pour un effet rafraîchissant",
                "Remplacer le granola par des flocons d'avoine grillés pour moins de sucre"
            ],
            "substitutions": {
                "fromage blanc": "Skyr ou yaourt grec",
                "banane": "Mangue ou fraises",
                "miel": "Sirop d'érable ou d'agave"
            }
        }
    },
    "Omelette 6 Oeufs Complète": {
        "proteins": 42,
        "fats": 35,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "8 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "6 oeufs entiers (calibre moyen)",
                "80g de jambon blanc en dés ou émincé",
                "60g de fromage râpé (emmental ou gruyère)",
                "1 cuillère à soupe d'huile d'olive",
                "Sel et poivre selon votre goût",
                "1 pincée de muscade râpée",
                "Quelques brins de ciboulette fraîche",
                "30ml de lait (environ 2 cuillères à soupe)"
            ],
            "steps": [
                "Casser les 6 oeufs dans un grand bol",
                "Ajouter le lait, le sel, le poivre et la muscade",
                "Battre vigoureusement avec une fourchette pendant 1 minute jusqu'à obtenir un mélange homogène et mousseux",
                "Couper le jambon en petits dés d'environ 1cm",
                "Faire chauffer l'huile d'olive dans une grande poêle antiadhésive à feu moyen",
                "Verser le mélange d'oeufs dans la poêle chaude",
                "Laisser cuire 2 minutes sans toucher, puis remuer délicatement avec une spatule en ramenant les bords vers le centre",
                "Quand l'omelette commence à prendre mais reste encore baveuse au centre (environ 4 min), ajouter le jambon et la moitié du fromage",
                "Replier l'omelette en deux et saupoudrer le reste du fromage",
                "Cuire encore 2 minutes jusqu'à ce que le fromage soit fondu",
                "Glisser dans l'assiette et parsemer de ciboulette ciselée"
            ],
            "tips": [
                "Ne pas trop battre les oeufs pour une texture plus moelleuse",
                "La poêle doit être bien chaude mais pas fumante",
                "Garder l'omelette légèrement baveuse au centre pour plus de fondant",
                "Utiliser des oeufs à température ambiante pour une cuisson plus uniforme"
            ],
            "substitutions": {
                "jambon": "Lardons, poulet ou tofu fumé",
                "emmental": "Comté, cheddar ou mozzarella"
            }
        }
    },
    "Pancakes Protéinés Banane": {
        "proteins": 35,
        "fats": 18,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "15 min",
            "servings": 2,
            "difficulty": "Facile",
            "ingredients": [
                "100g de flocons d'avoine mixés en farine",
                "2 bananes mûres (240g total)",
                "4 oeufs entiers",
                "30g de protéine whey vanille (1 scoop)",
                "150ml de lait demi-écrémé",
                "1 cuillère à café de levure chimique",
                "1 cuillère à café d'extrait de vanille",
                "1 pincée de sel",
                "Huile de coco pour la cuisson",
                "Sirop d'érable pour servir (optionnel)"
            ],
            "steps": [
                "Mixer les flocons d'avoine en farine fine dans un blender",
                "Écraser les bananes à la fourchette dans un grand bol jusqu'à obtenir une purée",
                "Ajouter les oeufs un par un en mélangeant bien après chaque addition",
                "Incorporer la farine d'avoine, la whey, la levure et le sel",
                "Verser progressivement le lait en mélangeant pour éviter les grumeaux",
                "Ajouter l'extrait de vanille et mélanger une dernière fois",
                "Laisser reposer la pâte 5 minutes pour qu'elle épaississe",
                "Faire chauffer une poêle à feu moyen avec un peu d'huile de coco",
                "Verser une petite louche de pâte (environ 60ml) pour chaque pancake",
                "Cuire 2-3 minutes jusqu'à ce que des bulles se forment à la surface",
                "Retourner délicatement et cuire 1-2 minutes de l'autre côté",
                "Répéter jusqu'à épuisement de la pâte (environ 8 pancakes)",
                "Empiler les pancakes et servir avec du sirop d'érable"
            ],
            "tips": [
                "Plus les bananes sont mûres (tachetées de brun), plus les pancakes seront sucrés naturellement",
                "Ne pas écraser la pâte avec la spatule pendant la cuisson",
                "Préchauffer le four à 80°C pour garder les premiers pancakes au chaud"
            ],
            "substitutions": {
                "flocons d'avoine": "Farine de blé complète",
                "whey vanille": "Whey chocolat ou nature",
                "lait": "Lait d'amande ou d'avoine"
            }
        }
    },
    "Poulet Grillé Riz Complet": {
        "proteins": 55,
        "fats": 12,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "25 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "250g de blanc de poulet (1 gros filet)",
                "150g de riz complet (poids cru)",
                "200g de brocolis frais",
                "2 cuillères à soupe d'huile d'olive",
                "2 gousses d'ail émincées",
                "1 citron (jus et zeste)",
                "1 cuillère à café de paprika fumé",
                "1/2 cuillère à café de curcuma",
                "Sel et poivre noir fraîchement moulu",
                "Quelques feuilles de persil frais"
            ],
            "steps": [
                "Rincer le riz complet sous l'eau froide et le mettre dans une casserole avec 2,5 fois son volume d'eau salée",
                "Porter à ébullition, puis réduire le feu et laisser cuire 20-25 minutes à couvert",
                "Pendant ce temps, préparer la marinade : mélanger 1 cuillère d'huile, le jus d'un demi-citron, le paprika, le curcuma, sel et poivre",
                "Aplatir légèrement le blanc de poulet entre deux feuilles de film alimentaire pour une épaisseur uniforme",
                "Badigeonner le poulet avec la marinade et laisser reposer 10 minutes",
                "Couper les brocolis en petits bouquets égaux",
                "Faire chauffer une poêle grill ou une poêle classique à feu vif avec un peu d'huile",
                "Saisir le poulet 4-5 minutes de chaque côté jusqu'à ce qu'il soit bien doré et cuit à coeur (température interne 74°C)",
                "Laisser reposer le poulet 3 minutes avant de le trancher",
                "Dans la même poêle, faire sauter les brocolis avec l'ail 4-5 minutes à feu vif",
                "Égoutter le riz et l'assaisonner avec le reste d'huile d'olive et le zeste de citron",
                "Dresser l'assiette : riz en base, poulet tranché par-dessus, brocolis sur le côté",
                "Arroser du reste de jus de citron et parsemer de persil"
            ],
            "tips": [
                "Sortir le poulet du frigo 20 min avant cuisson pour une cuisson plus uniforme",
                "Le riz complet nécessite plus d'eau et de temps que le riz blanc",
                "Ne pas percer le poulet pendant la cuisson pour garder le jus"
            ],
            "substitutions": {
                "poulet": "Dinde ou tofu ferme",
                "riz complet": "Quinoa ou boulgour",
                "brocolis": "Haricots verts ou asperges"
            }
        }
    },
    "Steak Haché Patates Douces": {
        "proteins": 50,
        "fats": 25,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "30 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "200g de steak haché 5% de matière grasse",
                "300g de patates douces (environ 2 moyennes)",
                "1 cuillère à soupe d'huile d'olive",
                "1 oignon moyen émincé",
                "2 gousses d'ail",
                "1 cuillère à café de romarin séché",
                "1 cuillère à café de thym",
                "Sel et poivre",
                "100g d'épinards frais",
                "1 cuillère à soupe de moutarde à l'ancienne"
            ],
            "steps": [
                "Préchauffer le four à 200°C (thermostat 6-7)",
                "Laver et éplucher les patates douces, les couper en cubes de 2cm",
                "Disposer les cubes sur une plaque de cuisson avec un filet d'huile, le romarin, sel et poivre",
                "Enfourner pour 25-30 minutes en retournant à mi-cuisson",
                "Former le steak haché en galette épaisse d'environ 2cm, assaisonner généreusement",
                "Faire chauffer une poêle à feu vif sans matière grasse",
                "Saisir le steak 3 minutes de chaque côté pour une cuisson saignante (4 min pour à point)",
                "Laisser reposer 2 minutes sur une planche",
                "Dans la même poêle, faire revenir l'oignon émincé avec l'ail à feu moyen 3 minutes",
                "Ajouter les épinards et les faire tomber 2 minutes",
                "Dresser : patates douces en base, steak par-dessus, légumes sur le côté",
                "Servir avec la moutarde à l'ancienne"
            ],
            "tips": [
                "Retourner les patates douces à mi-cuisson pour un dorage uniforme",
                "Ne pas écraser le steak pendant la cuisson",
                "Laisser reposer la viande permet de redistribuer les jus"
            ],
            "substitutions": {
                "steak haché": "Steak de boeuf ou galette végétale",
                "patates douces": "Pommes de terre ou courge butternut"
            }
        }
    },
    "Saumon Quinoa Avocat": {
        "proteins": 45,
        "fats": 35,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "20 min",
            "servings": 1,
            "difficulty": "Moyen",
            "ingredients": [
                "180g de pavé de saumon frais",
                "100g de quinoa (poids cru)",
                "1 avocat mûr",
                "1/2 concombre",
                "100g de tomates cerises",
                "2 cuillères à soupe d'huile d'olive",
                "1 citron vert (jus et zeste)",
                "1 cuillère à soupe de sauce soja",
                "1 cuillère à café de graines de sésame",
                "Quelques feuilles de coriandre fraîche",
                "Sel et poivre"
            ],
            "steps": [
                "Rincer le quinoa sous l'eau froide pour enlever l'amertume (saponine)",
                "Cuire le quinoa dans 2 fois son volume d'eau salée pendant 15 minutes",
                "Laisser reposer 5 minutes à couvert puis égrainer à la fourchette",
                "Préparer la sauce : mélanger le jus de citron vert, la sauce soja et 1 cuillère d'huile",
                "Couper le concombre en demi-rondelles et les tomates cerises en deux",
                "Ouvrir l'avocat, retirer le noyau et couper la chair en lamelles",
                "Assaisonner le saumon avec sel, poivre et un filet d'huile",
                "Faire chauffer une poêle antiadhésive à feu moyen-vif",
                "Cuire le saumon côté peau 4 minutes puis retourner et cuire 3 minutes (ajuster selon l'épaisseur)",
                "La chair doit rester légèrement rosée au centre pour un saumon fondant",
                "Dans un bol, disposer le quinoa tiède en base",
                "Ajouter le concombre, les tomates et l'avocat autour",
                "Déposer le saumon au centre et arroser de la sauce",
                "Parsemer de graines de sésame, zeste de citron et coriandre"
            ],
            "tips": [
                "Choisir un saumon d'élevage Label Rouge ou sauvage",
                "L'avocat doit céder légèrement sous la pression du doigt",
                "Le saumon continue de cuire après retrait du feu"
            ],
            "substitutions": {
                "saumon": "Truite ou maquereau",
                "quinoa": "Riz basmati ou boulgour",
                "avocat": "Edamames ou mangue"
            }
        }
    },
    
    # === PACK PERTE DE POIDS ===
    "Oeufs Brouillés Légumes": {
        "proteins": 24,
        "fats": 16,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "8 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "3 oeufs entiers",
                "100g de champignons de Paris émincés",
                "50g de tomates cerises",
                "50g d'épinards frais",
                "1 cuillère à café d'huile d'olive",
                "1 gousse d'ail émincée",
                "Sel et poivre",
                "1 cuillère à soupe de ciboulette ciselée",
                "30ml de lait écrémé (optionnel)"
            ],
            "steps": [
                "Laver et émincer les champignons en tranches fines",
                "Couper les tomates cerises en deux",
                "Battre les oeufs dans un bol avec le lait, sel et poivre",
                "Faire chauffer l'huile dans une poêle antiadhésive à feu moyen",
                "Faire revenir l'ail 30 secondes jusqu'à ce qu'il soit parfumé",
                "Ajouter les champignons et les faire sauter 3-4 minutes jusqu'à ce qu'ils soient dorés",
                "Ajouter les tomates et les épinards, cuire 1 minute jusqu'à ce que les épinards soient tombés",
                "Verser les oeufs battus sur les légumes",
                "Remuer délicatement avec une spatule en bois en formant de gros plis",
                "Retirer du feu quand les oeufs sont encore légèrement crémeux (ils finiront de cuire hors du feu)",
                "Servir immédiatement parsemé de ciboulette"
            ],
            "tips": [
                "Cuire les oeufs à feu doux pour une texture crémeuse",
                "Retirer du feu quand ils sont encore brillants",
                "Ajouter une pincée de paprika pour plus de saveur sans calories"
            ],
            "substitutions": {
                "champignons": "Courgettes ou poivrons",
                "épinards": "Roquette ou cresson"
            }
        }
    },
    "Smoothie Vert Détox": {
        "proteins": 8,
        "fats": 5,
        "recipe": {
            "prep_time": "5 min",
            "cook_time": "0 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "2 poignées d'épinards frais (60g)",
                "1/2 concombre pelé (100g)",
                "1 pomme verte (type Granny Smith)",
                "1/2 citron pressé",
                "1 morceau de gingembre frais (2cm)",
                "200ml d'eau froide ou de lait d'amande",
                "5-6 feuilles de menthe fraîche",
                "4-5 glaçons"
            ],
            "steps": [
                "Laver soigneusement les épinards et la menthe",
                "Peler le concombre et le couper en morceaux",
                "Éplucher et évider la pomme, la couper en quartiers",
                "Peler le gingembre et le râper finement",
                "Mettre tous les ingrédients dans le blender dans l'ordre : liquide d'abord, puis légumes feuilles, fruits et glaçons",
                "Mixer à haute vitesse pendant 45-60 secondes jusqu'à obtenir une texture lisse",
                "Si trop épais, ajouter un peu d'eau et mixer à nouveau",
                "Goûter et ajuster le citron selon vos préférences",
                "Verser dans un grand verre et servir immédiatement",
                "Décorer d'une feuille de menthe ou d'une rondelle de citron"
            ],
            "tips": [
                "Utiliser des épinards jeunes (baby spinach) pour un goût plus doux",
                "Le gingembre peut être ajusté selon votre tolérance au piquant",
                "Congeler la banane pour un smoothie plus crémeux",
                "Boire dans les 15 minutes pour profiter de tous les nutriments"
            ],
            "substitutions": {
                "épinards": "Kale ou mâche",
                "pomme verte": "Poire ou kiwi",
                "lait d'amande": "Eau de coco ou eau plate"
            }
        }
    },
    "Salade Poulet Grillé": {
        "proteins": 42,
        "fats": 12,
        "recipe": {
            "prep_time": "15 min",
            "cook_time": "12 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "150g de blanc de poulet",
                "100g de mesclun ou laitue variée",
                "1/2 concombre (80g)",
                "100g de tomates cerises",
                "50g de poivron rouge",
                "30g d'oignon rouge émincé finement",
                "1 cuillère à soupe d'huile d'olive",
                "1 cuillère à soupe de vinaigre balsamique",
                "1 cuillère à café de moutarde de Dijon",
                "1 gousse d'ail écrasée",
                "Herbes de Provence",
                "Sel et poivre"
            ],
            "steps": [
                "Sortir le poulet du réfrigérateur 15 minutes avant la cuisson",
                "Préparer la marinade : mélanger la moitié de l'huile avec l'ail, les herbes de Provence, sel et poivre",
                "Badigeonner le poulet avec la marinade",
                "Faire chauffer une poêle grill à feu vif",
                "Cuire le poulet 5-6 minutes de chaque côté selon l'épaisseur",
                "Laisser reposer 5 minutes puis trancher en lanières",
                "Pendant ce temps, préparer la vinaigrette : fouetter la moutarde, le vinaigre et le reste d'huile",
                "Laver et essorer le mesclun",
                "Couper le concombre en demi-rondelles, les tomates en deux, le poivron en lamelles",
                "Disposer le mesclun dans un grand bol ou assiette creuse",
                "Ajouter les légumes préparés et l'oignon rouge",
                "Déposer les lanières de poulet tiède par-dessus",
                "Arroser de vinaigrette et servir immédiatement"
            ],
            "tips": [
                "Le poulet doit être bien doré à l'extérieur mais juteux à l'intérieur",
                "Assaisonner la salade juste avant de servir",
                "Ajouter des graines (tournesol, courge) pour plus de croquant"
            ],
            "substitutions": {
                "poulet": "Dinde ou crevettes grillées",
                "mesclun": "Roquette ou épinards",
                "vinaigre balsamique": "Vinaigre de cidre"
            }
        }
    },
    "Saumon Vapeur Légumes Verts": {
        "proteins": 38,
        "fats": 18,
        "recipe": {
            "prep_time": "10 min",
            "cook_time": "15 min",
            "servings": 1,
            "difficulty": "Facile",
            "ingredients": [
                "150g de pavé de saumon frais",
                "150g de haricots verts frais ou surgelés",
                "100g de brocolis en bouquets",
                "100g de courgette",
                "1 citron",
                "2 cuillères à soupe d'aneth frais",
                "1 cuillère à café d'huile d'olive",
                "Sel et poivre blanc",
                "1 gousse d'ail"
            ],
            "steps": [
                "Remplir le fond du cuiseur vapeur ou d'une casserole avec de l'eau",
                "Porter l'eau à ébullition",
                "Pendant ce temps, couper la courgette en rondelles de 1cm",
                "Équeuter les haricots verts et les couper en tronçons de 4cm",
                "Séparer les brocolis en petits bouquets",
                "Assaisonner le saumon avec sel, poivre et quelques gouttes de citron",
                "Placer les légumes dans le panier vapeur avec l'ail écrasé",
                "Cuire les légumes 5 minutes",
                "Ajouter le saumon par-dessus les légumes",
                "Poursuivre la cuisson 8-10 minutes selon l'épaisseur du pavé",
                "Le saumon est cuit quand il s'effeuille facilement à la fourchette",
                "Dresser les légumes en lit, poser le saumon dessus",
                "Arroser d'un filet d'huile d'olive et du jus de citron restant",
                "Parsemer d'aneth frais ciselé"
            ],
            "tips": [
                "La cuisson vapeur préserve les nutriments et oméga-3 du saumon",
                "Vérifier la cuisson en appuyant sur le saumon : il doit être ferme mais souple",
                "Servir avec un quartier de citron pour ceux qui aiment plus d'acidité"
            ],
            "substitutions": {
                "saumon": "Cabillaud ou colin",
                "haricots verts": "Asperges vertes",
                "aneth": "Persil ou ciboulette"
            }
        }
    },
    "Buddha Bowl Quinoa": {
        "proteins": 18,
        "fats": 22,
        "recipe": {
            "prep_time": "20 min",
            "cook_time": "15 min",
            "servings": 1,
            "difficulty": "Moyen",
            "ingredients": [
                "80g de quinoa (poids cru)",
                "100g de pois chiches en conserve (égouttés)",
                "1 carotte moyenne râpée",
                "1/2 avocat mûr",
                "50g de chou rouge émincé finement",
                "50g de concombre",
                "30g de graines de grenade (optionnel)",
                "2 cuillères à soupe de houmous",
                "1 cuillère à soupe de tahini (purée de sésame)",
                "1/2 citron",
                "1 cuillère à café de cumin",
                "Sel, poivre et paprika"
            ],
            "steps": [
                "Rincer le quinoa plusieurs fois sous l'eau froide",
                "Cuire le quinoa 12-15 minutes dans 2 fois son volume d'eau salée",
                "Égoutter et laisser refroidir à température ambiante",
                "Rincer et égoutter les pois chiches, les assaisonner de cumin et paprika",
                "Faire rôtir les pois chiches à la poêle 5 minutes pour les rendre croustillants (optionnel)",
                "Râper la carotte et émincer finement le chou rouge",
                "Couper le concombre en demi-rondelles et l'avocat en lamelles",
                "Préparer la sauce : mélanger le tahini, le jus de citron et 2 cuillères d'eau",
                "Disposer le quinoa dans un grand bol",
                "Arranger harmonieusement chaque ingrédient en sections : carotte, chou, concombre, avocat, pois chiches",
                "Ajouter une quenelle de houmous au centre",
                "Arroser de la sauce tahini",
                "Parsemer de graines de grenade si désiré"
            ],
            "tips": [
                "Préparer tous les légumes en même temps pour un dressage efficace",
                "Le Buddha Bowl se mange en mélangeant tous les ingrédients",
                "Ajouter une poignée de feuilles de menthe pour la fraîcheur"
            ],
            "substitutions": {
                "quinoa": "Riz complet ou boulgour",
                "pois chiches": "Edamames ou lentilles",
                "tahini": "Yaourt grec nature"
            }
        }
    },
    "Blanc de Poulet Ratatouille": {
        "proteins": 40,
        "fats": 10,
        "recipe": {
            "prep_time": "20 min",
            "cook_time": "35 min",
            "servings": 2,
            "difficulty": "Moyen",
            "ingredients": [
                "250g de blanc de poulet (2 petits filets)",
                "1 courgette moyenne (200g)",
                "1 aubergine moyenne (200g)",
                "1 poivron rouge",
                "1 poivron jaune",
                "3 tomates mûres (ou 400g de tomates concassées)",
                "1 oignon",
                "3 gousses d'ail",
                "2 cuillères à soupe d'huile d'olive",
                "1 bouquet garni (thym, laurier, romarin)",
                "Sel, poivre et herbes de Provence"
            ],
            "steps": [
                "Laver tous les légumes",
                "Couper la courgette et l'aubergine en cubes de 2cm",
                "Épépiner les poivrons et les couper en lanières",
                "Émincer l'oignon et hacher l'ail",
                "Faire chauffer 1 cuillère d'huile dans une grande sauteuse à feu moyen",
                "Faire revenir l'oignon 3 minutes jusqu'à ce qu'il soit translucide",
                "Ajouter l'aubergine et les cuire 5 minutes en remuant",
                "Ajouter la courgette et les poivrons, cuire 5 minutes",
                "Incorporer les tomates concassées, l'ail et le bouquet garni",
                "Assaisonner de sel, poivre et herbes de Provence",
                "Laisser mijoter 20 minutes à feu doux en remuant occasionnellement",
                "Pendant ce temps, assaisonner les blancs de poulet",
                "Faire cuire le poulet dans une poêle à part 5-6 minutes par côté",
                "Laisser reposer 3 minutes puis trancher",
                "Servir la ratatouille avec le poulet tranché par-dessus"
            ],
            "tips": [
                "L'aubergine absorbe beaucoup d'huile, ne pas en rajouter",
                "La ratatouille est encore meilleure réchauffée le lendemain",
                "Retirer le bouquet garni avant de servir"
            ],
            "substitutions": {
                "poulet": "Filet de dinde ou poisson blanc",
                "tomates fraîches": "Tomates pelées en conserve"
            }
        }
    }
}

async def update_supplements():
    print("Mise à jour des recettes...")
    
    # Récupérer tous les suppléments
    supplements = await db.supplements.find({}).to_list(100)
    
    updated_count = 0
    
    for supplement in supplements:
        supplement_id = supplement.get('supplement_id')
        meals = supplement.get('meals', [])
        modified = False
        
        for i, meal in enumerate(meals):
            meal_name = meal.get('name', '')
            
            # Vérifier si on a une recette complète pour ce repas
            if meal_name in COMPLETE_RECIPES:
                recipe_data = COMPLETE_RECIPES[meal_name]
                
                # Mettre à jour les protéines et lipides si None
                if meal.get('proteins') is None or str(meal.get('proteins')) == 'None':
                    meals[i]['proteins'] = recipe_data['proteins']
                    modified = True
                    
                if meal.get('fats') is None or str(meal.get('fats')) == 'None':
                    meals[i]['fats'] = recipe_data['fats']
                    modified = True
                
                # Mettre à jour la recette complète
                meals[i]['recipe'] = recipe_data['recipe']
                modified = True
                
                print(f"  ✓ Mise à jour: {meal_name}")
        
        if modified:
            await db.supplements.update_one(
                {"supplement_id": supplement_id},
                {"$set": {"meals": meals}}
            )
            updated_count += 1
            print(f"  → Supplément {supplement.get('title')} mis à jour")
    
    print(f"\n✅ {updated_count} suppléments mis à jour avec recettes complètes")

if __name__ == "__main__":
    asyncio.run(update_supplements())
