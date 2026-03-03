"""
Script to add Yoga/Relaxation workout programs with working YouTube videos
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

# Séances Yoga/Détente complètes avec vidéos YouTube fonctionnelles
yoga_workouts = [
    # ============== FRANÇAIS - DÉBUTANT ==============
    {
        "workout_id": "workout_yoga_beginner_fr_01",
        "title": "Yoga Débutant - Éveil Matinal",
        "description": "Séance douce pour bien commencer la journée. Étirements et respiration pour réveiller le corps en douceur.",
        "level": "beginner",
        "program_type": "yoga",
        "duration": 15,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Respiration abdominale",
                "description": "Assis confortablement, respirez profondément en gonflant le ventre.",
                "sets": 1,
                "reps": "2 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/odADwWzHR24"
            },
            {
                "name": "Posture de l'enfant (Balasana)",
                "description": "À genoux, penchez-vous vers l'avant, bras allongés devant vous.",
                "sets": 1,
                "reps": "1 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/2MJGg-dUKh0"
            },
            {
                "name": "Chat-Vache (Cat-Cow)",
                "description": "À quatre pattes, alternez dos arrondi et dos creux.",
                "sets": 1,
                "reps": "10 cycles",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/kqnua4rHVVA"
            },
            {
                "name": "Chien tête en bas (Downward Dog)",
                "description": "Formez un V inversé avec votre corps, mains et pieds au sol.",
                "sets": 1,
                "reps": "45 sec",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056532/pexels-photo-4056532.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/ayGJ5CFST3k"
            },
            {
                "name": "Posture de la montagne (Tadasana)",
                "description": "Debout, pieds joints, bras le long du corps, étirez-vous vers le ciel.",
                "sets": 1,
                "reps": "30 sec",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/8EMV33coq14"
            },
            {
                "name": "Salutation au soleil simplifiée",
                "description": "Enchaînement doux : montagne, flexion avant, planche, cobra, chien tête en bas.",
                "sets": 3,
                "reps": "1 cycle",
                "rest_seconds": 15,
                "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/73sjOu0g58M"
            }
        ]
    },
    {
        "workout_id": "workout_yoga_beginner_fr_02",
        "title": "Yoga Débutant - Détente du Soir",
        "description": "Séance relaxante pour évacuer le stress de la journée et préparer un sommeil réparateur.",
        "level": "beginner",
        "program_type": "yoga",
        "duration": 20,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/3822583/pexels-photo-3822583.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Respiration 4-7-8",
                "description": "Inspirez 4 sec, retenez 7 sec, expirez 8 sec. Technique anti-stress.",
                "sets": 1,
                "reps": "5 cycles",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/YRPh_GaiL8s"
            },
            {
                "name": "Torsion allongée",
                "description": "Allongé, ramenez un genou sur le côté opposé, bras en croix.",
                "sets": 1,
                "reps": "1 min/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/vGIvV4gJKiI"
            },
            {
                "name": "Papillon couché (Supta Baddha Konasana)",
                "description": "Allongé, plantes des pieds jointes, genoux vers l'extérieur.",
                "sets": 1,
                "reps": "2 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822583/pexels-photo-3822583.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/WuRYgLKr2Zg"
            },
            {
                "name": "Jambes au mur (Viparita Karani)",
                "description": "Allongé, jambes contre le mur, bras le long du corps.",
                "sets": 1,
                "reps": "3 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/U41s2MePMfI"
            },
            {
                "name": "Posture du cadavre (Savasana)",
                "description": "Allongé sur le dos, bras écartés, paumes vers le ciel, relaxation totale.",
                "sets": 1,
                "reps": "5 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/1VYlOKUdylM"
            }
        ]
    },
    {
        "workout_id": "workout_yoga_beginner_fr_03",
        "title": "Yoga Débutant - Souplesse Dos",
        "description": "Séance ciblée pour assouplir le dos et soulager les tensions du quotidien.",
        "level": "beginner",
        "program_type": "yoga",
        "duration": 18,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Étirement des lombaires",
                "description": "Allongé, ramenez les deux genoux sur la poitrine.",
                "sets": 1,
                "reps": "1 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/r9ULzVjcvlM"
            },
            {
                "name": "Chat-Vache lent",
                "description": "À quatre pattes, enchaînez dos arrondi et dos creux très lentement.",
                "sets": 1,
                "reps": "15 cycles",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/kqnua4rHVVA"
            },
            {
                "name": "Sphinx",
                "description": "Allongé sur le ventre, soulevez le buste sur les avant-bras.",
                "sets": 1,
                "reps": "1 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056532/pexels-photo-4056532.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/XwOMnc07sAU"
            },
            {
                "name": "Torsion assise",
                "description": "Assis, tournez le buste vers la droite puis la gauche.",
                "sets": 1,
                "reps": "45 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/I-h3iXRVYaY"
            },
            {
                "name": "Posture de l'enfant étendue",
                "description": "Posture de l'enfant avec les bras allongés sur les côtés.",
                "sets": 1,
                "reps": "2 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/2MJGg-dUKh0"
            }
        ]
    },

    # ============== FRANÇAIS - INTERMÉDIAIRE ==============
    {
        "workout_id": "workout_yoga_intermediate_fr_01",
        "title": "Yoga Intermédiaire - Flow Énergisant",
        "description": "Séance dynamique pour tonifier le corps et booster l'énergie. Enchaînements fluides.",
        "level": "intermediate",
        "program_type": "yoga",
        "duration": 30,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Salutation au soleil A",
                "description": "Enchaînement classique : montagne, flexion, demi-flexion, planche, chaturanga, cobra, chien tête en bas.",
                "sets": 5,
                "reps": "1 cycle",
                "rest_seconds": 10,
                "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/73sjOu0g58M"
            },
            {
                "name": "Guerrier I (Virabhadrasana I)",
                "description": "Fente avant, bras levés, regard vers le haut.",
                "sets": 1,
                "reps": "45 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/k4qaVoAbeHM"
            },
            {
                "name": "Guerrier II (Virabhadrasana II)",
                "description": "Fente latérale, bras parallèles au sol, regard vers l'avant.",
                "sets": 1,
                "reps": "45 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/QMcZ8dKD_yA"
            },
            {
                "name": "Triangle (Trikonasana)",
                "description": "Jambes écartées, penchez-vous latéralement, main vers le pied.",
                "sets": 1,
                "reps": "30 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/upFYlxZHif0"
            },
            {
                "name": "Demi-lune (Ardha Chandrasana)",
                "description": "Équilibre sur une jambe, corps parallèle au sol.",
                "sets": 1,
                "reps": "30 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056532/pexels-photo-4056532.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/CRg2EXcNJsc"
            },
            {
                "name": "Planche latérale (Vasisthasana)",
                "description": "Équilibre sur une main, corps aligné, autre bras vers le ciel.",
                "sets": 1,
                "reps": "30 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4162453/pexels-photo-4162453.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/rQVaAf7R1SM"
            }
        ]
    },
    {
        "workout_id": "workout_yoga_intermediate_fr_02",
        "title": "Yoga Intermédiaire - Équilibre & Force",
        "description": "Séance pour développer l'équilibre et la force musculaire avec des postures tenues.",
        "level": "intermediate",
        "program_type": "yoga",
        "duration": 35,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Arbre (Vrksasana)",
                "description": "Debout sur une jambe, l'autre pied contre la cuisse, mains en prière.",
                "sets": 1,
                "reps": "1 min/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/wdln9qWYloU"
            },
            {
                "name": "Aigle (Garudasana)",
                "description": "Jambes et bras entrelacés, équilibre sur une jambe.",
                "sets": 1,
                "reps": "45 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/cIWrGV-QLtI"
            },
            {
                "name": "Guerrier III (Virabhadrasana III)",
                "description": "Équilibre sur une jambe, corps et jambe arrière parallèles au sol.",
                "sets": 1,
                "reps": "30 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/je2r2QlP4f0"
            },
            {
                "name": "Chaise (Utkatasana)",
                "description": "Jambes pliées comme assis sur une chaise invisible, bras levés.",
                "sets": 1,
                "reps": "45 sec",
                "rest_seconds": 15,
                "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/6T94quLt8nM"
            },
            {
                "name": "Bateau (Navasana)",
                "description": "Assis, jambes et buste levés formant un V, bras parallèles au sol.",
                "sets": 3,
                "reps": "30 sec",
                "rest_seconds": 15,
                "image_url": "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/QVEINjrYUPU"
            },
            {
                "name": "Corbeau (Bakasana) - Préparation",
                "description": "Mains au sol, genoux sur les triceps, transférez le poids vers l'avant.",
                "sets": 3,
                "reps": "15 sec",
                "rest_seconds": 15,
                "image_url": "https://images.pexels.com/photos/4056532/pexels-photo-4056532.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/Evqb9mSKRKQ"
            }
        ]
    },

    # ============== FRANÇAIS - AVANCÉ ==============
    {
        "workout_id": "workout_yoga_advanced_fr_01",
        "title": "Yoga Avancé - Power Vinyasa",
        "description": "Séance intense et fluide pour les yogis expérimentés. Postures avancées et transitions challengeantes.",
        "level": "advanced",
        "program_type": "yoga",
        "duration": 45,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/4056532/pexels-photo-4056532.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Salutation au soleil B",
                "description": "Version avancée avec chaise et guerrier I intégrés.",
                "sets": 5,
                "reps": "1 cycle",
                "rest_seconds": 5,
                "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/AV6IIl6eV-w"
            },
            {
                "name": "Corbeau (Bakasana)",
                "description": "Équilibre sur les mains, genoux sur les triceps.",
                "sets": 3,
                "reps": "30 sec",
                "rest_seconds": 15,
                "image_url": "https://images.pexels.com/photos/4056532/pexels-photo-4056532.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/Evqb9mSKRKQ"
            },
            {
                "name": "Poirier (Sirsasana) - Mur",
                "description": "Équilibre sur la tête contre le mur pour sécurité.",
                "sets": 2,
                "reps": "1 min",
                "rest_seconds": 30,
                "image_url": "https://images.pexels.com/photos/4056532/pexels-photo-4056532.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/y3zH8i-TmKQ"
            },
            {
                "name": "Roue (Urdhva Dhanurasana)",
                "description": "Pont complet, mains et pieds au sol, corps arqué.",
                "sets": 3,
                "reps": "30 sec",
                "rest_seconds": 20,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/pwa5aXKfilo"
            },
            {
                "name": "Pigeon royal (Eka Pada Rajakapotasana)",
                "description": "Pigeon avec la jambe arrière attrapée par les mains au-dessus de la tête.",
                "sets": 1,
                "reps": "1 min/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/63JZ3szlsLc"
            },
            {
                "name": "Danseur (Natarajasana)",
                "description": "Debout, attrapez le pied arrière et penchez-vous vers l'avant.",
                "sets": 1,
                "reps": "45 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056534/pexels-photo-4056534.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/v2eX-TaX7qo"
            }
        ]
    },
    {
        "workout_id": "workout_yoga_advanced_fr_02",
        "title": "Yoga Avancé - Flexibilité Profonde",
        "description": "Séance de stretching profond pour gagner en souplesse. Postures tenues longtemps.",
        "level": "advanced",
        "program_type": "yoga",
        "duration": 40,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/3822583/pexels-photo-3822583.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Grand écart latéral (Hanumanasana)",
                "description": "Progressez vers le grand écart avec des blocs si nécessaire.",
                "sets": 1,
                "reps": "2 min/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822583/pexels-photo-3822583.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/cWcgpF3emK0"
            },
            {
                "name": "Écart facial (Samakonasana)",
                "description": "Écartez progressivement les jambes sur les côtés.",
                "sets": 1,
                "reps": "2 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822583/pexels-photo-3822583.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/8kXqONEZvPw"
            },
            {
                "name": "Pigeon couché (Supta Kapotasana)",
                "description": "Allongé, cheville sur le genou opposé, tirez vers vous.",
                "sets": 1,
                "reps": "2 min/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/Ho4-ksHGmhQ"
            },
            {
                "name": "Pince assise (Paschimottanasana)",
                "description": "Assis, penchez-vous vers l'avant, attrapez vos pieds.",
                "sets": 1,
                "reps": "2 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/HqsY_n8Bw9c"
            },
            {
                "name": "Étirement ischio-jambiers allongé",
                "description": "Allongé, tirez une jambe tendue vers vous avec une sangle.",
                "sets": 1,
                "reps": "90 sec/côté",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/9MZz_aFjNSE"
            }
        ]
    },

    # ============== SÉANCES DE MÉDITATION/RELAXATION ==============
    {
        "workout_id": "workout_meditation_fr_01",
        "title": "Méditation Guidée - Anti-Stress",
        "description": "Séance de méditation guidée pour évacuer le stress et retrouver le calme intérieur.",
        "level": "beginner",
        "program_type": "yoga",
        "duration": 15,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Installation confortable",
                "description": "Asseyez-vous confortablement, fermez les yeux, détendez vos épaules.",
                "sets": 1,
                "reps": "1 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/inpok4MKVLM"
            },
            {
                "name": "Body Scan",
                "description": "Parcourez mentalement chaque partie de votre corps en la détendant.",
                "sets": 1,
                "reps": "5 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/T0nuKTqAj7Q"
            },
            {
                "name": "Respiration consciente",
                "description": "Concentrez-vous uniquement sur votre respiration, sans la modifier.",
                "sets": 1,
                "reps": "5 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/odADwWzHR24"
            },
            {
                "name": "Visualisation positive",
                "description": "Imaginez un lieu paisible où vous vous sentez en sécurité.",
                "sets": 1,
                "reps": "4 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/Jyy0ra2WcQQ"
            }
        ]
    },
    {
        "workout_id": "workout_meditation_fr_02",
        "title": "Yoga Nidra - Sommeil Yogique",
        "description": "Relaxation profonde guidée pour un repos réparateur. Allongé, laissez-vous guider.",
        "level": "beginner",
        "program_type": "yoga",
        "duration": 25,
        "language": "fr",
        "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=800",
        "exercises": [
            {
                "name": "Savasana préparatoire",
                "description": "Allongez-vous confortablement, paumes vers le ciel, yeux fermés.",
                "sets": 1,
                "reps": "2 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/1VYlOKUdylM"
            },
            {
                "name": "Rotation de conscience",
                "description": "Portez votre attention sur chaque partie du corps successivement.",
                "sets": 1,
                "reps": "8 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/7H0FKzeuVVs"
            },
            {
                "name": "Respiration naturelle",
                "description": "Observez votre respiration sans la contrôler.",
                "sets": 1,
                "reps": "5 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/odADwWzHR24"
            },
            {
                "name": "Retour progressif",
                "description": "Revenez doucement à la conscience, bougez les doigts et orteils.",
                "sets": 1,
                "reps": "5 min",
                "rest_seconds": 0,
                "image_url": "https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400",
                "video_url": "https://www.youtube.com/embed/RMpS3xzb8T4"
            }
        ]
    }
]

# Créer les versions anglaises
yoga_workouts_en = []
for workout in yoga_workouts:
    en_workout = workout.copy()
    en_workout['workout_id'] = workout['workout_id'].replace('_fr_', '_en_')
    en_workout['language'] = 'en'
    # Translate titles
    en_workout['title'] = (
        workout['title']
        .replace('Yoga Débutant', 'Yoga Beginner')
        .replace('Yoga Intermédiaire', 'Yoga Intermediate')
        .replace('Yoga Avancé', 'Yoga Advanced')
        .replace('Méditation Guidée', 'Guided Meditation')
        .replace('Yoga Nidra', 'Yoga Nidra')
        .replace('Éveil Matinal', 'Morning Awakening')
        .replace('Détente du Soir', 'Evening Relaxation')
        .replace('Souplesse Dos', 'Back Flexibility')
        .replace('Flow Énergisant', 'Energizing Flow')
        .replace('Équilibre & Force', 'Balance & Strength')
        .replace('Power Vinyasa', 'Power Vinyasa')
        .replace('Flexibilité Profonde', 'Deep Flexibility')
        .replace('Anti-Stress', 'Anti-Stress')
        .replace('Sommeil Yogique', 'Yogic Sleep')
    )
    yoga_workouts_en.append(en_workout)

async def seed_yoga_workouts():
    print("=" * 60)
    print("SEEDING YOGA/RELAXATION WORKOUTS (UPSERT STRATEGY)")
    print("=" * 60)
    
    # Count before
    before_count = await db.workouts.count_documents({})
    before_yoga = await db.workouts.count_documents({"program_type": "yoga"})
    print(f"\nTotal workouts before: {before_count}")
    print(f"Yoga workouts before: {before_yoga}")
    
    inserted = 0
    updated = 0
    
    all_workouts = yoga_workouts + yoga_workouts_en
    
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
    after_yoga = await db.workouts.count_documents({"program_type": "yoga"})
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total processed: {len(all_workouts)}")
    print(f"  Inserted: {inserted}")
    print(f"  Updated: {updated}")
    print(f"  Total workouts before: {before_count} -> after: {after_count}")
    print(f"  Yoga workouts before: {before_yoga} -> after: {after_yoga}")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_yoga_workouts())
