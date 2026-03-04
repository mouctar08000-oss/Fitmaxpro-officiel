import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ===========================
# EXERCICES - IMAGES & VIDÉOS
# ===========================

# Dictionnaire des médias pour chaque type d'exercice
EXERCISE_MEDIA = {
    # Exercices de poitrine/pectoraux
    "développé couché": {
        "image_url": "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/rT7DgCr-3pg"
    },
    "développé incliné": {
        "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/8iPEnn-ltC8"
    },
    "développé décliné": {
        "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/LfyQBUKR8SE"
    },
    "pompes": {
        "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/IODxDxX7oi4"
    },
    "écarté": {
        "image_url": "https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/eozdVDA78K0"
    },
    "dips": {
        "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/2z8JmcrW-As"
    },
    "crossover": {
        "image_url": "https://images.pexels.com/photos/4162585/pexels-photo-4162585.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/taI4XduLpTk"
    },
    
    # Exercices de dos
    "tractions": {
        "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/eGo4IYlbE5g"
    },
    "rowing": {
        "image_url": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/kBWAon7ItDw"
    },
    "tirage": {
        "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/CAwf7n6Luuc"
    },
    "soulevé de terre": {
        "image_url": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/op9kVnSso6Q"
    },
    "pullover": {
        "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/FK4rHfWKEac"
    },
    "shrugs": {
        "image_url": "https://images.pexels.com/photos/4162509/pexels-photo-4162509.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/cJRVVxmytaM"
    },
    "face pull": {
        "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/rep-qVOkqgk"
    },
    
    # Exercices d'épaules
    "développé militaire": {
        "image_url": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/2yjwXTZQDDI"
    },
    "développé épaules": {
        "image_url": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/qEwKCR5JCog"
    },
    "élévations latérales": {
        "image_url": "https://images.pexels.com/photos/4162588/pexels-photo-4162588.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/3VcKaXpzqRo"
    },
    "oiseau": {
        "image_url": "https://images.pexels.com/photos/4162588/pexels-photo-4162588.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/ttvfGg9d76c"
    },
    "développé arnold": {
        "image_url": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/6Z15_WdXmVw"
    },
    
    # Exercices de bras - Biceps
    "curl": {
        "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/ykJmrZ5v0Oo"
    },
    "curl marteau": {
        "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/zC3nLlEvin4"
    },
    "curl incliné": {
        "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/soxrZlIl35U"
    },
    
    # Exercices de bras - Triceps
    "extension triceps": {
        "image_url": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/nRiJVZDpdL0"
    },
    "barre au front": {
        "image_url": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/d_KZxkY_0cM"
    },
    
    # Exercices de jambes
    "squat": {
        "image_url": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/ultWZbUMPL8"
    },
    "presse": {
        "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/IZxyjW7MPJQ"
    },
    "fentes": {
        "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/QOVaHwm-Q6U"
    },
    "leg curl": {
        "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/1Tq3QdYUuHs"
    },
    "leg extension": {
        "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/YyvSfVjQeL0"
    },
    "mollets": {
        "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/-M4-G8p8fmc"
    },
    "hip thrust": {
        "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
    },
    "hack squat": {
        "image_url": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/0tn5K9NlCfo"
    },
    "front squat": {
        "image_url": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/m4ytaCJZpl0"
    },
    "sissy squat": {
        "image_url": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/ie_Px3VPqEg"
    },
    
    # Exercices abdominaux/core
    "planche": {
        "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/ASdvN_XEl_c"
    },
    "crunch": {
        "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/Xyd_fa5zoEU"
    },
    
    # Exercices cardio/HIIT
    "jumping jacks": {
        "image_url": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/c4DAnQ6DtF8"
    },
    "burpees": {
        "image_url": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/dZgVxmf6jkA"
    },
    "mountain climbers": {
        "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/nmwgirgXLYM"
    },
    "sprint": {
        "image_url": "https://images.pexels.com/photos/6389072/pexels-photo-6389072.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/6t1rOhh8aGs"
    },
    "vélo": {
        "image_url": "https://images.pexels.com/photos/4162584/pexels-photo-4162584.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/WvLOa2gIDQk"
    },
    "elliptique": {
        "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/slrZxv2Pl9k"
    },
    "marche": {
        "image_url": "https://images.pexels.com/photos/6389072/pexels-photo-6389072.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/86uY6RPy4Mc"
    },
    "box jump": {
        "image_url": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/52r_Ul5k03g"
    },
    "kettlebell": {
        "image_url": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/YSxHifyI6s8"
    },
    "thruster": {
        "image_url": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/L219ltL15zk"
    },
    "rameur": {
        "image_url": "https://images.pexels.com/photos/4162584/pexels-photo-4162584.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/Gim-VL3B_6E"
    },
    "wall ball": {
        "image_url": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/fpUD0mcFp_0"
    },
    "corde": {
        "image_url": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/u3zgHI8QnqE"
    },
    "battle rope": {
        "image_url": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/bxypLqAM2AI"
    },
    "assault bike": {
        "image_url": "https://images.pexels.com/photos/4162584/pexels-photo-4162584.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/2flE4uKnDqE"
    },
    "toes to bar": {
        "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/lR3Vti6G5K8"
    },
    "double under": {
        "image_url": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/82jNjDS19lg"
    },
    "clean": {
        "image_url": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/EKRiW9Yt3Ps"
    },
    "snatch": {
        "image_url": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/3jdGt9cftyU"
    },
    
    # Échauffement/Étirements
    "échauffement": {
        "image_url": "https://images.pexels.com/photos/6456141/pexels-photo-6456141.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/Hm2p1VqYXTQ"
    },
    "étirements": {
        "image_url": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/SsT_go-oCcQ"
    },
}

# Image par défaut pour exercices sans correspondance
DEFAULT_EXERCISE_MEDIA = {
    "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600",
    "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
}

def find_exercise_media(exercise_name):
    """Trouve les médias correspondants à un exercice"""
    name_lower = exercise_name.lower()
    
    for keyword, media in EXERCISE_MEDIA.items():
        if keyword in name_lower:
            return media
    
    return DEFAULT_EXERCISE_MEDIA

# ===========================
# SUPPLÉMENTS NUTRITION
# ===========================

SUPPLEMENTS_FR = [
    {
        "supplement_id": f"supp_{uuid.uuid4().hex[:8]}",
        "title": "Pack Prise de Masse",
        "description": "Programme nutritionnel complet pour maximiser vos gains musculaires. Inclut protéines, créatine et conseils alimentaires.",
        "program_type": "mass_gain",
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/EpnIrX1zYz0",
        "nutrients": [
            {
                "name": "Whey Protéine",
                "dosage": "30g",
                "timing": "Post-entraînement (30 min après)",
                "description": "Protéine à digestion rapide pour la récupération musculaire",
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/QK8kBOvh1vM"
            },
            {
                "name": "Créatine Monohydrate",
                "dosage": "5g",
                "timing": "Quotidien, avec un repas",
                "description": "Améliore la force et les performances lors des exercices intenses",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/FDgSfmKPODk"
            },
            {
                "name": "BCAA (Acides Aminés)",
                "dosage": "10g",
                "timing": "Pendant l'entraînement",
                "description": "Prévient le catabolisme musculaire et améliore la récupération",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/iA3EMNBmQBo"
            },
            {
                "name": "Gainers",
                "dosage": "100g",
                "timing": "Entre les repas ou post-entraînement",
                "description": "Apport calorique élevé pour les personnes ayant du mal à prendre du poids",
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/GAvW6xBZjSk"
            }
        ],
        "meals": [
            {
                "name": "Petit-déjeuner Prise de Masse",
                "description": "Flocons d'avoine, oeufs, banane et beurre de cacahuète",
                "calories": 750,
                "proteins": 45,
                "carbs": 85,
                "fats": 25,
                "image_url": "https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/fLjz9-LjvDk"
            },
            {
                "name": "Déjeuner Hyperprotéiné",
                "description": "Poulet grillé, riz complet, légumes verts et avocat",
                "calories": 850,
                "proteins": 55,
                "carbs": 90,
                "fats": 30,
                "image_url": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/nMFjHUbnXJw"
            },
            {
                "name": "Collation Anabolique",
                "description": "Shake protéiné avec fruits, flocons d'avoine et amandes",
                "calories": 550,
                "proteins": 40,
                "carbs": 55,
                "fats": 18,
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/GhFx7KVT-0s"
            },
            {
                "name": "Dîner Récupération",
                "description": "Saumon, patate douce, brocoli et sauce crémeuse",
                "calories": 700,
                "proteins": 50,
                "carbs": 60,
                "fats": 28,
                "image_url": "https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/KZRb5Y6pBHw"
            }
        ]
    },
    {
        "supplement_id": f"supp_{uuid.uuid4().hex[:8]}",
        "title": "Pack Perte de Poids",
        "description": "Programme nutritionnel optimisé pour brûler les graisses tout en préservant la masse musculaire.",
        "program_type": "weight_loss",
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/iU8IzOKvDEw",
        "nutrients": [
            {
                "name": "Brûleur de Graisse (Thermogénique)",
                "dosage": "2 capsules",
                "timing": "Matin et midi, avant les repas",
                "description": "Accélère le métabolisme et augmente la dépense énergétique",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/LDqUvbVyH-s"
            },
            {
                "name": "L-Carnitine",
                "dosage": "2g",
                "timing": "30 min avant l'entraînement",
                "description": "Transporte les acides gras vers les mitochondries pour être brûlés",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/JM2zJLwskI8"
            },
            {
                "name": "CLA (Acide Linoléique Conjugué)",
                "dosage": "3g",
                "timing": "Avec les repas principaux",
                "description": "Aide à réduire la masse grasse et à maintenir la masse maigre",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/qQJx3bnUqmI"
            },
            {
                "name": "Protéine Isolate (faible en glucides)",
                "dosage": "25g",
                "timing": "Post-entraînement",
                "description": "Protéine pure pour maintenir la masse musculaire en déficit calorique",
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/LRJo8D17WLk"
            }
        ],
        "meals": [
            {
                "name": "Petit-déjeuner Brûle-Graisse",
                "description": "Omelette aux blancs d'oeufs, épinards, tomates et avocat",
                "calories": 350,
                "proteins": 30,
                "carbs": 12,
                "fats": 22,
                "image_url": "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/qWAagS_MANg"
            },
            {
                "name": "Déjeuner Light & Protéiné",
                "description": "Salade de thon, quinoa, concombre et vinaigrette citronnée",
                "calories": 400,
                "proteins": 40,
                "carbs": 30,
                "fats": 14,
                "image_url": "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/RMxmfQoGPzE"
            },
            {
                "name": "Collation Coupe-Faim",
                "description": "Yaourt grec 0%, amandes et fruits rouges",
                "calories": 200,
                "proteins": 20,
                "carbs": 15,
                "fats": 8,
                "image_url": "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/XZsC47UQKAQ"
            },
            {
                "name": "Dîner Léger",
                "description": "Cabillaud vapeur, haricots verts et salade verte",
                "calories": 300,
                "proteins": 35,
                "carbs": 15,
                "fats": 10,
                "image_url": "https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/3_sJyeLwETE"
            }
        ]
    }
]

SUPPLEMENTS_EN = [
    {
        "supplement_id": f"supp_{uuid.uuid4().hex[:8]}",
        "title": "Mass Gain Pack",
        "description": "Complete nutrition program to maximize your muscle gains. Includes proteins, creatine and dietary advice.",
        "program_type": "mass_gain",
        "language": "en",
        "image_url": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/EpnIrX1zYz0",
        "nutrients": [
            {
                "name": "Whey Protein",
                "dosage": "30g",
                "timing": "Post-workout (30 min after)",
                "description": "Fast-digesting protein for muscle recovery",
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/QK8kBOvh1vM"
            },
            {
                "name": "Creatine Monohydrate",
                "dosage": "5g",
                "timing": "Daily, with a meal",
                "description": "Improves strength and performance during intense exercise",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/FDgSfmKPODk"
            },
            {
                "name": "BCAAs (Amino Acids)",
                "dosage": "10g",
                "timing": "During workout",
                "description": "Prevents muscle breakdown and improves recovery",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/iA3EMNBmQBo"
            },
            {
                "name": "Mass Gainers",
                "dosage": "100g",
                "timing": "Between meals or post-workout",
                "description": "High caloric intake for hardgainers",
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/GAvW6xBZjSk"
            }
        ],
        "meals": [
            {
                "name": "Mass Gain Breakfast",
                "description": "Oatmeal, eggs, banana and peanut butter",
                "calories": 750,
                "proteins": 45,
                "carbs": 85,
                "fats": 25,
                "image_url": "https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/fLjz9-LjvDk"
            },
            {
                "name": "High-Protein Lunch",
                "description": "Grilled chicken, brown rice, green vegetables and avocado",
                "calories": 850,
                "proteins": 55,
                "carbs": 90,
                "fats": 30,
                "image_url": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/nMFjHUbnXJw"
            },
            {
                "name": "Anabolic Snack",
                "description": "Protein shake with fruits, oats and almonds",
                "calories": 550,
                "proteins": 40,
                "carbs": 55,
                "fats": 18,
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/GhFx7KVT-0s"
            },
            {
                "name": "Recovery Dinner",
                "description": "Salmon, sweet potato, broccoli and creamy sauce",
                "calories": 700,
                "proteins": 50,
                "carbs": 60,
                "fats": 28,
                "image_url": "https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/KZRb5Y6pBHw"
            }
        ]
    },
    {
        "supplement_id": f"supp_{uuid.uuid4().hex[:8]}",
        "title": "Weight Loss Pack",
        "description": "Optimized nutrition program to burn fat while preserving muscle mass.",
        "program_type": "weight_loss",
        "language": "en",
        "image_url": "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600",
        "video_url": "https://www.youtube.com/embed/iU8IzOKvDEw",
        "nutrients": [
            {
                "name": "Fat Burner (Thermogenic)",
                "dosage": "2 capsules",
                "timing": "Morning and noon, before meals",
                "description": "Speeds up metabolism and increases energy expenditure",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/LDqUvbVyH-s"
            },
            {
                "name": "L-Carnitine",
                "dosage": "2g",
                "timing": "30 min before workout",
                "description": "Transports fatty acids to mitochondria to be burned",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/JM2zJLwskI8"
            },
            {
                "name": "CLA (Conjugated Linoleic Acid)",
                "dosage": "3g",
                "timing": "With main meals",
                "description": "Helps reduce fat mass and maintain lean mass",
                "image_url": "https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/qQJx3bnUqmI"
            },
            {
                "name": "Isolate Protein (low carb)",
                "dosage": "25g",
                "timing": "Post-workout",
                "description": "Pure protein to maintain muscle mass in caloric deficit",
                "image_url": "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/LRJo8D17WLk"
            }
        ],
        "meals": [
            {
                "name": "Fat-Burning Breakfast",
                "description": "Egg white omelette, spinach, tomatoes and avocado",
                "calories": 350,
                "proteins": 30,
                "carbs": 12,
                "fats": 22,
                "image_url": "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/qWAagS_MANg"
            },
            {
                "name": "Light & Protein Lunch",
                "description": "Tuna salad, quinoa, cucumber and lemon vinaigrette",
                "calories": 400,
                "proteins": 40,
                "carbs": 30,
                "fats": 14,
                "image_url": "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/RMxmfQoGPzE"
            },
            {
                "name": "Appetite Suppressant Snack",
                "description": "Greek yogurt 0%, almonds and berries",
                "calories": 200,
                "proteins": 20,
                "carbs": 15,
                "fats": 8,
                "image_url": "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/XZsC47UQKAQ"
            },
            {
                "name": "Light Dinner",
                "description": "Steamed cod, green beans and green salad",
                "calories": 300,
                "proteins": 35,
                "carbs": 15,
                "fats": 10,
                "image_url": "https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/3_sJyeLwETE"
            }
        ]
    }
]

async def update_workouts_with_media():
    """Met à jour tous les exercices avec leurs images et vidéos"""
    print("🏋️ Mise à jour des exercices avec médias...")
    
    workouts = await db.workouts.find({}).to_list(1000)
    updated_count = 0
    
    for workout in workouts:
        updated_exercises = []
        for exercise in workout.get('exercises', []):
            media = find_exercise_media(exercise['name'])
            exercise['image_url'] = media['image_url']
            exercise['video_url'] = media['video_url']
            updated_exercises.append(exercise)
        
        # Update this specific workout document (use _id for exact match)
        await db.workouts.update_one(
            {"workout_id": workout['workout_id'], "language": workout['language']},
            {"$set": {"exercises": updated_exercises}}
        )
        updated_count += 1
    
    print(f"✅ {updated_count} programmes mis à jour avec médias")

async def seed_supplements():
    """Ajoute les suppléments avec médias"""
    print("💊 Ajout des suppléments nutritionnels...")
    
    # Supprimer les anciens suppléments
    await db.supplements.delete_many({})
    print("✅ Anciens suppléments supprimés")
    
    # Insérer les nouveaux
    all_supplements = SUPPLEMENTS_FR + SUPPLEMENTS_EN
    await db.supplements.insert_many(all_supplements)
    
    print(f"✅ {len(SUPPLEMENTS_FR)} suppléments FR ajoutés")
    print(f"✅ {len(SUPPLEMENTS_EN)} suppléments EN ajoutés")

async def main():
    print("=" * 50)
    print("🚀 Mise à jour du contenu avec médias")
    print("=" * 50)
    
    await update_workouts_with_media()
    await seed_supplements()
    
    print("\n" + "=" * 50)
    print("✅ TERMINÉ - Tous les médias ont été ajoutés !")
    print("=" * 50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
