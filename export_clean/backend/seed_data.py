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

workouts_fr = [
    {
        "workout_id": f"workout_{uuid.uuid4().hex[:8]}",
        "title": "Programme Débutant - Prise de Masse",
        "description": "Un programme parfait pour commencer votre transformation physique avec des exercices de base.",
        "level": "beginner",
        "program_type": "mass_gain",
        "duration": 45,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Développé couché", "sets": 3, "reps": "10-12", "rest": "90s"},
            {"name": "Squats", "sets": 3, "reps": "12-15", "rest": "90s"},
            {"name": "Rowing barre", "sets": 3, "reps": "10-12", "rest": "90s"},
            {"name": "Développé épaules", "sets": 3, "reps": "10-12", "rest": "60s"}
        ]
    },
    {
        "workout_id": f"workout_{uuid.uuid4().hex[:8]}",
        "title": "Programme Amateur - Prise de Masse",
        "description": "Intensifiez vos entraînements avec des exercices composés et des charges plus lourdes.",
        "level": "amateur",
        "program_type": "mass_gain",
        "duration": 60,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Développé couché", "sets": 4, "reps": "8-10", "rest": "120s"},
            {"name": "Squats", "sets": 4, "reps": "8-10", "rest": "120s"},
            {"name": "Soulevé de terre", "sets": 4, "reps": "6-8", "rest": "180s"},
            {"name": "Tractions", "sets": 4, "reps": "8-12", "rest": "90s"},
            {"name": "Dips", "sets": 3, "reps": "10-12", "rest": "90s"}
        ]
    },
    {
        "workout_id": f"workout_{uuid.uuid4().hex[:8]}",
        "title": "Programme Pro - Prise de Masse",
        "description": "Programme intensif pour athlètes avancés avec techniques de surcharge progressive.",
        "level": "pro",
        "program_type": "mass_gain",
        "duration": 90,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Développé couché", "sets": 5, "reps": "5-6", "rest": "180s"},
            {"name": "Squats lourds", "sets": 5, "reps": "5-6", "rest": "180s"},
            {"name": "Soulevé de terre", "sets": 5, "reps": "3-5", "rest": "240s"},
            {"name": "Développé militaire", "sets": 4, "reps": "6-8", "rest": "120s"},
            {"name": "Rowing barre", "sets": 4, "reps": "6-8", "rest": "120s"},
            {"name": "Tractions lestées", "sets": 4, "reps": "6-8", "rest": "120s"}
        ]
    },
    {
        "workout_id": f"workout_{uuid.uuid4().hex[:8]}",
        "title": "Programme Débutant - Perte de Poids",
        "description": "Cardio et circuit training pour brûler les calories efficacement.",
        "level": "beginner",
        "program_type": "weight_loss",
        "duration": 40,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Jumping jacks", "sets": 3, "reps": "30s", "rest": "30s"},
            {"name": "Burpees", "sets": 3, "reps": "10", "rest": "45s"},
            {"name": "Mountain climbers", "sets": 3, "reps": "30s", "rest": "30s"},
            {"name": "Squats sautés", "sets": 3, "reps": "15", "rest": "45s"},
            {"name": "Course sur place", "sets": 3, "reps": "60s", "rest": "45s"}
        ]
    },
    {
        "workout_id": f"workout_{uuid.uuid4().hex[:8]}",
        "title": "Programme Amateur - Perte de Poids",
        "description": "HIIT intense et exercices métaboliques pour maximiser la combustion des graisses.",
        "level": "amateur",
        "program_type": "weight_loss",
        "duration": 50,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Sprint vélo", "sets": 5, "reps": "45s", "rest": "15s"},
            {"name": "Burpees box jump", "sets": 4, "reps": "12", "rest": "30s"},
            {"name": "Kettlebell swings", "sets": 4, "reps": "20", "rest": "30s"},
            {"name": "Battle ropes", "sets": 4, "reps": "30s", "rest": "30s"},
            {"name": "Box jumps", "sets": 4, "reps": "15", "rest": "45s"}
        ]
    },
    {
        "workout_id": f"workout_{uuid.uuid4().hex[:8]}",
        "title": "Programme Pro - Perte de Poids",
        "description": "Entraînement métabolique extrême pour athlètes confirmés.",
        "level": "pro",
        "program_type": "weight_loss",
        "duration": 60,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Tabata vélo", "sets": 8, "reps": "20s", "rest": "10s"},
            {"name": "Complexe kettlebell", "sets": 5, "reps": "5", "rest": "60s"},
            {"name": "Sprint rameur", "sets": 6, "reps": "500m", "rest": "60s"},
            {"name": "Complexe haltères", "sets": 4, "reps": "6", "rest": "90s"},
            {"name": "Assault bike", "sets": 5, "reps": "60s", "rest": "30s"},
            {"name": "Burpees avancés", "sets": 5, "reps": "15", "rest": "30s"}
        ]
    }
]

workouts_en = [
    {
        "workout_id": w["workout_id"],
        "title": w["title"].replace("Programme", "Program").replace("Débutant", "Beginner").replace("Amateur", "Intermediate").replace("Prise de Masse", "Muscle Gain").replace("Perte de Poids", "Weight Loss"),
        "description": w["description"].replace("Un programme parfait pour commencer votre transformation physique avec des exercices de base.", "A perfect program to start your physical transformation with basic exercises.").replace("Intensifiez vos entraînements avec des exercices composés et des charges plus lourdes.", "Intensify your workouts with compound exercises and heavier loads.").replace("Programme intensif pour athlètes avancés avec techniques de surcharge progressive.", "Intensive program for advanced athletes with progressive overload techniques.").replace("Cardio et circuit training pour brûler les calories efficacement.", "Cardio and circuit training to burn calories effectively.").replace("HIIT intense et exercices métaboliques pour maximiser la combustion des graisses.", "Intense HIIT and metabolic exercises to maximize fat burning.").replace("Entraînement métabolique extrême pour athlètes confirmés.", "Extreme metabolic training for confirmed athletes."),
        "level": w["level"],
        "program_type": w["program_type"],
        "duration": w["duration"],
        "language": "en",
        "image_url": w["image_url"],
        "exercises": w["exercises"]
    }
    for w in workouts_fr
]

supplements_fr = [
    {
        "supplement_id": f"supp_{uuid.uuid4().hex[:8]}",
        "title": "Pack Prise de Masse",
        "description": "Compléments essentiels pour maximiser votre croissance musculaire.",
        "program_type": "mass_gain",
        "language": "fr",
        "nutrients": [
            {"name": "Whey Protéine", "dosage": "30g", "timing": "Post-workout"},
            {"name": "Créatine Monohydrate", "dosage": "5g", "timing": "Quotidien"},
            {"name": "BCAA", "dosage": "10g", "timing": "Pendant l'entraînement"},
            {"name": "Maltodextrine", "dosage": "50g", "timing": "Post-workout"},
            {"name": "Oméga-3", "dosage": "2g", "timing": "Avec repas"}
        ]
    },
    {
        "supplement_id": f"supp_{uuid.uuid4().hex[:8]}",
        "title": "Pack Perte de Poids",
        "description": "Suppléments optimisés pour accélérer la perte de graisse.",
        "program_type": "weight_loss",
        "language": "fr",
        "nutrients": [
            {"name": "Whey Isolate", "dosage": "25g", "timing": "Matin ou post-workout"},
            {"name": "L-Carnitine", "dosage": "2g", "timing": "Avant cardio"},
            {"name": "CLA", "dosage": "3g", "timing": "Avec repas"},
            {"name": "Thé vert extrait", "dosage": "500mg", "timing": "Matin"},
            {"name": "Multivitamines", "dosage": "1 dose", "timing": "Matin"}
        ]
    }
]

supplements_en = [
    {
        "supplement_id": s["supplement_id"],
        "title": s["title"].replace("Pack", "Bundle").replace("Prise de Masse", "Muscle Gain").replace("Perte de Poids", "Weight Loss"),
        "description": s["description"].replace("Compléments essentiels pour maximiser votre croissance musculaire.", "Essential supplements to maximize your muscle growth.").replace("Suppléments optimisés pour accélérer la perte de graisse.", "Optimized supplements to accelerate fat loss."),
        "program_type": s["program_type"],
        "language": "en",
        "nutrients": s["nutrients"]
    }
    for s in supplements_fr
]

async def seed_database():
    print("Seeding database...")
    
    await db.workouts.delete_many({})
    await db.supplements.delete_many({})
    
    await db.workouts.insert_many(workouts_fr + workouts_en)
    print(f"Inserted {len(workouts_fr + workouts_en)} workouts")
    
    await db.supplements.insert_many(supplements_fr + supplements_en)
    print(f"Inserted {len(supplements_fr + supplements_en)} supplements")
    
    print("Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())