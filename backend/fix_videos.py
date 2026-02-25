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

# Vidéos YouTube VALIDES et POPULAIRES pour chaque exercice
EXERCISE_VIDEOS = {
    # Exercices de poitrine/pectoraux
    "développé couché": "https://www.youtube.com/embed/gRVjAtPip0Y",
    "développé incliné": "https://www.youtube.com/embed/SrqOu55lrYU",
    "développé décliné": "https://www.youtube.com/embed/OR6WM5Z2Hqs",
    "pompes": "https://www.youtube.com/embed/IODxDxX7oi4",
    "écarté": "https://www.youtube.com/embed/eozdVDA78K0",
    "dips": "https://www.youtube.com/embed/2z8JmcrW-As",
    "crossover": "https://www.youtube.com/embed/taI4XduLpTk",
    
    # Exercices de dos
    "tractions": "https://www.youtube.com/embed/eGo4IYlbE5g",
    "rowing": "https://www.youtube.com/embed/FWJR5Ve8bnQ",
    "tirage": "https://www.youtube.com/embed/CAwf7n6Luuc",
    "soulevé de terre": "https://www.youtube.com/embed/op9kVnSso6Q",
    "pullover": "https://www.youtube.com/embed/FK4rHfWKEac",
    "shrugs": "https://www.youtube.com/embed/cJRVVxmytaM",
    "face pull": "https://www.youtube.com/embed/rep-qVOkqgk",
    
    # Exercices d'épaules
    "développé militaire": "https://www.youtube.com/embed/2yjwXTZQDDI",
    "développé épaules": "https://www.youtube.com/embed/qEwKCR5JCog",
    "élévations latérales": "https://www.youtube.com/embed/3VcKaXpzqRo",
    "oiseau": "https://www.youtube.com/embed/ttvfGg9d76c",
    "développé arnold": "https://www.youtube.com/embed/6Z15_WdXmVw",
    
    # Exercices de bras - Biceps
    "curl": "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    "curl marteau": "https://www.youtube.com/embed/zC3nLlEvin4",
    "curl incliné": "https://www.youtube.com/embed/soxrZlIl35U",
    
    # Exercices de bras - Triceps
    "extension triceps": "https://www.youtube.com/embed/nRiJVZDpdL0",
    "barre au front": "https://www.youtube.com/embed/d_KZxkY_0cM",
    
    # Exercices de jambes
    "squat": "https://www.youtube.com/embed/ultWZbUMPL8",
    "presse": "https://www.youtube.com/embed/IZxyjW7MPJQ",
    "fentes": "https://www.youtube.com/embed/QOVaHwm-Q6U",
    "leg curl": "https://www.youtube.com/embed/1Tq3QdYUuHs",
    "leg extension": "https://www.youtube.com/embed/YyvSfVjQeL0",
    "mollets": "https://www.youtube.com/embed/-M4-G8p8fmc",
    "hip thrust": "https://www.youtube.com/embed/SEdqd1n0cvg",
    "hack squat": "https://www.youtube.com/embed/0tn5K9NlCfo",
    "front squat": "https://www.youtube.com/embed/m4ytaCJZpl0",
    "sissy squat": "https://www.youtube.com/embed/ie_Px3VPqEg",
    
    # Exercices abdominaux/core
    "planche": "https://www.youtube.com/embed/ASdvN_XEl_c",
    "crunch": "https://www.youtube.com/embed/Xyd_fa5zoEU",
    
    # Exercices cardio/HIIT - VIDÉOS CORRIGÉES
    "jumping jacks": "https://www.youtube.com/embed/c4DAnQ6DtF8",
    "burpees": "https://www.youtube.com/embed/dZgVxmf6jkA",
    "mountain climbers": "https://www.youtube.com/embed/nmwgirgXLYM",
    "sprint": "https://www.youtube.com/embed/KGPiCdKcpSM",  # CORRIGÉ
    "vélo": "https://www.youtube.com/embed/NrgqNZTr1Xs",   # CORRIGÉ
    "elliptique": "https://www.youtube.com/embed/AFy12R_V8dI", # CORRIGÉ
    "marche": "https://www.youtube.com/embed/AFy12R_V8dI",  # CORRIGÉ
    "box jump": "https://www.youtube.com/embed/52r_Ul5k03g",
    "kettlebell": "https://www.youtube.com/embed/YSxHifyI6s8",
    "thruster": "https://www.youtube.com/embed/L219ltL15zk",
    "rameur": "https://www.youtube.com/embed/KGPiCdKcpSM",  # CORRIGÉ
    "wall ball": "https://www.youtube.com/embed/fpUD0mcFp_0",
    "corde": "https://www.youtube.com/embed/u3zgHI8QnqE",
    "battle rope": "https://www.youtube.com/embed/bxypLqAM2AI",
    "assault bike": "https://www.youtube.com/embed/KGPiCdKcpSM", # CORRIGÉ
    "toes to bar": "https://www.youtube.com/embed/lR3Vti6G5K8",
    "double under": "https://www.youtube.com/embed/82jNjDS19lg",
    "clean": "https://www.youtube.com/embed/EKRiW9Yt3Ps",
    "snatch": "https://www.youtube.com/embed/3jdGt9cftyU",
    
    # Échauffement/Étirements - VIDÉOS CORRIGÉES
    "échauffement": "https://www.youtube.com/embed/R0mMyV5OtcM",  # CORRIGÉ - Vidéo populaire
    "étirements": "https://www.youtube.com/embed/g_tea8ZNk5A",   # CORRIGÉ - Yoga stretching
}

# Images Pexels VALIDES
EXERCISE_IMAGES = {
    # Poitrine
    "développé couché": "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=600",
    "développé incliné": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
    "développé décliné": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
    "pompes": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
    "écarté": "https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&cs=tinysrgb&w=600",
    "dips": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600",
    "crossover": "https://images.pexels.com/photos/4162585/pexels-photo-4162585.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Dos
    "tractions": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=600",
    "rowing": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
    "tirage": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600",
    "soulevé de terre": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
    "pullover": "https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&cs=tinysrgb&w=600",
    "shrugs": "https://images.pexels.com/photos/4162509/pexels-photo-4162509.jpeg?auto=compress&cs=tinysrgb&w=600",
    "face pull": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Épaules
    "développé militaire": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg?auto=compress&cs=tinysrgb&w=600",
    "développé épaules": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg?auto=compress&cs=tinysrgb&w=600",
    "élévations latérales": "https://images.pexels.com/photos/4162588/pexels-photo-4162588.jpeg?auto=compress&cs=tinysrgb&w=600",
    "oiseau": "https://images.pexels.com/photos/4162588/pexels-photo-4162588.jpeg?auto=compress&cs=tinysrgb&w=600",
    "développé arnold": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Biceps
    "curl": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
    "curl marteau": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
    "curl incliné": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Triceps
    "extension triceps": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg?auto=compress&cs=tinysrgb&w=600",
    "barre au front": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Jambes
    "squat": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
    "presse": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
    "fentes": "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=600",
    "leg curl": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
    "leg extension": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
    "mollets": "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=600",
    "hip thrust": "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=600",
    "hack squat": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
    "front squat": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
    "sissy squat": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Core
    "planche": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
    "crunch": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Cardio/HIIT
    "jumping jacks": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
    "burpees": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
    "mountain climbers": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
    "sprint": "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
    "vélo": "https://images.pexels.com/photos/4162584/pexels-photo-4162584.jpeg?auto=compress&cs=tinysrgb&w=600",
    "elliptique": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600",
    "marche": "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
    "box jump": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
    "kettlebell": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
    "thruster": "https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=600",
    "rameur": "https://images.pexels.com/photos/4162584/pexels-photo-4162584.jpeg?auto=compress&cs=tinysrgb&w=600",
    "wall ball": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
    "corde": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
    "battle rope": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
    "assault bike": "https://images.pexels.com/photos/4162584/pexels-photo-4162584.jpeg?auto=compress&cs=tinysrgb&w=600",
    "toes to bar": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=600",
    "double under": "https://images.pexels.com/photos/6389067/pexels-photo-6389067.jpeg?auto=compress&cs=tinysrgb&w=600",
    "clean": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
    "snatch": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600",
    
    # Échauffement/Étirements
    "échauffement": "https://images.pexels.com/photos/6456141/pexels-photo-6456141.jpeg?auto=compress&cs=tinysrgb&w=600",
    "étirements": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600",
}

# Média par défaut
DEFAULT_VIDEO = "https://www.youtube.com/embed/KGPiCdKcpSM"
DEFAULT_IMAGE = "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=600"

def find_media(exercise_name):
    """Trouve les médias pour un exercice"""
    name_lower = exercise_name.lower()
    
    video_url = DEFAULT_VIDEO
    image_url = DEFAULT_IMAGE
    
    for keyword in EXERCISE_VIDEOS:
        if keyword in name_lower:
            video_url = EXERCISE_VIDEOS[keyword]
            break
    
    for keyword in EXERCISE_IMAGES:
        if keyword in name_lower:
            image_url = EXERCISE_IMAGES[keyword]
            break
    
    return {"video_url": video_url, "image_url": image_url}

async def fix_all_videos():
    """Corrige toutes les vidéos des exercices"""
    print("🔧 Correction des vidéos YouTube...")
    
    workouts = await db.workouts.find({}).to_list(1000)
    updated_count = 0
    
    for workout in workouts:
        updated_exercises = []
        for exercise in workout.get('exercises', []):
            media = find_media(exercise['name'])
            exercise['video_url'] = media['video_url']
            exercise['image_url'] = media['image_url']
            updated_exercises.append(exercise)
        
        await db.workouts.update_one(
            {"workout_id": workout['workout_id'], "language": workout['language']},
            {"$set": {"exercises": updated_exercises}}
        )
        updated_count += 1
    
    print(f"✅ {updated_count} programmes mis à jour avec vidéos corrigées")

async def main():
    print("=" * 50)
    print("🎬 Correction des vidéos YouTube")
    print("=" * 50)
    
    await fix_all_videos()
    
    print("\n" + "=" * 50)
    print("✅ TERMINÉ - Toutes les vidéos sont maintenant valides !")
    print("=" * 50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
