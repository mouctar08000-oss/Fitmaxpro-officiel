"""
Script to seed detailed workout programs for FitMaxPro
Uses UPSERT strategy to prevent data loss when re-running
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

# Programmes pour DÉBUTANTS - Prise de Masse
debutant_masse_fr = [
    {
        "workout_id": "workout_mass_beginner_fr_01",
        "title": "Full Body Débutant - Jour 1",
        "description": "Programme complet du corps pour débutants. Idéal pour apprendre les mouvements de base.",
        "level": "beginner",
        "program_type": "mass_gain",
        "duration": 45,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Échauffement cardio", "sets": 1, "reps": "5 min", "rest": "0s", "description": "Course légère ou vélo"},
            {"name": "Développé couché avec haltères", "sets": 3, "reps": "12", "rest": "90s", "description": "Allongé sur banc, pousser les haltères vers le haut"},
            {"name": "Squat goblet", "sets": 3, "reps": "12", "rest": "90s", "description": "Tenir un haltère contre la poitrine et descendre"},
            {"name": "Rowing barre", "sets": 3, "reps": "12", "rest": "90s", "description": "Dos droit, tirer la barre vers le ventre"},
            {"name": "Développé épaules haltères", "sets": 3, "reps": "10", "rest": "60s", "description": "Assis, pousser les haltères au-dessus de la tête"},
            {"name": "Planche", "sets": 3, "reps": "30s", "rest": "60s", "description": "Position de pompe sur les avant-bras"},
            {"name": "Étirements", "sets": 1, "reps": "5 min", "rest": "0s", "description": "Étirer tous les groupes musculaires travaillés"}
        ]
    },
    {
        "workout_id": "workout_mass_beginner_fr_02",
        "title": "Full Body Débutant - Jour 2",
        "description": "Deuxième séance complète avec nouveaux exercices pour progresser.",
        "level": "beginner",
        "program_type": "mass_gain",
        "duration": 45,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Échauffement dynamique", "sets": 1, "reps": "5 min", "rest": "0s", "description": "Jumping jacks, rotations des bras"},
            {"name": "Pompes sur genoux", "sets": 3, "reps": "10-15", "rest": "90s", "description": "Genoux au sol, descendre la poitrine"},
            {"name": "Fentes alternées", "sets": 3, "reps": "10/jambe", "rest": "90s", "description": "Pas en avant, descendre le genou arrière"},
            {"name": "Tirage horizontal élastique", "sets": 3, "reps": "15", "rest": "60s", "description": "Tirer l'élastique vers la poitrine"},
            {"name": "Élévations latérales", "sets": 3, "reps": "12", "rest": "60s", "description": "Lever les haltères sur les côtés"},
            {"name": "Curl biceps", "sets": 3, "reps": "12", "rest": "60s", "description": "Plier les coudes, amener les haltères vers les épaules"},
            {"name": "Crunchs abdominaux", "sets": 3, "reps": "15", "rest": "45s", "description": "Allongé, soulever les épaules du sol"}
        ]
    },
    {
        "workout_id": "workout_mass_beginner_fr_03",
        "title": "Haut du Corps Débutant",
        "description": "Focus sur le développement du torse, dos et bras.",
        "level": "beginner",
        "program_type": "mass_gain",
        "duration": 40,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Développé incliné haltères", "sets": 3, "reps": "12", "rest": "90s", "description": "Banc incliné à 30°, pousser vers le haut"},
            {"name": "Rowing un bras", "sets": 3, "reps": "12/bras", "rest": "60s", "description": "Genou sur banc, tirer l'haltère vers la hanche"},
            {"name": "Dips assistés", "sets": 3, "reps": "8-10", "rest": "90s", "description": "Barres parallèles, descendre et remonter"},
            {"name": "Tirage vertical poulie", "sets": 3, "reps": "12", "rest": "60s", "description": "Tirer la barre vers la poitrine"},
            {"name": "Curl marteau", "sets": 3, "reps": "12", "rest": "60s", "description": "Haltères verticaux, monter vers les épaules"},
            {"name": "Extension triceps", "sets": 3, "reps": "12", "rest": "60s", "description": "Haltère derrière la tête, étendre les bras"}
        ]
    },
    {
        "workout_id": "workout_mass_beginner_fr_04",
        "title": "Bas du Corps Débutant",
        "description": "Développement des jambes et fessiers pour débutants.",
        "level": "beginner",
        "program_type": "mass_gain",
        "duration": 40,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Squat avec barre", "sets": 3, "reps": "12", "rest": "2 min", "description": "Barre sur les épaules, descendre en gardant le dos droit"},
            {"name": "Presse à cuisses", "sets": 3, "reps": "15", "rest": "90s", "description": "Machine, pousser la plateforme avec les pieds"},
            {"name": "Fentes bulgares", "sets": 3, "reps": "10/jambe", "rest": "90s", "description": "Pied arrière surélevé, descendre"},
            {"name": "Leg curl", "sets": 3, "reps": "12", "rest": "60s", "description": "Machine, ramener les talons vers les fesses"},
            {"name": "Mollets debout", "sets": 4, "reps": "15", "rest": "45s", "description": "Sur marche, monter sur la pointe des pieds"},
            {"name": "Hip thrust", "sets": 3, "reps": "15", "rest": "60s", "description": "Dos sur banc, pousser les hanches vers le haut"}
        ]
    }
]

# Programmes pour AMATEURS - Prise de Masse
amateur_masse_fr = [
    {
        "workout_id": "workout_mass_amateur_fr_01",
        "title": "Push (Poussée) - Amateur",
        "description": "Programme Push : pectoraux, épaules et triceps avec intensité progressive.",
        "level": "amateur",
        "program_type": "mass_gain",
        "duration": 60,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Développé couché barre", "sets": 4, "reps": "8-10", "rest": "2 min", "description": "Mouvement de base pour la poitrine"},
            {"name": "Développé incliné", "sets": 4, "reps": "10", "rest": "90s", "description": "Cible le haut des pectoraux"},
            {"name": "Écarté poulie haute", "sets": 3, "reps": "12", "rest": "60s", "description": "Isolation des pectoraux"},
            {"name": "Développé militaire", "sets": 4, "reps": "8", "rest": "90s", "description": "Épaules, debout avec barre"},
            {"name": "Élévations latérales", "sets": 3, "reps": "12", "rest": "60s", "description": "Deltoïdes moyens"},
            {"name": "Dips lestés", "sets": 3, "reps": "10", "rest": "90s", "description": "Triceps et bas des pecs"},
            {"name": "Extension triceps poulie", "sets": 3, "reps": "12", "rest": "45s", "description": "Isolation triceps"}
        ]
    },
    {
        "workout_id": "workout_mass_amateur_fr_02",
        "title": "Pull (Traction) - Amateur",
        "description": "Programme Pull : dos, trapèzes et biceps pour un dos massif.",
        "level": "amateur",
        "program_type": "mass_gain",
        "duration": 60,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Tractions lestées", "sets": 4, "reps": "8-10", "rest": "2 min", "description": "Avec poids additionnel si possible"},
            {"name": "Rowing barre", "sets": 4, "reps": "8", "rest": "90s", "description": "Dos penché, tirer vers le ventre"},
            {"name": "Tirage horizontal", "sets": 4, "reps": "10", "rest": "90s", "description": "Câble ou machine"},
            {"name": "Rowing haltère un bras", "sets": 3, "reps": "12/bras", "rest": "60s", "description": "Genou sur banc"},
            {"name": "Face pull", "sets": 3, "reps": "15", "rest": "60s", "description": "Arrière des épaules et trapèzes"},
            {"name": "Curl barre", "sets": 4, "reps": "10", "rest": "60s", "description": "Biceps, barre droite"},
            {"name": "Curl incliné", "sets": 3, "reps": "12", "rest": "45s", "description": "Sur banc incliné"}
        ]
    },
    {
        "workout_id": "workout_mass_amateur_fr_03",
        "title": "Legs (Jambes) - Amateur",
        "description": "Programme complet pour des jambes puissantes et massives.",
        "level": "amateur",
        "program_type": "mass_gain",
        "duration": 70,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Squat barre lourd", "sets": 5, "reps": "6-8", "rest": "3 min", "description": "Exercice roi pour les jambes"},
            {"name": "Presse à cuisses", "sets": 4, "reps": "12", "rest": "2 min", "description": "Volume pour quadriceps"},
            {"name": "Fentes marchées", "sets": 4, "reps": "10/jambe", "rest": "90s", "description": "Avec haltères"},
            {"name": "Leg extension", "sets": 3, "reps": "15", "rest": "60s", "description": "Isolation quadriceps"},
            {"name": "Leg curl", "sets": 4, "reps": "12", "rest": "60s", "description": "Ischio-jambiers"},
            {"name": "Soulevé de terre roumain", "sets": 4, "reps": "10", "rest": "90s", "description": "Ischio et lombaires"},
            {"name": "Mollets assis", "sets": 4, "reps": "20", "rest": "45s", "description": "Machine mollets assis"}
        ]
    }
]

# Programmes pour PRO - Prise de Masse
pro_masse_fr = [
    {
        "workout_id": "workout_mass_pro_fr_01",
        "title": "Pectoraux Pro - Volume",
        "description": "Programme avancé pour exploser les pectoraux avec volume et intensité.",
        "level": "pro",
        "program_type": "mass_gain",
        "duration": 90,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Développé couché lourd", "sets": 5, "reps": "5", "rest": "3 min", "description": "Force maximale 85-90% 1RM"},
            {"name": "Développé incliné", "sets": 4, "reps": "8", "rest": "2 min", "description": "Haut des pecs"},
            {"name": "Développé décliné", "sets": 4, "reps": "8", "rest": "2 min", "description": "Bas des pecs"},
            {"name": "Écarté haltères", "sets": 4, "reps": "12", "rest": "90s", "description": "Étirement maximal"},
            {"name": "Pompes diamant", "sets": 3, "reps": "max", "rest": "60s", "description": "Jusqu'à l'échec"},
            {"name": "Crossover poulie", "sets": 4, "reps": "15", "rest": "60s", "description": "Finisher pecs"},
            {"name": "Dips lestés lourd", "sets": 4, "reps": "8", "rest": "2 min", "description": "Maximum de poids"}
        ]
    },
    {
        "workout_id": "workout_mass_pro_fr_02",
        "title": "Dos Pro - Épaisseur & Largeur",
        "description": "Programme pro pour un dos massif : épaisseur, largeur et détails.",
        "level": "pro",
        "program_type": "mass_gain",
        "duration": 90,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Soulevé de terre", "sets": 5, "reps": "5", "rest": "3 min", "description": "Exercice de force global"},
            {"name": "Tractions lestées lourdes", "sets": 4, "reps": "6-8", "rest": "2.5 min", "description": "Largeur du dos"},
            {"name": "Rowing barre T", "sets": 4, "reps": "8", "rest": "2 min", "description": "Épaisseur"},
            {"name": "Rowing Yates", "sets": 4, "reps": "10", "rest": "90s", "description": "Supination pour les lats"},
            {"name": "Pullover", "sets": 3, "reps": "12", "rest": "60s", "description": "Expansion cage thoracique"},
            {"name": "Shrugs barre", "sets": 4, "reps": "15", "rest": "60s", "description": "Trapèzes"},
            {"name": "Face pull lourd", "sets": 4, "reps": "12", "rest": "60s", "description": "Arrière épaules"}
        ]
    },
    {
        "workout_id": "workout_mass_pro_fr_03",
        "title": "Jambes Pro - Force & Masse",
        "description": "Programme destructeur pour des jambes énormes. Attention à l'intensité !",
        "level": "pro",
        "program_type": "mass_gain",
        "duration": 100,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Squat complet lourd", "sets": 6, "reps": "5", "rest": "4 min", "description": "85-90% 1RM, amplitude complète"},
            {"name": "Front squat", "sets": 4, "reps": "8", "rest": "3 min", "description": "Barre devant, focus quadriceps"},
            {"name": "Hack squat", "sets": 4, "reps": "10", "rest": "2 min", "description": "Machine, volume"},
            {"name": "Leg press lourd", "sets": 5, "reps": "12", "rest": "2 min", "description": "Charges importantes"},
            {"name": "Sissy squat", "sets": 3, "reps": "15", "rest": "90s", "description": "Burn out quadriceps"},
            {"name": "Leg curl allongé", "sets": 4, "reps": "12", "rest": "90s", "description": "Ischio-jambiers"},
            {"name": "Soulevé de terre jambes tendues", "sets": 4, "reps": "10", "rest": "2 min", "description": "Ischio et lombaires"},
            {"name": "Mollets debout lourd", "sets": 5, "reps": "12", "rest": "60s", "description": "Charges maximales"}
        ]
    },
    {
        "workout_id": "workout_mass_pro_fr_04",
        "title": "Épaules & Bras Pro",
        "description": "Séance complète épaules et bras pour des mensurations impressionnantes.",
        "level": "pro",
        "program_type": "mass_gain",
        "duration": 85,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg",
        "exercises": [
            {"name": "Développé militaire", "sets": 5, "reps": "6", "rest": "2.5 min", "description": "Lourd, debout"},
            {"name": "Développé Arnold", "sets": 4, "reps": "10", "rest": "90s", "description": "Rotation complète"},
            {"name": "Élévations latérales lourdes", "sets": 4, "reps": "10", "rest": "60s", "description": "Deltoïdes moyens"},
            {"name": "Oiseau haltères", "sets": 4, "reps": "12", "rest": "60s", "description": "Arrière épaules"},
            {"name": "Curl barre lourd", "sets": 4, "reps": "8", "rest": "90s", "description": "Biceps masse"},
            {"name": "Curl incliné", "sets": 3, "reps": "10", "rest": "60s", "description": "Étirement biceps"},
            {"name": "Curl marteau", "sets": 3, "reps": "12", "rest": "60s", "description": "Brachial"},
            {"name": "Dips triceps", "sets": 4, "reps": "10", "rest": "90s", "description": "Triceps masse"},
            {"name": "Barre au front", "sets": 3, "reps": "12", "rest": "60s", "description": "Longue portion triceps"}
        ]
    }
]

# Programmes PERTE DE POIDS - Débutant
debutant_perte_fr = [
    {
        "workout_id": "workout_loss_beginner_fr_01",
        "title": "Cardio Débutant - Faible Impact",
        "description": "Séance de cardio doux pour brûler des calories sans traumatiser les articulations.",
        "level": "beginner",
        "program_type": "weight_loss",
        "duration": 30,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Marche rapide", "sets": 1, "reps": "10 min", "rest": "0s", "description": "Sur tapis ou extérieur"},
            {"name": "Vélo modéré", "sets": 1, "reps": "8 min", "rest": "0s", "description": "Résistance moyenne"},
            {"name": "Elliptique", "sets": 1, "reps": "7 min", "rest": "0s", "description": "Tempo constant"},
            {"name": "Étirements actifs", "sets": 1, "reps": "5 min", "rest": "0s", "description": "Mobilité et souplesse"}
        ]
    },
    {
        "workout_id": "workout_loss_beginner_fr_02",
        "title": "Circuit Training Débutant",
        "description": "Circuit complet pour brûler des calories avec des exercices au poids du corps.",
        "level": "beginner",
        "program_type": "weight_loss",
        "duration": 35,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Jumping jacks", "sets": 4, "reps": "30s", "rest": "30s", "description": "Sauts écartés"},
            {"name": "Squats poids du corps", "sets": 4, "reps": "15", "rest": "30s", "description": "Descendre et remonter"},
            {"name": "Pompes sur genoux", "sets": 4, "reps": "10", "rest": "30s", "description": "Version facilitée"},
            {"name": "Fentes alternées", "sets": 4, "reps": "10/jambe", "rest": "30s", "description": "Sans poids"},
            {"name": "Planche", "sets": 4, "reps": "20s", "rest": "30s", "description": "Gainage"},
            {"name": "Mountain climbers", "sets": 4, "reps": "20s", "rest": "30s", "description": "Genoux vers poitrine"},
            {"name": "Burpees modifiés", "sets": 3, "reps": "8", "rest": "45s", "description": "Sans saut"}
        ]
    }
]

# Programmes PERTE DE POIDS - Amateur
amateur_perte_fr = [
    {
        "workout_id": "workout_loss_amateur_fr_01",
        "title": "HIIT Amateur - Cardio Intense",
        "description": "Entraînement par intervalles à haute intensité pour maximiser la combustion.",
        "level": "amateur",
        "program_type": "weight_loss",
        "duration": 40,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Sprint tapis", "sets": 8, "reps": "30s", "rest": "30s", "description": "Vitesse maximale"},
            {"name": "Burpees", "sets": 5, "reps": "15", "rest": "45s", "description": "Complets avec saut"},
            {"name": "Box jumps", "sets": 5, "reps": "12", "rest": "45s", "description": "Sauts sur box"},
            {"name": "Vélo sprint", "sets": 6, "reps": "45s", "rest": "30s", "description": "Résistance élevée"},
            {"name": "Battle ropes", "sets": 5, "reps": "30s", "rest": "30s", "description": "Ondes alternées"},
            {"name": "Mountain climbers", "sets": 4, "reps": "45s", "rest": "30s", "description": "Rapides"}
        ]
    },
    {
        "workout_id": "workout_loss_amateur_fr_02",
        "title": "Circuit Métabolique Amateur",
        "description": "Circuit complet pour augmenter le métabolisme et brûler des graisses.",
        "level": "amateur",
        "program_type": "weight_loss",
        "duration": 45,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Kettlebell swings", "sets": 5, "reps": "20", "rest": "30s", "description": "Balancier explosif"},
            {"name": "Thruster", "sets": 4, "reps": "12", "rest": "45s", "description": "Squat + développé"},
            {"name": "Rowing rameur", "sets": 5, "reps": "500m", "rest": "60s", "description": "Intensité élevée"},
            {"name": "Wall balls", "sets": 4, "reps": "15", "rest": "45s", "description": "Ballon sur mur"},
            {"name": "Planche dynamique", "sets": 4, "reps": "45s", "rest": "30s", "description": "Avec mouvements"},
            {"name": "Jump rope", "sets": 5, "reps": "60s", "rest": "30s", "description": "Corde à sauter"}
        ]
    }
]

# Programmes PERTE DE POIDS - Pro
pro_perte_fr = [
    {
        "workout_id": "workout_loss_pro_fr_01",
        "title": "Tabata Pro - Maximum Burn",
        "description": "Protocole Tabata extrême : 20s effort maximum / 10s repos. Pour athlètes confirmés.",
        "level": "pro",
        "program_type": "weight_loss",
        "duration": 50,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Vélo Assault Bike", "sets": 8, "reps": "20s", "rest": "10s", "description": "All out, intensité maximale"},
            {"name": "Burpees box jump", "sets": 8, "reps": "20s", "rest": "10s", "description": "Avec saut sur box"},
            {"name": "Kettlebell snatch", "sets": 8, "reps": "20s", "rest": "10s", "description": "Alternance bras"},
            {"name": "Sprint rameur", "sets": 8, "reps": "20s", "rest": "10s", "description": "Puissance maximale"},
            {"name": "Double unders", "sets": 8, "reps": "20s", "rest": "10s", "description": "Corde double passage"},
            {"name": "Mountain climbers explosifs", "sets": 8, "reps": "20s", "rest": "10s", "description": "Vitesse maximale"}
        ]
    },
    {
        "workout_id": "workout_loss_pro_fr_02",
        "title": "CrossFit Pro - WOD Brutal",
        "description": "Workout of the Day style CrossFit pour perte de graisse extrême.",
        "level": "pro",
        "program_type": "weight_loss",
        "duration": 60,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg",
        "exercises": [
            {"name": "Complexe barre (Clean + Front squat + Push press)", "sets": 5, "reps": "5", "rest": "90s", "description": "Enchaînement sans pause"},
            {"name": "Burpees over bar", "sets": 5, "reps": "10", "rest": "0s", "description": "Sauter par-dessus la barre"},
            {"name": "Toes to bar", "sets": 5, "reps": "10", "rest": "0s", "description": "Pieds à la barre"},
            {"name": "Box jumps hauts", "sets": 5, "reps": "10", "rest": "0s", "description": "Box 60cm+"},
            {"name": "Assault bike", "sets": 5, "reps": "1 min", "rest": "0s", "description": "Max calories"},
            {"name": "Finisher : 100 swings kettlebell", "sets": 1, "reps": "100", "rest": "selon besoin", "description": "Le plus vite possible"}
        ]
    }
]

async def seed_detailed_workouts():
    print("=" * 60)
    print("SEEDING DETAILED WORKOUTS (UPSERT STRATEGY)")
    print("=" * 60)
    
    # Combine all French workouts
    all_workouts_fr = (
        debutant_masse_fr + amateur_masse_fr + pro_masse_fr +
        debutant_perte_fr + amateur_perte_fr + pro_perte_fr
    )
    
    # Create English versions
    all_workouts_en = []
    for workout in all_workouts_fr:
        en_workout = workout.copy()
        en_workout['workout_id'] = workout['workout_id'].replace('_fr_', '_en_')
        en_workout['language'] = 'en'
        en_workout['title'] = (
            workout['title']
            .replace('Débutant', 'Beginner')
            .replace('Amateur', 'Intermediate')
            .replace('Pro', 'Advanced')
            .replace('Prise de Masse', 'Mass Gain')
            .replace('Perte de Poids', 'Weight Loss')
        )
        all_workouts_en.append(en_workout)
    
    all_workouts = all_workouts_fr + all_workouts_en
    
    # Count before seeding
    before_count = await db.workouts.count_documents({})
    print(f"\nWorkouts in DB before seeding: {before_count}")
    
    # UPSERT each workout (update if exists, insert if not)
    inserted = 0
    updated = 0
    
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
    
    # Count after seeding
    after_count = await db.workouts.count_documents({})
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total processed: {len(all_workouts)}")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Workouts before: {before_count}")
    print(f"  Workouts after: {after_count}")
    
    # Show breakdown by program type
    print("\n  Breakdown by program type:")
    for ptype in ['mass_gain', 'weight_loss', 'abs', 'legs_glutes', 'women_fitness']:
        count = await db.workouts.count_documents({"program_type": ptype})
        print(f"    - {ptype}: {count}")
    
    print("=" * 60)
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_detailed_workouts())
