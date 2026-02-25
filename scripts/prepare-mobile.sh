#!/bin/bash

echo "🚀 Préparation de FitMaxPro pour déploiement mobile"
echo "=================================================="

cd /app/frontend

echo ""
echo "1️⃣ Build de production..."
yarn build

echo ""
echo "2️⃣ Ajout des plateformes..."

# Android
if [ ! -d "android" ]; then
    echo "   📱 Ajout d'Android..."
    npx cap add android
else
    echo "   ✅ Android déjà configuré"
fi

# iOS (seulement si sur Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ ! -d "ios" ]; then
        echo "   🍎 Ajout d'iOS..."
        npx cap add ios
    else
        echo "   ✅ iOS déjà configuré"
    fi
else
    echo "   ⚠️  iOS nécessite un Mac - skip"
fi

echo ""
echo "3️⃣ Synchronisation des assets..."
npx cap sync

echo ""
echo "✅ Préparation terminée !"
echo ""
echo "📱 Prochaines étapes :"
echo "   • Android: cd android && ./gradlew bundleRelease"
echo "   • iOS: npx cap open ios (sur Mac uniquement)"
echo ""
echo "📖 Guide complet: /app/MOBILE_DEPLOYMENT_GUIDE.md"
