"""
Script to add comprehensive abdominal workout programs with working YouTube videos
Uses UPSERT strategy with stable IDs to prevent data loss
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Séances Abdominaux complètes avec vidéos YouTube fonctionnelles
abs_workouts_complete = [
    # ============== FRANÇAIS - DÉBUTANT ==============
    {
        "workout_id": "workout_abs_beginner_fr_01",
        "title": "Abdos Débutant - Ventre Plat",
        "description": "Programme doux pour renforcer la ceinture abdominale. Idéal pour commencer à sculpter votre ventre.",
        "level": "beginner",
        "program_type": "abs",
        "duration": 15,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Crunchs classiques",
                "description": "Allongé sur le dos, genoux pliés, contractez les abdos pour soulever les épaules.",
                "sets": 3,
                "reps": "12",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=400",
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
    {
        "workout_id": "workout_abs_beginner_fr_02",
        "title": "Abdos Débutant - Core Fondation",
        "description": "Séance de base pour construire une sangle abdominale solide. Exercices simples et efficaces.",
        "level": "beginner",
        "program_type": "abs",
        "duration": 12,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162493/pexels-photo-4162493.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Dead Bug",
                "description": "Allongé, bras et jambes en l'air, abaissez bras et jambe opposés alternativement.",
                "sets": 3,
                "reps": "10/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/4XLEnwUr1d8"
            },
            {
                "name": "Gainage ventral statique",
                "description": "Position de planche sur les avant-bras, corps aligné.",
                "sets": 3,
                "reps": "20 sec",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/pSHjTRCQxIw"
            },
            {
                "name": "Crunchs inversés",
                "description": "Allongé, ramenez les genoux vers la poitrine en soulevant les hanches.",
                "sets": 3,
                "reps": "12",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/hyv14e2QDq0"
            },
            {
                "name": "Bird Dog",
                "description": "À quatre pattes, étendez bras et jambe opposés simultanément.",
                "sets": 3,
                "reps": "8/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/wiFNA3sqjCA"
            }
        ]
    },
    {
        "workout_id": "workout_abs_beginner_fr_03",
        "title": "Abdos Débutant - Taille Fine",
        "description": "Focus sur les obliques pour affiner la taille. Exercices ciblés et accessibles.",
        "level": "beginner",
        "program_type": "abs",
        "duration": 15,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Crunchs obliques",
                "description": "Allongé, touchez le genou avec le coude opposé en tournant le buste.",
                "sets": 3,
                "reps": "12/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/CVaEhXotL7M"
            },
            {
                "name": "Rotation du buste assis",
                "description": "Assis, tournez le buste de gauche à droite en gardant les hanches fixes.",
                "sets": 3,
                "reps": "20",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162435/pexels-photo-4162435.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/wkD8rjkodUI"
            },
            {
                "name": "Gainage latéral sur genou",
                "description": "Sur le côté avec le genou au sol, maintenez le corps aligné.",
                "sets": 3,
                "reps": "15 sec/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/K2VljzCC16g"
            },
            {
                "name": "Toe Touches",
                "description": "Allongé, jambes en l'air, touchez vos orteils en contractant les abdos.",
                "sets": 3,
                "reps": "15",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/9cTs4busHKk"
            }
        ]
    },
    
    # ============== FRANÇAIS - INTERMÉDIAIRE ==============
    {
        "workout_id": "workout_abs_intermediate_fr_01",
        "title": "Abdos Intermédiaire - Core Solide",
        "description": "Programme intermédiaire pour développer une sangle abdominale puissante et bien dessinée.",
        "level": "intermediate",
        "program_type": "abs",
        "duration": 20,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Planche classique",
                "description": "Position de planche sur les avant-bras. Corps aligné, abdos contractés.",
                "sets": 4,
                "reps": "45 sec",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/pSHjTRCQxIw"
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
    {
        "workout_id": "workout_abs_intermediate_fr_02",
        "title": "Abdos Intermédiaire - Brûleur de Graisse",
        "description": "Circuit intense pour brûler les graisses abdominales et renforcer le core.",
        "level": "intermediate",
        "program_type": "abs",
        "duration": 25,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Mountain Climbers",
                "description": "En position de pompe, ramenez les genoux vers la poitrine rapidement.",
                "sets": 4,
                "reps": "30 sec",
                "rest_seconds": 20,
                "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/nmwgirgXLYM"
            },
            {
                "name": "Planche avec toucher d'épaule",
                "description": "En planche sur les mains, touchez l'épaule opposée alternativement.",
                "sets": 4,
                "reps": "20",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/LEZwN20svlE"
            },
            {
                "name": "Scissor Kicks",
                "description": "Allongé, jambes tendues légèrement décollées, croisez-les en ciseaux.",
                "sets": 4,
                "reps": "20",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/WoNCIBVLbgY"
            },
            {
                "name": "Crunchs avec rotation",
                "description": "Crunch classique avec rotation du buste vers le genou opposé.",
                "sets": 4,
                "reps": "12/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/CVaEhXotL7M"
            },
            {
                "name": "Flutter Kicks",
                "description": "Allongé, jambes tendues, battez des pieds comme pour nager.",
                "sets": 4,
                "reps": "30 sec",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/ANVdMDaYRts"
            },
            {
                "name": "Hollow Body Hold",
                "description": "Position creuse avec bras et jambes tendus, dos collé au sol.",
                "sets": 3,
                "reps": "20 sec",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/LlDNef_Ztsc"
            }
        ]
    },
    {
        "workout_id": "workout_abs_intermediate_fr_03",
        "title": "Abdos Intermédiaire - Sculpteur d'Obliques",
        "description": "Programme ciblé sur les obliques pour une taille fine et un V-shape.",
        "level": "intermediate",
        "program_type": "abs",
        "duration": 22,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162435/pexels-photo-4162435.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Russian Twist avec poids",
                "description": "Assis, penché en arrière, tournez avec un poids de chaque côté.",
                "sets": 4,
                "reps": "24",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162435/pexels-photo-4162435.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/wkD8rjkodUI"
            },
            {
                "name": "Planche latérale avec hip dip",
                "description": "En planche latérale, descendez la hanche vers le sol et remontez.",
                "sets": 3,
                "reps": "12/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/K2VljzCC16g"
            },
            {
                "name": "Bicycle Crunch",
                "description": "Mouvement de pédalage en touchant coude et genou opposés.",
                "sets": 4,
                "reps": "30",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/9FGilxCbdz8"
            },
            {
                "name": "Side Crunch debout",
                "description": "Debout, ramenez le genou vers le coude du même côté.",
                "sets": 3,
                "reps": "15/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/Ak3Sf1NhVYk"
            },
            {
                "name": "Woodchop au sol",
                "description": "Allongé, bras tendus, faites un mouvement de bûcheron.",
                "sets": 3,
                "reps": "12/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162435/pexels-photo-4162435.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/pAplQXk3dkU"
            }
        ]
    },

    # ============== FRANÇAIS - AVANCÉ ==============
    {
        "workout_id": "workout_abs_advanced_fr_01",
        "title": "Abdos Avancé - Six Pack",
        "description": "Programme intense pour sculpter des abdominaux en tablette de chocolat. Réservé aux pratiquants confirmés.",
        "level": "advanced",
        "program_type": "abs",
        "duration": 30,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162490/pexels-photo-4162490.jpeg?auto=compress&cs=tinysrgb&w=800",
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
    {
        "workout_id": "workout_abs_advanced_fr_02",
        "title": "Abdos Avancé - Destructeur de Core",
        "description": "Programme extrême pour les athlètes confirmés. Préparez-vous à souffrir !",
        "level": "advanced",
        "program_type": "abs",
        "duration": 35,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "L-Sit Hold",
                "description": "En appui sur les mains, maintenez les jambes parallèles au sol.",
                "sets": 4,
                "reps": "15 sec",
                "rest_seconds": 45,
                "image_url": "https://images.pexels.com/photos/4162490/pexels-photo-4162490.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/IUZJoSP66HI"
            },
            {
                "name": "Toes to Bar",
                "description": "Suspendu, montez les pieds jusqu'à toucher la barre.",
                "sets": 4,
                "reps": "10",
                "rest_seconds": 45,
                "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/NKSsgU-YwHQ"
            },
            {
                "name": "Pike Push-up to Plank",
                "description": "Passez de pike push-up à planche en un mouvement fluide.",
                "sets": 4,
                "reps": "12",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/sposDXWEB0A"
            },
            {
                "name": "Hanging Windshield Wipers",
                "description": "Suspendu, faites des essuie-glaces avec les jambes tendues.",
                "sets": 3,
                "reps": "8/côté",
                "rest_seconds": 45,
                "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/9ccRhbhj2fk"
            },
            {
                "name": "Dragon Flag complet",
                "description": "Version complète du dragon flag avec contrôle total.",
                "sets": 3,
                "reps": "6",
                "rest_seconds": 60,
                "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/pvz7k5gO-DE"
            },
            {
                "name": "Planche Superman",
                "description": "En planche, levez un bras et la jambe opposée simultanément.",
                "sets": 3,
                "reps": "10/côté",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/z6PJMT2y8GQ"
            }
        ]
    },
    {
        "workout_id": "workout_abs_advanced_fr_03",
        "title": "Abdos Avancé - HIIT Abs",
        "description": "Circuit HIIT focalisé sur les abdos pour brûler un max de calories.",
        "level": "advanced",
        "program_type": "abs",
        "duration": 25,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Burpees",
                "description": "Enchaînement squat-planche-pompe-saut avec intensité maximale.",
                "sets": 4,
                "reps": "10",
                "rest_seconds": 20,
                "image_url": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/TU8QYVW0gDU"
            },
            {
                "name": "Mountain Climbers explosifs",
                "description": "Version rapide et explosive des mountain climbers.",
                "sets": 4,
                "reps": "30 sec",
                "rest_seconds": 15,
                "image_url": "https://images.pexels.com/photos/4162500/pexels-photo-4162500.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/nmwgirgXLYM"
            },
            {
                "name": "High Knees",
                "description": "Course sur place avec genoux hauts, vitesse maximale.",
                "sets": 4,
                "reps": "30 sec",
                "rest_seconds": 15,
                "image_url": "https://images.pexels.com/photos/4498574/pexels-photo-4498574.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/ZZZoCNMU48U"
            },
            {
                "name": "Planche sautée",
                "description": "Sautez d'une position large à serrée en planche.",
                "sets": 4,
                "reps": "20",
                "rest_seconds": 20,
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/8jyhJ6TiUPA"
            },
            {
                "name": "V-ups explosifs",
                "description": "V-ups avec un rythme rapide et explosif.",
                "sets": 4,
                "reps": "12",
                "rest_seconds": 20,
                "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/7UVgs18Y1P4"
            }
        ]
    }
]

# Versions anglaises
abs_workouts_en = []
for workout in abs_workouts_complete:
    if workout['language'] == 'fr':
        en_workout = workout.copy()
        en_workout['workout_id'] = workout['workout_id'].replace('_fr_', '_en_')
        en_workout['language'] = 'en'
        # Translate titles
        en_workout['title'] = (
            workout['title']
            .replace('Abdos Débutant', 'Abs Beginner')
            .replace('Abdos Intermédiaire', 'Abs Intermediate')
            .replace('Abdos Avancé', 'Abs Advanced')
            .replace('Ventre Plat', 'Flat Stomach')
            .replace('Core Fondation', 'Core Foundation')
            .replace('Taille Fine', 'Slim Waist')
            .replace('Core Solide', 'Solid Core')
            .replace('Brûleur de Graisse', 'Fat Burner')
            .replace("Sculpteur d'Obliques", 'Oblique Sculptor')
            .replace('Six Pack', 'Six Pack')
            .replace('Destructeur de Core', 'Core Destroyer')
            .replace('HIIT Abs', 'HIIT Abs')
        )
        abs_workouts_en.append(en_workout)

async def seed_abs_workouts():
    print("=" * 60)
    print("SEEDING COMPREHENSIVE ABS WORKOUTS (UPSERT STRATEGY)")
    print("=" * 60)
    
    # Count before
    before_count = await db.workouts.count_documents({})
    before_abs = await db.workouts.count_documents({"program_type": "abs"})
    print(f"\nTotal workouts before: {before_count}")
    print(f"Abs workouts before: {before_abs}")
    
    inserted = 0
    updated = 0
    
    all_workouts = abs_workouts_complete + abs_workouts_en
    
    for workout in all_workouts:
        result = await db.workouts.update_one(
            {"workout_id": workout["workout_id"]},
            {"$set": workout},
            upsert=True
        )
        if result.upserted_id:
            inserted += 1
            print(f"  + Inserted: {workout['title']} ({workout['language'].upper()})")
        elif result.modified_count > 0:
            updated += 1
            print(f"  ~ Updated: {workout['title']} ({workout['language'].upper()})")
        else:
            print(f"  = Unchanged: {workout['title']} ({workout['language'].upper()})")
    
    # Count after
    after_count = await db.workouts.count_documents({})
    after_abs = await db.workouts.count_documents({"program_type": "abs"})
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total processed: {len(all_workouts)}")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Total workouts before: {before_count} -> after: {after_count}")
    print(f"  Abs workouts before: {before_abs} -> after: {after_abs}")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_abs_workouts())
