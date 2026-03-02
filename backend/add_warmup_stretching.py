"""
Script pour créer les exercices d'échauffement et d'étirement par défaut
Ces routines sont applicables avant/après chaque séance
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

# ==================== ÉCHAUFFEMENTS (WARM-UP) ====================
warmup_exercises_fr = [
    {
        "name": "Rotation des épaules",
        "description": "Faire des cercles avec les épaules pour échauffer les articulations",
        "duration": "30 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg",
        "video_url": "https://www.youtube.com/embed/CtxCrJkLkCM"
    },
    {
        "name": "Rotation du cou",
        "description": "Faire des mouvements circulaires lents avec la tête",
        "duration": "30 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg",
        "video_url": "https://www.youtube.com/embed/QyKf9KRjMeA"
    },
    {
        "name": "Rotation des hanches",
        "description": "Cercles avec les hanches pour mobiliser le bassin",
        "duration": "30 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg",
        "video_url": "https://www.youtube.com/embed/SsT_go-yj-I"
    },
    {
        "name": "Genoux hauts sur place",
        "description": "Courir sur place en montant les genoux haut",
        "duration": "45 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg",
        "video_url": "https://www.youtube.com/embed/ZZZoCNMU48U"
    },
    {
        "name": "Jumping Jacks",
        "description": "Sauts en étoile pour élever la fréquence cardiaque",
        "duration": "45 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg",
        "video_url": "https://www.youtube.com/embed/c4DAnQ6DtF8"
    },
    {
        "name": "Fentes dynamiques",
        "description": "Alterner les fentes avant pour échauffer les jambes",
        "duration": "45 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg",
        "video_url": "https://www.youtube.com/embed/L8fvypPrzzs"
    },
    {
        "name": "Rotation des poignets",
        "description": "Faire des cercles avec les poignets",
        "duration": "20 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162585/pexels-photo-4162585.jpeg",
        "video_url": "https://www.youtube.com/embed/nvKRPy3nOD0"
    },
    {
        "name": "Talons-fesses",
        "description": "Courir sur place en ramenant les talons aux fesses",
        "duration": "45 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg",
        "video_url": "https://www.youtube.com/embed/H8hLwEQNjrE"
    }
]

warmup_exercises_en = [
    {
        "name": "Shoulder Rotations",
        "description": "Make circles with your shoulders to warm up the joints",
        "duration": "30 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg",
        "video_url": "https://www.youtube.com/embed/CtxCrJkLkCM"
    },
    {
        "name": "Neck Rotations",
        "description": "Make slow circular movements with your head",
        "duration": "30 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg",
        "video_url": "https://www.youtube.com/embed/QyKf9KRjMeA"
    },
    {
        "name": "Hip Rotations",
        "description": "Circle your hips to mobilize the pelvis",
        "duration": "30 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg",
        "video_url": "https://www.youtube.com/embed/SsT_go-yj-I"
    },
    {
        "name": "High Knees",
        "description": "Run in place bringing knees up high",
        "duration": "45 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg",
        "video_url": "https://www.youtube.com/embed/ZZZoCNMU48U"
    },
    {
        "name": "Jumping Jacks",
        "description": "Star jumps to elevate heart rate",
        "duration": "45 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg",
        "video_url": "https://www.youtube.com/embed/c4DAnQ6DtF8"
    },
    {
        "name": "Dynamic Lunges",
        "description": "Alternate forward lunges to warm up legs",
        "duration": "45 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg",
        "video_url": "https://www.youtube.com/embed/L8fvypPrzzs"
    },
    {
        "name": "Wrist Rotations",
        "description": "Make circles with your wrists",
        "duration": "20 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162585/pexels-photo-4162585.jpeg",
        "video_url": "https://www.youtube.com/embed/nvKRPy3nOD0"
    },
    {
        "name": "Butt Kicks",
        "description": "Run in place kicking heels to buttocks",
        "duration": "45 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg",
        "video_url": "https://www.youtube.com/embed/H8hLwEQNjrE"
    }
]

# ==================== ÉTIREMENTS (STRETCHING) ====================
stretching_exercises_fr = [
    {
        "name": "Étirement des quadriceps",
        "description": "Debout, attraper le pied et tirer vers les fesses",
        "duration": "30 secondes par jambe",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg",
        "video_url": "https://www.youtube.com/embed/YvGQvUeYhvI"
    },
    {
        "name": "Étirement des ischio-jambiers",
        "description": "Jambe tendue, penchez-vous vers l'avant",
        "duration": "30 secondes par jambe",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg",
        "video_url": "https://www.youtube.com/embed/FDwpEdxZ4H4"
    },
    {
        "name": "Étirement des mollets",
        "description": "Contre un mur, une jambe en arrière talon au sol",
        "duration": "30 secondes par jambe",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498155/pexels-photo-4498155.jpeg",
        "video_url": "https://www.youtube.com/embed/m6Ek1_W0wh8"
    },
    {
        "name": "Étirement des pectoraux",
        "description": "Bras contre un mur, pivoter le corps",
        "duration": "30 secondes par côté",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg",
        "video_url": "https://www.youtube.com/embed/UtV2kps-0qk"
    },
    {
        "name": "Étirement du dos (Chat-Vache)",
        "description": "À quatre pattes, alterner dos rond et dos creux",
        "duration": "45 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg",
        "video_url": "https://www.youtube.com/embed/kqnua4rHVVA"
    },
    {
        "name": "Étirement des triceps",
        "description": "Bras derrière la tête, coude vers le plafond",
        "duration": "30 secondes par bras",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg",
        "video_url": "https://www.youtube.com/embed/HqS2rWl1XZo"
    },
    {
        "name": "Étirement des épaules",
        "description": "Tirer le bras vers la poitrine horizontalement",
        "duration": "30 secondes par bras",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162452/pexels-photo-4162452.jpeg",
        "video_url": "https://www.youtube.com/embed/SXHJi3gPeYE"
    },
    {
        "name": "Étirement du cou",
        "description": "Incliner doucement la tête sur le côté",
        "duration": "20 secondes par côté",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg",
        "video_url": "https://www.youtube.com/embed/wQylqaCl8Zo"
    },
    {
        "name": "Posture de l'enfant",
        "description": "À genoux, s'asseoir sur les talons et tendre les bras devant",
        "duration": "45 secondes",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg",
        "video_url": "https://www.youtube.com/embed/eqVMAPM00DM"
    },
    {
        "name": "Respiration profonde",
        "description": "Inspirer profondément par le nez, expirer lentement",
        "duration": "1 minute",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg",
        "video_url": "https://www.youtube.com/embed/tybOi4hjZFQ"
    }
]

stretching_exercises_en = [
    {
        "name": "Quad Stretch",
        "description": "Standing, grab foot and pull towards buttocks",
        "duration": "30 seconds per leg",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg",
        "video_url": "https://www.youtube.com/embed/YvGQvUeYhvI"
    },
    {
        "name": "Hamstring Stretch",
        "description": "Leg extended, lean forward",
        "duration": "30 seconds per leg",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg",
        "video_url": "https://www.youtube.com/embed/FDwpEdxZ4H4"
    },
    {
        "name": "Calf Stretch",
        "description": "Against a wall, one leg back heel on ground",
        "duration": "30 seconds per leg",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4498155/pexels-photo-4498155.jpeg",
        "video_url": "https://www.youtube.com/embed/m6Ek1_W0wh8"
    },
    {
        "name": "Chest Stretch",
        "description": "Arm against wall, rotate body away",
        "duration": "30 seconds per side",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg",
        "video_url": "https://www.youtube.com/embed/UtV2kps-0qk"
    },
    {
        "name": "Cat-Cow Stretch",
        "description": "On all fours, alternate between arched and rounded back",
        "duration": "45 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg",
        "video_url": "https://www.youtube.com/embed/kqnua4rHVVA"
    },
    {
        "name": "Tricep Stretch",
        "description": "Arm behind head, elbow pointing up",
        "duration": "30 seconds per arm",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162492/pexels-photo-4162492.jpeg",
        "video_url": "https://www.youtube.com/embed/HqS2rWl1XZo"
    },
    {
        "name": "Shoulder Stretch",
        "description": "Pull arm across chest horizontally",
        "duration": "30 seconds per arm",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162452/pexels-photo-4162452.jpeg",
        "video_url": "https://www.youtube.com/embed/SXHJi3gPeYE"
    },
    {
        "name": "Neck Stretch",
        "description": "Gently tilt head to the side",
        "duration": "20 seconds per side",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg",
        "video_url": "https://www.youtube.com/embed/wQylqaCl8Zo"
    },
    {
        "name": "Child's Pose",
        "description": "Kneeling, sit on heels and extend arms forward",
        "duration": "45 seconds",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg",
        "video_url": "https://www.youtube.com/embed/eqVMAPM00DM"
    },
    {
        "name": "Deep Breathing",
        "description": "Breathe deeply through nose, exhale slowly",
        "duration": "1 minute",
        "sets": 1,
        "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg",
        "video_url": "https://www.youtube.com/embed/tybOi4hjZFQ"
    }
]

async def create_warmup_stretching():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=== Création des routines d'échauffement et d'étirement ===\n")
    
    # Create warmup routine (FR)
    warmup_fr = {
        "routine_id": "warmup_fr",
        "type": "warmup",
        "language": "fr",
        "title": "Échauffement",
        "description": "Routine d'échauffement avant la séance",
        "duration": "5-7 minutes",
        "exercises": warmup_exercises_fr
    }
    
    # Create warmup routine (EN)
    warmup_en = {
        "routine_id": "warmup_en",
        "type": "warmup",
        "language": "en",
        "title": "Warm-Up",
        "description": "Warm-up routine before workout",
        "duration": "5-7 minutes",
        "exercises": warmup_exercises_en
    }
    
    # Create stretching routine (FR)
    stretching_fr = {
        "routine_id": "stretching_fr",
        "type": "stretching",
        "language": "fr",
        "title": "Étirements",
        "description": "Routine d'étirements après la séance",
        "duration": "5-10 minutes",
        "exercises": stretching_exercises_fr
    }
    
    # Create stretching routine (EN)
    stretching_en = {
        "routine_id": "stretching_en",
        "type": "stretching",
        "language": "en",
        "title": "Stretching",
        "description": "Stretching routine after workout",
        "duration": "5-10 minutes",
        "exercises": stretching_exercises_en
    }
    
    # Insert/Update routines
    for routine in [warmup_fr, warmup_en, stretching_fr, stretching_en]:
        await db.routines.update_one(
            {"routine_id": routine["routine_id"]},
            {"$set": routine},
            upsert=True
        )
        print(f"✓ {routine['title']} ({routine['language']}): {len(routine['exercises'])} exercices")
    
    print(f"\n=== Terminé! ===")
    print(f"Total exercices échauffement: {len(warmup_exercises_fr)} (FR) + {len(warmup_exercises_en)} (EN)")
    print(f"Total exercices étirement: {len(stretching_exercises_fr)} (FR) + {len(stretching_exercises_en)} (EN)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_warmup_stretching())
