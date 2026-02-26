# Liste des fichiers à copier - FitMaxPro

## FICHIERS ESSENTIELS À COPIER

### 1. BACKEND (dossier backend/)

| Fichier | Description |
|---------|-------------|
| `server.py` | API principale (OBLIGATOIRE) |
| `requirements.txt` | Dépendances Python (OBLIGATOIRE) |
| `.env.example` | Template configuration |
| `Dockerfile` | Pour déploiement Docker |
| `seed_detailed_workouts.py` | Script données exercices |
| `seed_media_content.py` | Script images/vidéos |

### 2. FRONTEND (dossier frontend/)

| Fichier/Dossier | Description |
|-----------------|-------------|
| `package.json` | Dépendances Node.js (OBLIGATOIRE) |
| `.env.example` | Template configuration |
| `Dockerfile` | Pour déploiement Docker |
| `nginx.conf` | Configuration serveur web |
| `src/App.js` | Point d'entrée React |
| `src/App.css` | Styles globaux |
| `src/i18n.js` | Traductions FR/EN |
| `src/context/AuthContext.js` | Gestion authentification |
| `src/pages/*.js` | Toutes les pages |
| `src/components/*.js` | Composants réutilisables |
| `src/components/ui/*.jsx` | Composants UI (Shadcn) |

### 3. RACINE DU PROJET

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation principale |
| `docker-compose.yml` | Déploiement Docker |
| `.gitignore` | Fichiers à ignorer |

### 4. DOCUMENTATION (dossier docs/)

| Fichier | Description |
|---------|-------------|
| `GUIDE_INSTALLATION.md` | Installation |
| `GUIDE_STRIPE.md` | Configuration paiements |
| `GUIDE_DEPLOIEMENT.md` | Déploiement |

---

## PAGES FRONTEND À COPIER

Dans `frontend/src/pages/` :
- LandingPage.js
- LoginPage.js
- SignupPage.js
- Dashboard.js
- PricingPage.js
- WorkoutsPage.js
- WorkoutDetailPage.js
- SupplementsPage.js
- SuccessPage.js
- AuthCallback.js

## COMPOSANTS À COPIER

Dans `frontend/src/components/` :
- Navigation.js
- Footer.js
- ProtectedRoute.js

Dans `frontend/src/components/ui/` :
- button.jsx
- card.jsx
- input.jsx
- tabs.jsx
- dialog.jsx
- (et tous les autres fichiers .jsx)

---

## COMMANDES POUR DÉMARRER

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --port 8001

# Frontend
cd frontend
yarn install
yarn start
```
