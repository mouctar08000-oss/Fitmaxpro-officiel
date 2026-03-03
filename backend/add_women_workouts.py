"""
Script pour ajouter des séances spéciales femmes avec vidéos explicatives
Pour tous les niveaux : Débutant, Intermédiaire, Avancé
Uses UPSERT strategy with stable IDs
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Séances Spéciales Femmes en Français
WOMEN_WORKOUTS_FR = [
    # ========== DÉBUTANT FEMMES ==========
    {
        "workout_id": "workout_women_beginner_fr_01",
        "title": "Programme Femme - Débutant Complet",
        "description": "Programme d'initiation parfait pour les femmes qui débutent la musculation. Exercices doux mais efficaces pour tonifier tout le corps en toute sécurité.",
        "level": "beginner",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 30,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6551133/pexels-photo-6551133.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Échauffement cardio léger",
                "description": "Marche sur place avec rotation des bras. Préparez votre corps en douceur avant l'entraînement.",
                "sets": 1,
                "reps": "3 minutes",
                "rest": "30s",
                "image_url": "https://images.pexels.com/photos/6551136/pexels-photo-6551136.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/3nye25m0ViE"
            },
            {
                "name": "Squats assistés (avec chaise)",
                "description": "Descendez jusqu'à toucher la chaise puis remontez. Parfait pour apprendre le mouvement en toute sécurité.",
                "sets": 3,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551140/pexels-photo-6551140.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/aclHkVaku9U"
            },
            {
                "name": "Pompes sur les genoux",
                "description": "Version modifiée des pompes pour les débutantes. Gardez le dos droit et descendez jusqu'à ce que la poitrine frôle le sol.",
                "sets": 3,
                "reps": "10",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551142/pexels-photo-6551142.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/jWxvty2KROs"
            },
            {
                "name": "Pont fessier",
                "description": "Allongée sur le dos, poussez les hanches vers le haut en contractant les fessiers. L'exercice de base pour des fessiers toniques.",
                "sets": 3,
                "reps": "15",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551145/pexels-photo-6551145.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Planche sur les genoux",
                "description": "Maintenez la position de gainage sur les genoux. Excellent pour renforcer la ceinture abdominale.",
                "sets": 3,
                "reps": "20 secondes",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551148/pexels-photo-6551148.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/Ehy8G_uI-pA"
            },
            {
                "name": "Fentes statiques",
                "description": "Position de fente fixe, descendez et remontez. Travaille les cuisses et fessiers sans risque de déséquilibre.",
                "sets": 3,
                "reps": "10 par jambe",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551150/pexels-photo-6551150.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/QOVaHwm-Q6U"
            }
        ]
    },
    {
        "workout_id": "workout_women_beginner_fr_02",
        "title": "Femme Débutant - Bras & Épaules Toniques",
        "description": "Programme ciblé pour tonifier les bras et les épaules sans prendre de volume. Parfait pour des bras fermes et dessinés.",
        "level": "beginner",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 25,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6551174/pexels-photo-6551174.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Cercles avec les bras",
                "description": "Bras tendus sur les côtés, faites des petits cercles. Échauffement parfait pour les épaules.",
                "sets": 2,
                "reps": "30 secondes",
                "rest": "30s",
                "image_url": "https://images.pexels.com/photos/6551176/pexels-photo-6551176.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/140RTNMciH8"
            },
            {
                "name": "Biceps curl léger",
                "description": "Avec des petites haltères ou des bouteilles d'eau. Pliez les coudes pour amener les poids aux épaules.",
                "sets": 3,
                "reps": "15",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551178/pexels-photo-6551178.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/ykJmrZ5v0Oo"
            },
            {
                "name": "Extensions triceps",
                "description": "Tenez un poids au-dessus de la tête et descendez derrière la nuque. Cible l'arrière des bras.",
                "sets": 3,
                "reps": "12",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551180/pexels-photo-6551180.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/nRiJVZDpdL0"
            },
            {
                "name": "Élévations latérales légères",
                "description": "Levez les bras sur les côtés jusqu'à l'horizontale. Sculpte les épaules en douceur.",
                "sets": 3,
                "reps": "12",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551182/pexels-photo-6551182.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/3VcKaXpzqRo"
            },
            {
                "name": "Pompes contre le mur",
                "description": "Version très accessible des pompes. Idéal pour commencer à renforcer les bras.",
                "sets": 3,
                "reps": "15",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551184/pexels-photo-6551184.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/a6YHbXD2XlU"
            }
        ]
    },
    
    # ========== INTERMÉDIAIRE FEMMES ==========
    {
        "workout_id": "workout_women_intermediate_fr_01",
        "title": "Programme Femme - Intermédiaire Full Body",
        "description": "Programme complet pour les femmes ayant déjà une base en fitness. Intensité modérée pour progresser en force et en définition musculaire.",
        "level": "intermediate",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 45,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6551097/pexels-photo-6551097.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Squat goblet avec haltère",
                "description": "Tenez un haltère contre votre poitrine. Descendez profondément en gardant le dos droit.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551099/pexels-photo-6551099.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/MeIiIdhvXT4"
            },
            {
                "name": "Hip Thrust avec poids",
                "description": "Dos sur un banc, poids sur les hanches. L'exercice roi pour des fessiers galbés.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551101/pexels-photo-6551101.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Pompes classiques",
                "description": "Pompes complètes sur les pieds. Gardez le corps aligné de la tête aux talons.",
                "sets": 3,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551103/pexels-photo-6551103.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/IODxDxX7oi4"
            },
            {
                "name": "Rowing un bras avec haltère",
                "description": "Un genou sur le banc, tirez l'haltère vers la hanche. Excellent pour le dos.",
                "sets": 3,
                "reps": "12 par bras",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551105/pexels-photo-6551105.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/pYcpY20QaE8"
            },
            {
                "name": "Fentes bulgares",
                "description": "Pied arrière sur un banc. Exercice intense pour les jambes et fessiers.",
                "sets": 3,
                "reps": "10 par jambe",
                "rest": "75s",
                "image_url": "https://images.pexels.com/photos/6551107/pexels-photo-6551107.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2C-uNgKwPLE"
            },
            {
                "name": "Planche classique",
                "description": "Gainage complet sur les pieds. Maintenez le corps parfaitement aligné.",
                "sets": 3,
                "reps": "45 secondes",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551109/pexels-photo-6551109.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/pSHjTRCQxIw"
            },
            {
                "name": "Mountain climbers",
                "description": "En position de planche, amenez les genoux alternativement vers la poitrine. Cardio et abdos combinés.",
                "sets": 3,
                "reps": "30 secondes",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551111/pexels-photo-6551111.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/nmwgirgXLYM"
            }
        ]
    },
    {
        "workout_id": "workout_women_intermediate_fr_02",
        "title": "Femme Intermédiaire - Sculpter & Tonifier",
        "description": "Programme de sculpture corporelle pour femmes intermédiaires. Focus sur les zones clés : fessiers, cuisses, bras et ventre plat.",
        "level": "intermediate",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 40,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6551061/pexels-photo-6551061.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Sumo Squat avec haltère",
                "description": "Pieds très écartés, pointes vers l'extérieur. Cible l'intérieur des cuisses et les fessiers.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551063/pexels-photo-6551063.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/9ZuXKqRbT9k"
            },
            {
                "name": "Kickbacks à la poulie / élastique",
                "description": "Poussez la jambe vers l'arrière en contractant le fessier. Isolation parfaite.",
                "sets": 3,
                "reps": "15 par jambe",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551065/pexels-photo-6551065.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2DrExAwI4fw"
            },
            {
                "name": "Crunchs abdominaux",
                "description": "Allongée, soulevez les épaules du sol en contractant les abdos. Base pour un ventre plat.",
                "sets": 3,
                "reps": "20",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551067/pexels-photo-6551067.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/Xyd_fa5zoEU"
            },
            {
                "name": "Dips sur chaise (triceps)",
                "description": "Mains sur une chaise, descendez en pliant les coudes. Tonifie l'arrière des bras.",
                "sets": 3,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551069/pexels-photo-6551069.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/6kALZikXxLc"
            },
            {
                "name": "Step-ups sur banc",
                "description": "Montez sur un banc en poussant avec une jambe. Excellent pour le galbe des fessiers.",
                "sets": 3,
                "reps": "12 par jambe",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551071/pexels-photo-6551071.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/dQqApCGd5Ss"
            },
            {
                "name": "Russian Twist",
                "description": "Assise, pieds levés, tournez le buste de gauche à droite. Travaille les obliques.",
                "sets": 3,
                "reps": "20 (total)",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551073/pexels-photo-6551073.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/wkD8rjkodUI"
            }
        ]
    },
    
    # ========== AVANCÉ FEMMES ==========
    {
        "workout_id": "workout_women_advanced_fr_01",
        "title": "Programme Femme - Avancé Haute Intensité",
        "description": "Programme intense pour femmes expérimentées. Combine force, cardio et gainage pour un corps athlétique et sculpté.",
        "level": "advanced",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 55,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6551019/pexels-photo-6551019.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Squat jump (squat sauté)",
                "description": "Squat explosif avec saut. Puissance et cardio combinés.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551021/pexels-photo-6551021.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/CVaEhXotL7M"
            },
            {
                "name": "Hip Thrust lourd",
                "description": "Version avec charge importante pour maximiser le développement des fessiers.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/6551023/pexels-photo-6551023.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Burpees",
                "description": "L'exercice complet : squat, planche, pompe, saut. Brûle un maximum de calories.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551025/pexels-photo-6551025.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/dZgVxmf6jkA"
            },
            {
                "name": "Soulevé de terre roumain",
                "description": "Excellent pour les ischio-jambiers et le bas du dos. Gardez le dos droit.",
                "sets": 4,
                "reps": "10",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/6551027/pexels-photo-6551027.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/JCXUYuzwNrM"
            },
            {
                "name": "Push-up diamant",
                "description": "Pompes mains rapprochées en forme de diamant. Très intense pour les triceps.",
                "sets": 3,
                "reps": "10",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551029/pexels-photo-6551029.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/J0DnG1_S92I"
            },
            {
                "name": "Fentes sautées alternées",
                "description": "Changez de jambe en sautant. Exercice explosif pour les jambes.",
                "sets": 3,
                "reps": "20 (total)",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551031/pexels-photo-6551031.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/y7Iug7eC0dk"
            },
            {
                "name": "Planche avec toucher d'épaule",
                "description": "En planche, touchez alternativement l'épaule opposée. Gainage dynamique.",
                "sets": 3,
                "reps": "20 (total)",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551033/pexels-photo-6551033.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/TEY_zMDlla8"
            },
            {
                "name": "V-ups (abdos en V)",
                "description": "Montez simultanément le buste et les jambes pour former un V. Abdos intenses.",
                "sets": 3,
                "reps": "15",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551035/pexels-photo-6551035.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/7UVgs18Y1P4"
            }
        ]
    },
    {
        "workout_id": "workout_women_advanced_fr_02",
        "title": "Femme Avancé - Beach Body Sculptant",
        "description": "Programme ultime pour un corps de plage parfait. Exercices ciblés pour sculpter chaque muscle visible.",
        "level": "advanced",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 50,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6455927/pexels-photo-6455927.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Thruster (squat + press)",
                "description": "Combinez un squat avec une poussée d'haltères au-dessus de la tête. Mouvement complet.",
                "sets": 4,
                "reps": "12",
                "rest": "75s",
                "image_url": "https://images.pexels.com/photos/6455929/pexels-photo-6455929.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/L219ltL15zk"
            },
            {
                "name": "Single Leg Hip Thrust",
                "description": "Hip thrust sur une jambe pour un travail unilatéral intense des fessiers.",
                "sets": 3,
                "reps": "12 par jambe",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6455931/pexels-photo-6455931.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/AVU5J7hl6c4"
            },
            {
                "name": "Box jumps",
                "description": "Sautez sur une box ou un banc. Puissance des jambes et cardio.",
                "sets": 4,
                "reps": "10",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6455933/pexels-photo-6455933.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/NBY9-kTuHEk"
            },
            {
                "name": "Arnold Press",
                "description": "Développé épaules avec rotation. Sculpte les épaules de façon complète.",
                "sets": 3,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6455935/pexels-photo-6455935.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/3ml7BH7mNwQ"
            },
            {
                "name": "Sumo Deadlift",
                "description": "Soulevé de terre en position sumo. Excellent pour l'intérieur des cuisses et les fessiers.",
                "sets": 4,
                "reps": "10",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/6455937/pexels-photo-6455937.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/tfYGaOKFwYo"
            },
            {
                "name": "Planche latérale avec rotation",
                "description": "Planche sur le côté avec rotation du buste. Travaille les obliques intensément.",
                "sets": 3,
                "reps": "10 par côté",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455939/pexels-photo-6455939.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/wqzrb67Dwf8"
            },
            {
                "name": "Bicycle crunches",
                "description": "Pédalage allongé avec rotation du buste. Travail complet des abdominaux.",
                "sets": 3,
                "reps": "30 (total)",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6455941/pexels-photo-6455941.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/9FGilxCbdz8"
            }
        ]
    }
]

# Versions anglaises
WOMEN_WORKOUTS_EN = [
    {
        "workout_id": "workout_women_beginner_en_01",
        "title": "Women's Program - Complete Beginner",
        "description": "Perfect introduction program for women starting fitness. Gentle but effective exercises to tone the whole body safely.",
        "level": "beginner",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 30,
        "language": "en",
        "image_url": "https://images.pexels.com/photos/6551133/pexels-photo-6551133.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Light Cardio Warm-up",
                "description": "Walk in place with arm rotations. Gently prepare your body before training.",
                "sets": 1,
                "reps": "3 minutes",
                "rest": "30s",
                "image_url": "https://images.pexels.com/photos/6551136/pexels-photo-6551136.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/3nye25m0ViE"
            },
            {
                "name": "Chair-Assisted Squats",
                "description": "Lower until you touch the chair then stand up. Perfect for learning the movement safely.",
                "sets": 3,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551140/pexels-photo-6551140.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/aclHkVaku9U"
            },
            {
                "name": "Knee Push-ups",
                "description": "Modified push-ups for beginners. Keep back straight and lower until chest nearly touches floor.",
                "sets": 3,
                "reps": "10",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551142/pexels-photo-6551142.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/jWxvty2KROs"
            },
            {
                "name": "Glute Bridge",
                "description": "Lying on back, push hips up while squeezing glutes. Basic exercise for toned glutes.",
                "sets": 3,
                "reps": "15",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551145/pexels-photo-6551145.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Knee Plank",
                "description": "Plank position on knees. Excellent for strengthening core.",
                "sets": 3,
                "reps": "20 seconds",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551148/pexels-photo-6551148.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/Ehy8G_uI-pA"
            },
            {
                "name": "Static Lunges",
                "description": "Fixed lunge position, lower and rise. Works thighs and glutes without balance risk.",
                "sets": 3,
                "reps": "10 per leg",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551150/pexels-photo-6551150.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/QOVaHwm-Q6U"
            }
        ]
    },
    {
        "workout_id": "workout_women_intermediate_en_01",
        "title": "Women's Program - Intermediate Full Body",
        "description": "Complete program for women with fitness foundation. Moderate intensity for strength and muscle definition progress.",
        "level": "intermediate",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 45,
        "language": "en",
        "image_url": "https://images.pexels.com/photos/6551097/pexels-photo-6551097.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Goblet Squat",
                "description": "Hold dumbbell against chest. Go deep while keeping back straight.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551099/pexels-photo-6551099.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/MeIiIdhvXT4"
            },
            {
                "name": "Weighted Hip Thrust",
                "description": "Back on bench, weight on hips. The king exercise for shaped glutes.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551101/pexels-photo-6551101.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Full Push-ups",
                "description": "Complete push-ups on feet. Keep body aligned from head to heels.",
                "sets": 3,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551103/pexels-photo-6551103.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/IODxDxX7oi4"
            },
            {
                "name": "Single Arm Dumbbell Row",
                "description": "One knee on bench, pull dumbbell to hip. Excellent for back.",
                "sets": 3,
                "reps": "12 per arm",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551105/pexels-photo-6551105.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/pYcpY20QaE8"
            },
            {
                "name": "Bulgarian Split Squats",
                "description": "Rear foot on bench. Intense exercise for legs and glutes.",
                "sets": 3,
                "reps": "10 per leg",
                "rest": "75s",
                "image_url": "https://images.pexels.com/photos/6551107/pexels-photo-6551107.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/2C-uNgKwPLE"
            },
            {
                "name": "Full Plank",
                "description": "Complete plank on feet. Maintain perfectly aligned body.",
                "sets": 3,
                "reps": "45 seconds",
                "rest": "45s",
                "image_url": "https://images.pexels.com/photos/6551109/pexels-photo-6551109.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/pSHjTRCQxIw"
            }
        ]
    },
    {
        "workout_id": "workout_women_advanced_en_01",
        "title": "Women's Program - Advanced High Intensity",
        "description": "Intense program for experienced women. Combines strength, cardio and core for an athletic, sculpted body.",
        "level": "advanced",
        "program_type": "women_fitness",
        "target_audience": "women",
        "duration": 55,
        "language": "en",
        "image_url": "https://images.pexels.com/photos/6551019/pexels-photo-6551019.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Jump Squats",
                "description": "Explosive squat with jump. Power and cardio combined.",
                "sets": 4,
                "reps": "15",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551021/pexels-photo-6551021.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/CVaEhXotL7M"
            },
            {
                "name": "Heavy Hip Thrust",
                "description": "Heavy version to maximize glute development.",
                "sets": 4,
                "reps": "12",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/6551023/pexels-photo-6551023.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/SEdqd1n0cvg"
            },
            {
                "name": "Burpees",
                "description": "Complete exercise: squat, plank, push-up, jump. Burns maximum calories.",
                "sets": 4,
                "reps": "12",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551025/pexels-photo-6551025.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/dZgVxmf6jkA"
            },
            {
                "name": "Romanian Deadlift",
                "description": "Excellent for hamstrings and lower back. Keep back straight.",
                "sets": 4,
                "reps": "10",
                "rest": "90s",
                "image_url": "https://images.pexels.com/photos/6551027/pexels-photo-6551027.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/JCXUYuzwNrM"
            },
            {
                "name": "Diamond Push-ups",
                "description": "Push-ups with hands close in diamond shape. Very intense for triceps.",
                "sets": 3,
                "reps": "10",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551029/pexels-photo-6551029.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/J0DnG1_S92I"
            },
            {
                "name": "Alternating Jump Lunges",
                "description": "Switch legs by jumping. Explosive exercise for legs.",
                "sets": 3,
                "reps": "20 (total)",
                "rest": "60s",
                "image_url": "https://images.pexels.com/photos/6551031/pexels-photo-6551031.jpeg?auto=compress&cs=tinysrgb&w=600",
                "video_url": "https://www.youtube.com/embed/y7Iug7eC0dk"
            }
        ]
    }
]

async def add_women_workouts():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("SEEDING WOMEN'S WORKOUTS (UPSERT STRATEGY)")
    print("=" * 60)
    
    # Count before
    before_count = await db.workouts.count_documents({})
    before_women = await db.workouts.count_documents({"program_type": "women_fitness"})
    print(f"\nTotal workouts before: {before_count}")
    print(f"Women's workouts before: {before_women}")
    
    inserted = 0
    updated = 0
    
    # Add French workouts
    for workout in WOMEN_WORKOUTS_FR:
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
    for workout in WOMEN_WORKOUTS_EN:
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
    after_women = await db.workouts.count_documents({"program_type": "women_fitness"})
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total processed: {len(WOMEN_WORKOUTS_FR) + len(WOMEN_WORKOUTS_EN)}")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Total workouts before: {before_count} -> after: {after_count}")
    print(f"  Women's before: {before_women} -> after: {after_women}")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_women_workouts())
