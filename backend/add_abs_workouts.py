"""
Script to add abdominal/core workout programs to FitMaxPro
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'fitmaxpro')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def create_abs_workouts():
    print("=== Création des séances d'abdominaux ===\n")
    
    abs_workouts = [
        # French - Beginner
        {
            "workout_id": f"workout_abs_{uuid.uuid4().hex[:8]}",
            "title": "Abdos Débutant - Ventre Plat",
            "description": "Programme doux pour renforcer la ceinture abdominale. Idéal pour commencer à sculpter votre ventre.",
            "level": "beginner",
            "program_type": "abs",
            "duration": 15,
            "language": "fr",
            "image_url": "https://images.pexels.com/photos/4162490/pexels-photo-4162490.jpeg?auto=compress&cs=tinysrgb&w=800",
            "exercises": [
                {
                    "name": "Crunchs classiques",
                    "description": "Allongé sur le dos, genoux pliés, contractez les abdos pour soulever les épaules.",
                    "sets": 3,
                    "reps": "12",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/Xyd_fa5zoEU"
                },
                {
                    "name": "Planche sur les genoux",
                    "description": "Position de planche avec les genoux au sol. Maintenez le dos droit.",
                    "sets": 3,
                    "reps": "20 sec",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/ASdvN_XEl_c"
                },
                {
                    "name": "Relevé de jambes allongé",
                    "description": "Allongé sur le dos, levez les jambes tendues vers le plafond puis redescendez lentement.",
                    "sets": 3,
                    "reps": "10",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/JB2oyawG9KI"
                },
                {
                    "name": "Vélo (Bicycle crunch)",
                    "description": "Mouvement de pédalage en touchant le coude opposé au genou.",
                    "sets": 3,
                    "reps": "20",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/9FGilxCbdz8"
                },
                {
                    "name": "Mountain climbers lents",
                    "description": "En position de pompe, ramenez alternativement les genoux vers la poitrine.",
                    "sets": 3,
                    "reps": "16",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/nmwgirgXLYM"
                }
            ]
        },
        # French - Intermediate
        {
            "workout_id": f"workout_abs_{uuid.uuid4().hex[:8]}",
            "title": "Abdos Intermédiaire - Core Solide",
            "description": "Programme intermédiaire pour développer une sangle abdominale puissante et bien dessinée.",
            "level": "intermediate",
            "program_type": "abs",
            "duration": 20,
            "language": "fr",
            "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=800",
            "exercises": [
                {
                    "name": "Planche classique",
                    "description": "Position de planche sur les avant-bras. Corps aligné, abdos contractés.",
                    "sets": 4,
                    "reps": "45 sec",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/ASdvN_XEl_c"
                },
                {
                    "name": "Crunchs inversés",
                    "description": "Allongé sur le dos, ramenez les genoux vers la poitrine en soulevant les hanches.",
                    "sets": 4,
                    "reps": "15",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/hyv14e2QDq0"
                },
                {
                    "name": "Planche latérale",
                    "description": "Sur le côté, corps aligné, maintenez la position. Changez de côté.",
                    "sets": 3,
                    "reps": "30 sec/côté",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/K2VljzCC16g"
                },
                {
                    "name": "Russian twist",
                    "description": "Assis, penché en arrière, tournez le buste de gauche à droite.",
                    "sets": 4,
                    "reps": "20",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162435/pexels-photo-4162435.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/wkD8rjkodUI"
                },
                {
                    "name": "Toe touches",
                    "description": "Allongé, jambes en l'air, touchez vos orteils en contractant les abdos.",
                    "sets": 3,
                    "reps": "15",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/9cTs4busHKk"
                },
                {
                    "name": "Dead bug",
                    "description": "Allongé, bras et jambes en l'air, abaissez bras et jambe opposés.",
                    "sets": 3,
                    "reps": "12/côté",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/4XLEnwUr1d8"
                }
            ]
        },
        # French - Advanced
        {
            "workout_id": f"workout_abs_{uuid.uuid4().hex[:8]}",
            "title": "Abdos Avancé - Six Pack",
            "description": "Programme intense pour sculpter des abdominaux en tablette de chocolat. Réservé aux pratiquants confirmés.",
            "level": "advanced",
            "program_type": "abs",
            "duration": 25,
            "language": "fr",
            "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=800",
            "exercises": [
                {
                    "name": "Planche avec rotation",
                    "description": "En planche, pivotez pour toucher le ciel avec un bras. Alternez.",
                    "sets": 4,
                    "reps": "10/côté",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/K2VljzCC16g"
                },
                {
                    "name": "V-ups",
                    "description": "Allongé, montez simultanément les jambes et le buste pour former un V.",
                    "sets": 4,
                    "reps": "15",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/7UVgs18Y1P4"
                },
                {
                    "name": "Dragon flag",
                    "description": "Allongé, corps rigide, descendez et remontez les jambes sans toucher le sol.",
                    "sets": 3,
                    "reps": "8",
                    "rest_seconds": 45,
                    "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/pvz7k5gO-DE"
                },
                {
                    "name": "Hanging leg raises",
                    "description": "Suspendu à une barre, montez les jambes jusqu'à l'horizontale.",
                    "sets": 4,
                    "reps": "12",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/Pr1ieGZ5atk"
                },
                {
                    "name": "Ab wheel rollout",
                    "description": "Avec une roue abdominale, roulez vers l'avant puis revenez.",
                    "sets": 4,
                    "reps": "10",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162490/pexels-photo-4162490.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/rqiTPdK1c_I"
                },
                {
                    "name": "Planche dynamique",
                    "description": "Alternez entre planche sur les mains et sur les coudes.",
                    "sets": 3,
                    "reps": "12",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/xDjjkP5-p5c"
                },
                {
                    "name": "Hollow body hold",
                    "description": "Position creuse avec bras et jambes tendus, dos collé au sol.",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/LlDNef_Ztsc"
                }
            ]
        },
        # English versions
        {
            "workout_id": f"workout_abs_{uuid.uuid4().hex[:8]}",
            "title": "Abs Beginner - Flat Stomach",
            "description": "Gentle program to strengthen your core. Perfect for beginners looking to sculpt their abs.",
            "level": "beginner",
            "program_type": "abs",
            "duration": 15,
            "language": "en",
            "image_url": "https://images.pexels.com/photos/4162490/pexels-photo-4162490.jpeg?auto=compress&cs=tinysrgb&w=800",
            "exercises": [
                {
                    "name": "Basic Crunches",
                    "description": "Lying on your back, knees bent, contract your abs to lift your shoulders.",
                    "sets": 3,
                    "reps": "12",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/Xyd_fa5zoEU"
                },
                {
                    "name": "Knee Plank",
                    "description": "Plank position with knees on the ground. Keep your back straight.",
                    "sets": 3,
                    "reps": "20 sec",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/ASdvN_XEl_c"
                },
                {
                    "name": "Lying Leg Raises",
                    "description": "Lying on your back, raise your straight legs to the ceiling, then lower slowly.",
                    "sets": 3,
                    "reps": "10",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/JB2oyawG9KI"
                },
                {
                    "name": "Bicycle Crunch",
                    "description": "Pedaling motion while touching opposite elbow to knee.",
                    "sets": 3,
                    "reps": "20",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/9FGilxCbdz8"
                },
                {
                    "name": "Slow Mountain Climbers",
                    "description": "In push-up position, alternately bring knees to chest.",
                    "sets": 3,
                    "reps": "16",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/nmwgirgXLYM"
                }
            ]
        },
        {
            "workout_id": f"workout_abs_{uuid.uuid4().hex[:8]}",
            "title": "Abs Intermediate - Solid Core",
            "description": "Intermediate program to develop a powerful and well-defined core.",
            "level": "intermediate",
            "program_type": "abs",
            "duration": 20,
            "language": "en",
            "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=800",
            "exercises": [
                {
                    "name": "Classic Plank",
                    "description": "Forearm plank position. Body aligned, abs contracted.",
                    "sets": 4,
                    "reps": "45 sec",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/ASdvN_XEl_c"
                },
                {
                    "name": "Reverse Crunches",
                    "description": "Lying on your back, bring knees to chest while lifting your hips.",
                    "sets": 4,
                    "reps": "15",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/hyv14e2QDq0"
                },
                {
                    "name": "Side Plank",
                    "description": "On your side, body aligned, hold position. Switch sides.",
                    "sets": 3,
                    "reps": "30 sec/side",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/K2VljzCC16g"
                },
                {
                    "name": "Russian Twist",
                    "description": "Seated, leaning back, rotate your torso from left to right.",
                    "sets": 4,
                    "reps": "20",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162435/pexels-photo-4162435.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/wkD8rjkodUI"
                },
                {
                    "name": "Toe Touches",
                    "description": "Lying down, legs up, reach for your toes while contracting abs.",
                    "sets": 3,
                    "reps": "15",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/9cTs4busHKk"
                },
                {
                    "name": "Dead Bug",
                    "description": "Lying down, arms and legs up, lower opposite arm and leg.",
                    "sets": 3,
                    "reps": "12/side",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/4XLEnwUr1d8"
                }
            ]
        },
        {
            "workout_id": f"workout_abs_{uuid.uuid4().hex[:8]}",
            "title": "Abs Advanced - Six Pack",
            "description": "Intense program to sculpt defined six-pack abs. For advanced practitioners only.",
            "level": "advanced",
            "program_type": "abs",
            "duration": 25,
            "language": "en",
            "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=800",
            "exercises": [
                {
                    "name": "Plank with Rotation",
                    "description": "In plank, rotate to reach one arm to the sky. Alternate.",
                    "sets": 4,
                    "reps": "10/side",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/K2VljzCC16g"
                },
                {
                    "name": "V-ups",
                    "description": "Lying down, raise legs and torso simultaneously to form a V.",
                    "sets": 4,
                    "reps": "15",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/7UVgs18Y1P4"
                },
                {
                    "name": "Dragon Flag",
                    "description": "Lying down, rigid body, lower and raise legs without touching ground.",
                    "sets": 3,
                    "reps": "8",
                    "rest_seconds": 45,
                    "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/pvz7k5gO-DE"
                },
                {
                    "name": "Hanging Leg Raises",
                    "description": "Hanging from a bar, raise legs to horizontal.",
                    "sets": 4,
                    "reps": "12",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/Pr1ieGZ5atk"
                },
                {
                    "name": "Ab Wheel Rollout",
                    "description": "With an ab wheel, roll forward then return.",
                    "sets": 4,
                    "reps": "10",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162490/pexels-photo-4162490.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/rqiTPdK1c_I"
                },
                {
                    "name": "Dynamic Plank",
                    "description": "Alternate between hand plank and forearm plank.",
                    "sets": 3,
                    "reps": "12",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/xDjjkP5-p5c"
                },
                {
                    "name": "Hollow Body Hold",
                    "description": "Hollow position with arms and legs extended, back pressed to floor.",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                    "video_url": "https://www.youtube.com/embed/LlDNef_Ztsc"
                }
            ]
        }
    ]
    
    for workout in abs_workouts:
        existing = await db.workouts.find_one({"title": workout["title"], "language": workout["language"]})
        if not existing:
            await db.workouts.insert_one(workout)
            print(f"✓ Créé: {workout['title']} ({workout['language'].upper()})")
        else:
            print(f"• Existe déjà: {workout['title']}")
    
    print(f"\nTotal: {len(abs_workouts)} séances d'abdominaux")
    print("=== Terminé ===")

if __name__ == "__main__":
    asyncio.run(create_abs_workouts())
