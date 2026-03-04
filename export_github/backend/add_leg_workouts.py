"""
Script pour ajouter des séances Jambes/Fessiers pour femmes et hommes
Avec vidéos YouTube explicatives - Uses UPSERT strategy with stable IDs
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Séances Jambes/Fessiers en Français
WORKOUTS_FR = [
    {
        "workout_id": "workout_legs_beginner_fr_01",
        "title": "Jambes & Fessiers - Débutant",
        "description": "Programme complet pour développer les jambes et les fessiers. Idéal pour les débutants femmes et hommes qui veulent sculpter le bas du corps.",
        "level": "beginner",
        "program_type": "legs_glutes",
        "duration": 35,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Squats au poids du corps",
                "description": "Le squat est l'exercice roi pour les jambes et fessiers. Gardez le dos droit, descendez comme si vous vous asseyez sur une chaise.",
                "sets": 3,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/aclHkVaku9U"
            },
            {
                "name": "Fentes avant",
                "description": "Excellent pour cibler les quadriceps et les fessiers. Faites un grand pas en avant et descendez jusqu'à ce que le genou arrière frôle le sol.",
                "sets": 3,
                "reps": "12 par jambe",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162488/pexels-photo-4162488.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/QOVaHwm-Q6U"
            },
            {
                "name": "Pont fessier (Hip Thrust au sol)",
                "description": "Ciblez directement les fessiers. Allongé sur le dos, poussez les hanches vers le haut en contractant les fessiers.",
                "sets": 3,
                "reps": "20",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Donkey Kicks (Coups de pied d'âne)",
                "description": "À quatre pattes, levez une jambe vers le plafond en gardant le genou plié. Excellent pour isoler les fessiers.",
                "sets": 3,
                "reps": "15 par jambe",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2DrExAwI4fw"
            },
            {
                "name": "Squat sumo",
                "description": "Pieds écartés, pointes vers l'extérieur. Cible l'intérieur des cuisses et les fessiers.",
                "sets": 3,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162589/pexels-photo-4162589.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/9ZuXKqRbT9k"
            },
            {
                "name": "Élévations latérales de jambe",
                "description": "Allongé sur le côté, levez la jambe vers le haut. Travaille les abducteurs et le galbe des hanches.",
                "sets": 3,
                "reps": "20 par côté",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/v9x800x5jbY"
            }
        ]
    },
    {
        "workout_id": "workout_legs_intermediate_fr_01",
        "title": "Jambes & Fessiers - Intermédiaire",
        "description": "Programme avancé pour développer la force et le volume des jambes et fessiers. Avec poids additionnels recommandés.",
        "level": "intermediate",
        "program_type": "legs_glutes",
        "duration": 45,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Squat goblet avec haltère",
                "description": "Tenez un haltère contre votre poitrine et effectuez un squat profond. Excellent pour la mobilité et le renforcement.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/MeIiIdhvXT4"
            },
            {
                "name": "Hip Thrust avec barre",
                "description": "L'exercice ultime pour les fessiers. Dos sur un banc, barre sur les hanches, poussez vers le haut.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Fentes bulgares",
                "description": "Pied arrière sur un banc, descendez en fente. Exercice intense pour les quadriceps et fessiers.",
                "sets": 3,
                "reps": "10 par jambe",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162452/pexels-photo-4162452.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2C-uNgKwPLE"
            },
            {
                "name": "Soulevé de terre roumain",
                "description": "Excellent pour les ischio-jambiers et les fessiers. Gardez les jambes légèrement fléchies et le dos droit.",
                "sets": 4,
                "reps": "10",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/JCXUYuzwNrM"
            },
            {
                "name": "Step-ups sur banc",
                "description": "Montez sur un banc en poussant avec une jambe. Travaille les fessiers et l'équilibre.",
                "sets": 3,
                "reps": "12 par jambe",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162462/pexels-photo-4162462.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/dQqApCGd5Ss"
            },
            {
                "name": "Kickbacks à la poulie",
                "description": "À la machine, poussez la jambe vers l'arrière. Isolation parfaite des fessiers.",
                "sets": 3,
                "reps": "15 par jambe",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162463/pexels-photo-4162463.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/pNgHqZdNJqY"
            }
        ]
    },
    {
        "workout_id": "workout_legs_advanced_fr_01",
        "title": "Jambes & Fessiers - Expert",
        "description": "Programme haute intensité pour des résultats maximaux. Pour les pratiquants expérimentés visant l'hypertrophie.",
        "level": "advanced",
        "program_type": "legs_glutes",
        "duration": 60,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4162448/pexels-photo-4162448.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Squat barre (Back Squat)",
                "description": "Le roi des exercices pour les jambes. Barre sur les trapèzes, descendez jusqu'à la parallèle minimum.",
                "sets": 5,
                "reps": "8",
                "rest": "120s",
                "image_url": "https://images.pexels.com/photos/4162450/pexels-photo-4162450.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/bEv6CCg2BC8"
            },
            {
                "name": "Presse à cuisses",
                "description": "Machine sécurisée pour pousser des charges lourdes. Gardez le bas du dos collé au siège.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162464/pexels-photo-4162464.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/IZxyjW7MPJQ"
            },
            {
                "name": "Hip Thrust lourd",
                "description": "Version lourde du hip thrust pour maximiser le développement des fessiers.",
                "sets": 4,
                "reps": "10",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Leg curl (ischio-jambiers)",
                "description": "Isolation des ischio-jambiers à la machine. Contrôlez le mouvement.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162465/pexels-photo-4162465.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/ELOCsoDSmrg"
            },
            {
                "name": "Extension des jambes (Leg Extension)",
                "description": "Isolation des quadriceps. Contractez au maximum en haut du mouvement.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162466/pexels-photo-4162466.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/YyvSfVjQeL0"
            },
            {
                "name": "Fentes marchées avec haltères",
                "description": "Avancez en fentes avec des haltères. Excellent finisher pour les jambes.",
                "sets": 3,
                "reps": "20 pas",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162467/pexels-photo-4162467.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/D7KaRcUTQeE"
            },
            {
                "name": "Mollets debout",
                "description": "À la machine ou avec haltères, montez sur la pointe des pieds. N'oubliez pas les mollets!",
                "sets": 4,
                "reps": "20",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162468/pexels-photo-4162468.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/-M4-G8p8fmc"
            }
        ]
    },
    {
        "workout_id": "workout_legs_women_fr_01",
        "title": "Fessiers Bombés - Spécial Femmes",
        "description": "Programme spécialement conçu pour sculpter et galber les fessiers. Exercices ciblés pour un résultat optimal.",
        "level": "intermediate",
        "program_type": "legs_glutes",
        "duration": 40,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6455927/pexels-photo-6455927.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Hip Thrust au banc",
                "description": "L'exercice numéro 1 pour les fessiers. Poussez les hanches vers le haut et serrez les fessiers en haut.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6455770/pexels-photo-6455770.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Squat sumo profond",
                "description": "Pieds très écartés, pointes vers l'extérieur. Descendez le plus bas possible.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6455771/pexels-photo-6455771.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/9ZuXKqRbT9k"
            },
            {
                "name": "Fire Hydrants",
                "description": "À quatre pattes, levez la jambe sur le côté. Excellent pour le galbe des hanches.",
                "sets": 3,
                "reps": "20 par côté",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455772/pexels-photo-6455772.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/La3xzk4W-E4"
            },
            {
                "name": "Kickbacks à genoux",
                "description": "À quatre pattes, poussez le talon vers le plafond. Contractez bien le fessier.",
                "sets": 3,
                "reps": "15 par jambe",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455773/pexels-photo-6455773.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2DrExAwI4fw"
            },
            {
                "name": "Clamshells (Coquillages)",
                "description": "Allongé sur le côté, genoux pliés, ouvrez les genoux comme un coquillage. Avec élastique pour plus d'intensité.",
                "sets": 3,
                "reps": "20 par côté",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455774/pexels-photo-6455774.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/cjk2T9qbLzY"
            },
            {
                "name": "Frog Pumps (Pompes grenouille)",
                "description": "Allongé, pieds joints, genoux écartés. Poussez les hanches vers le haut.",
                "sets": 3,
                "reps": "25",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455775/pexels-photo-6455775.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/T_6RTc1Ak4s"
            }
        ]
    }
]

# Séances Jambes/Fessiers en Anglais
WORKOUTS_EN = [
    {
        "workout_id": "workout_legs_beginner_en_01",
        "title": "Legs & Glutes - Beginner",
        "description": "Complete program to develop legs and glutes. Perfect for beginners who want to sculpt their lower body.",
        "level": "beginner",
        "program_type": "legs_glutes",
        "duration": 35,
        "language": "en",
        "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Bodyweight Squats",
                "description": "The king of leg exercises. Keep your back straight, go down as if sitting on a chair.",
                "sets": 3,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/aclHkVaku9U"
            },
            {
                "name": "Forward Lunges",
                "description": "Great for targeting quads and glutes. Take a big step forward and lower until back knee nearly touches the floor.",
                "sets": 3,
                "reps": "12 per leg",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162488/pexels-photo-4162488.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/QOVaHwm-Q6U"
            },
            {
                "name": "Glute Bridge",
                "description": "Directly target the glutes. Lying on your back, push hips up while squeezing glutes.",
                "sets": 3,
                "reps": "20",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Donkey Kicks",
                "description": "On all fours, lift one leg toward the ceiling while keeping knee bent. Great for isolating glutes.",
                "sets": 3,
                "reps": "15 per leg",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162579/pexels-photo-4162579.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2DrExAwI4fw"
            },
            {
                "name": "Sumo Squat",
                "description": "Wide stance, toes pointing out. Targets inner thighs and glutes.",
                "sets": 3,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162589/pexels-photo-4162589.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/9ZuXKqRbT9k"
            },
            {
                "name": "Side Leg Raises",
                "description": "Lying on your side, raise your leg upward. Works abductors and hip shape.",
                "sets": 3,
                "reps": "20 per side",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/v9x800x5jbY"
            }
        ]
    },
    {
        "workout_id": "workout_legs_intermediate_en_01",
        "title": "Legs & Glutes - Intermediate",
        "description": "Advanced program for building leg and glute strength and volume. Additional weights recommended.",
        "level": "intermediate",
        "program_type": "legs_glutes",
        "duration": 45,
        "language": "en",
        "image_url": "https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Goblet Squat",
                "description": "Hold a dumbbell against your chest and perform a deep squat. Great for mobility and strength.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/MeIiIdhvXT4"
            },
            {
                "name": "Barbell Hip Thrust",
                "description": "The ultimate glute exercise. Back on bench, bar on hips, push upward.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Bulgarian Split Squats",
                "description": "Rear foot on bench, lower into a lunge. Intense exercise for quads and glutes.",
                "sets": 3,
                "reps": "10 per leg",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162452/pexels-photo-4162452.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2C-uNgKwPLE"
            },
            {
                "name": "Romanian Deadlift",
                "description": "Excellent for hamstrings and glutes. Keep legs slightly bent and back straight.",
                "sets": 4,
                "reps": "10",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/JCXUYuzwNrM"
            },
            {
                "name": "Step-ups",
                "description": "Step up onto a bench pushing with one leg. Works glutes and balance.",
                "sets": 3,
                "reps": "12 per leg",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162462/pexels-photo-4162462.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/dQqApCGd5Ss"
            },
            {
                "name": "Cable Kickbacks",
                "description": "At the machine, push leg backward. Perfect glute isolation.",
                "sets": 3,
                "reps": "15 per leg",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162463/pexels-photo-4162463.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/pNgHqZdNJqY"
            }
        ]
    },
    {
        "workout_id": "workout_legs_advanced_en_01",
        "title": "Legs & Glutes - Expert",
        "description": "High intensity program for maximum results. For experienced practitioners aiming for hypertrophy.",
        "level": "advanced",
        "program_type": "legs_glutes",
        "duration": 60,
        "language": "en",
        "image_url": "https://images.pexels.com/photos/4162448/pexels-photo-4162448.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Back Squat",
                "description": "The king of leg exercises. Bar on traps, go down to at least parallel.",
                "sets": 5,
                "reps": "8",
                "rest": "120s",
                "image_url": "https://images.pexels.com/photos/4162450/pexels-photo-4162450.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/bEv6CCg2BC8"
            },
            {
                "name": "Leg Press",
                "description": "Safe machine for pushing heavy loads. Keep lower back against the seat.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162464/pexels-photo-4162464.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/IZxyjW7MPJQ"
            },
            {
                "name": "Heavy Hip Thrust",
                "description": "Heavy version of hip thrust to maximize glute development.",
                "sets": 4,
                "reps": "10",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Leg Curl",
                "description": "Hamstring isolation on machine. Control the movement.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162465/pexels-photo-4162465.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/ELOCsoDSmrg"
            },
            {
                "name": "Leg Extension",
                "description": "Quad isolation. Squeeze maximum at the top of the movement.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/4162466/pexels-photo-4162466.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/YyvSfVjQeL0"
            },
            {
                "name": "Walking Lunges with Dumbbells",
                "description": "Walk forward in lunges with dumbbells. Great leg finisher.",
                "sets": 3,
                "reps": "20 steps",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/4162467/pexels-photo-4162467.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/D7KaRcUTQeE"
            },
            {
                "name": "Standing Calf Raises",
                "description": "On machine or with dumbbells, rise on toes. Don't forget calves!",
                "sets": 4,
                "reps": "20",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/4162468/pexels-photo-4162468.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/-M4-G8p8fmc"
            }
        ]
    },
    {
        "workout_id": "workout_legs_women_en_01",
        "title": "Booty Builder - Women's Special",
        "description": "Program specially designed to sculpt and shape glutes. Targeted exercises for optimal results.",
        "level": "intermediate",
        "program_type": "legs_glutes",
        "duration": 40,
        "language": "en",
        "image_url": "https://images.pexels.com/photos/6455927/pexels-photo-6455927.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Bench Hip Thrust",
                "description": "The #1 exercise for glutes. Push hips up and squeeze glutes at the top.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6455770/pexels-photo-6455770.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Deep Sumo Squat",
                "description": "Very wide stance, toes out. Go as low as possible.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6455771/pexels-photo-6455771.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/9ZuXKqRbT9k"
            },
            {
                "name": "Fire Hydrants",
                "description": "On all fours, lift leg to the side. Great for hip shape.",
                "sets": 3,
                "reps": "20 per side",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455772/pexels-photo-6455772.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/La3xzk4W-E4"
            },
            {
                "name": "Kneeling Kickbacks",
                "description": "On all fours, push heel toward ceiling. Squeeze the glute.",
                "sets": 3,
                "reps": "15 per leg",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455773/pexels-photo-6455773.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2DrExAwI4fw"
            },
            {
                "name": "Clamshells",
                "description": "Lying on side, knees bent, open knees like a clamshell. Use band for more intensity.",
                "sets": 3,
                "reps": "20 per side",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455774/pexels-photo-6455774.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/cjk2T9qbLzY"
            },
            {
                "name": "Frog Pumps",
                "description": "Lying down, feet together, knees apart. Push hips up.",
                "sets": 3,
                "reps": "25",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455775/pexels-photo-6455775.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/T_6RTc1Ak4s"
            }
        ]
    }
]

async def add_leg_workouts():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("SEEDING LEGS/GLUTES WORKOUTS (UPSERT STRATEGY)")
    print("=" * 60)
    
    # Count before
    before_count = await db.workouts.count_documents({})
    before_legs = await db.workouts.count_documents({"program_type": "legs_glutes"})
    print(f"\nTotal workouts before: {before_count}")
    print(f"Legs/Glutes workouts before: {before_legs}")
    
    inserted = 0
    updated = 0
    
    # Add French workouts
    for workout in WORKOUTS_FR:
        result = await db.workouts.update_one(
            {"workout_id": workout["workout_id"]},
            {"$set": workout},
            upsert=True
        )
        if result.upserted_id:
            inserted += 1
            print(f"  + Inserted: {workout['title']} (FR)")
        elif result.modified_count > 0:
            updated += 1
            print(f"  ~ Updated: {workout['title']} (FR)")
        else:
            print(f"  = Unchanged: {workout['title']} (FR)")
    
    # Add English workouts
    for workout in WORKOUTS_EN:
        result = await db.workouts.update_one(
            {"workout_id": workout["workout_id"]},
            {"$set": workout},
            upsert=True
        )
        if result.upserted_id:
            inserted += 1
            print(f"  + Inserted: {workout['title']} (EN)")
        elif result.modified_count > 0:
            updated += 1
            print(f"  ~ Updated: {workout['title']} (EN)")
        else:
            print(f"  = Unchanged: {workout['title']} (EN)")
    
    # Count after
    after_count = await db.workouts.count_documents({})
    after_legs = await db.workouts.count_documents({"program_type": "legs_glutes"})
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total processed: {len(WORKOUTS_FR) + len(WORKOUTS_EN)}")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Total workouts before: {before_count} -> after: {after_count}")
    print(f"  Legs/Glutes before: {before_legs} -> after: {after_legs}")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_leg_workouts())
