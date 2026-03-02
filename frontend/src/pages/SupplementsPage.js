import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Pill, Play, X, Utensils, Flame, ChefHat, Clock, Users, ChevronRight, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SupplementsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  const [activeRecipe, setActiveRecipe] = useState(null);
  const isFr = i18n.language?.startsWith('fr');

  const fetchSupplements = async () => {
    setLoading(true);
    try {
      // Normalize language to just 'fr' or 'en'
      const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
      const response = await axios.get(`${API}/supplements?language=${lang}`);
      setSupplements(response.data);
    } catch (error) {
      console.error('Error fetching supplements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const getTypeColor = (type) => {
    return type === 'mass_gain' ? '#EF4444' : '#3B82F6';
  };

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-5xl font-bold mb-8"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            data-testid="supplements-title"
          >
            {t('supplements.title')}
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {supplements.map((supplement) => (
                <div
                  key={supplement.supplement_id}
                  data-testid={`supplement-card-${supplement.supplement_id}`}
                  className="bg-[#121212] border border-[#27272a] rounded-md overflow-hidden"
                >
                  {/* Header avec image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={supplement.image_url} 
                      alt={supplement.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Pill 
                          className="w-8 h-8"
                          style={{ color: getTypeColor(supplement.program_type) }}
                        />
                        <h2 
                          className="text-3xl font-bold"
                          style={{ 
                            fontFamily: "'Barlow Condensed', sans-serif",
                            color: '#fff'
                          }}
                        >
                          {supplement.title}
                        </h2>
                      </div>
                      <p className="text-gray-300">{supplement.description}</p>
                    </div>
                    {supplement.video_url && (
                      <button
                        data-testid={`play-supplement-video-${supplement.supplement_id}`}
                        onClick={() => setActiveVideo(supplement.video_url)}
                        className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-[#27272a]">
                    <div className="flex">
                      <button
                        data-testid={`tab-nutrients-${supplement.supplement_id}`}
                        onClick={() => setActiveTab({ ...activeTab, [supplement.supplement_id]: 'nutrients' })}
                        className={`flex-1 px-6 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                          (activeTab[supplement.supplement_id] || 'nutrients') === 'nutrients'
                            ? 'bg-[#09090b] text-white border-b-2'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        style={{ 
                          borderColor: (activeTab[supplement.supplement_id] || 'nutrients') === 'nutrients' 
                            ? getTypeColor(supplement.program_type) 
                            : 'transparent' 
                        }}
                      >
                        <Pill className="w-4 h-4" />
                        {i18n.language === 'fr' ? 'Suppléments' : 'Supplements'}
                      </button>
                      {supplement.meals && supplement.meals.length > 0 && (
                        <button
                          data-testid={`tab-meals-${supplement.supplement_id}`}
                          onClick={() => setActiveTab({ ...activeTab, [supplement.supplement_id]: 'meals' })}
                          className={`flex-1 px-6 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                            activeTab[supplement.supplement_id] === 'meals'
                              ? 'bg-[#09090b] text-white border-b-2'
                              : 'text-gray-400 hover:text-white'
                          }`}
                          style={{ 
                            borderColor: activeTab[supplement.supplement_id] === 'meals' 
                              ? getTypeColor(supplement.program_type) 
                              : 'transparent' 
                          }}
                        >
                          <Utensils className="w-4 h-4" />
                          {i18n.language === 'fr' ? 'Repas' : 'Meals'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Nutrients Tab */}
                    {(activeTab[supplement.supplement_id] || 'nutrients') === 'nutrients' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {supplement.nutrients.map((nutrient, index) => (
                          <div
                            key={index}
                            data-testid={`nutrient-${index}`}
                            className="bg-[#09090b] border border-[#27272a] rounded-md overflow-hidden group"
                          >
                            {nutrient.image_url && (
                              <div className="relative h-32 overflow-hidden">
                                <img 
                                  src={nutrient.image_url} 
                                  alt={nutrient.name}
                                  className="w-full h-full object-cover"
                                />
                                {nutrient.video_url && (
                                  <button
                                    data-testid={`play-nutrient-video-${index}`}
                                    onClick={() => setActiveVideo(nutrient.video_url)}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                      <Play className="w-5 h-5 text-[#09090b] ml-0.5" fill="currentColor" />
                                    </div>
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg">{nutrient.name}</h4>
                                <span 
                                  className="text-sm font-bold px-2 py-1 rounded-sm"
                                  style={{ 
                                    backgroundColor: getTypeColor(supplement.program_type),
                                    color: '#fff'
                                  }}
                                >
                                  {nutrient.dosage}
                                </span>
                              </div>
                              {nutrient.description && (
                                <p className="text-sm text-gray-400 mb-2">{nutrient.description}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                <span className="text-gray-400">{t('supplements.timing')}:</span> {nutrient.timing}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Meals Tab */}
                    {activeTab[supplement.supplement_id] === 'meals' && supplement.meals && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {supplement.meals.map((meal, index) => (
                          <div
                            key={index}
                            data-testid={`meal-${index}`}
                            className="bg-[#09090b] border border-[#27272a] rounded-md overflow-hidden group"
                          >
                            {meal.image_url && (
                              <div className="relative h-40 overflow-hidden">
                                <img 
                                  src={meal.image_url} 
                                  alt={meal.name}
                                  className="w-full h-full object-cover"
                                />
                                {meal.video_url && (
                                  <button
                                    data-testid={`play-meal-video-${index}`}
                                    onClick={() => setActiveVideo(meal.video_url)}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                      <Play className="w-6 h-6 text-[#09090b] ml-0.5" fill="currentColor" />
                                    </div>
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="font-bold text-lg mb-2">{meal.name}</h4>
                              <p className="text-sm text-gray-400 mb-3">{meal.description}</p>
                              
                              {/* Macros */}
                              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                                <div className="bg-[#121212] p-2 rounded-sm">
                                  <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                                  <span className="text-xs text-gray-400 block">Cal</span>
                                  <span className="font-bold">{meal.calories}</span>
                                </div>
                                <div className="bg-[#121212] p-2 rounded-sm">
                                  <span className="text-xs text-gray-400 block">Prot</span>
                                  <span className="font-bold text-green-500">{meal.proteins}g</span>
                                </div>
                                <div className="bg-[#121212] p-2 rounded-sm">
                                  <span className="text-xs text-gray-400 block">Carb</span>
                                  <span className="font-bold text-blue-500">{meal.carbs}g</span>
                                </div>
                                <div className="bg-[#121212] p-2 rounded-sm">
                                  <span className="text-xs text-gray-400 block">Fat</span>
                                  <span className="font-bold text-yellow-500">{meal.fats}g</span>
                                </div>
                              </div>

                              {/* Recipe Button */}
                              {meal.recipe && (
                                <Button
                                  data-testid={`recipe-btn-${index}`}
                                  onClick={() => setActiveRecipe({ ...meal.recipe, mealName: meal.name, mealImage: meal.image_url })}
                                  className="w-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white font-bold rounded-sm flex items-center justify-center gap-2"
                                >
                                  <ChefHat className="w-4 h-4" />
                                  {isFr ? 'Voir la recette' : 'View Recipe'}
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Subscribe Button */}
                    <div className="mt-6 pt-6 border-t border-[#27272a]">
                      <Button
                        data-testid={`subscribe-supplement-btn-${supplement.supplement_id}`}
                        onClick={() => navigate('/pricing')}
                        className="w-full font-bold py-6 rounded-sm hover:-translate-y-1 transition-all"
                        style={{
                          backgroundColor: getTypeColor(supplement.program_type),
                          color: '#fff'
                        }}
                        disabled={user?.subscription_tier === 'supplements' || user?.subscription_tier === 'vip'}
                      >
                        {user?.subscription_tier === 'supplements' || user?.subscription_tier === 'vip' 
                          ? (i18n.language === 'fr' ? 'Déjà abonné' : 'Already subscribed')
                          : t('supplements.subscribe')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Vidéo */}
          {activeVideo && (
            <div 
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setActiveVideo(null)}
            >
              <div 
                className="relative w-full max-w-4xl bg-[#121212] rounded-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  data-testid="close-video-modal"
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="aspect-video">
                  <iframe
                    src={`${activeVideo}?autoplay=1`}
                    title="Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Recette */}
          {activeRecipe && (
            <div 
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setActiveRecipe(null)}
            >
              <div 
                className="relative w-full max-w-2xl bg-[#121212] rounded-lg overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header avec image */}
                <div className="relative">
                  {activeRecipe.mealImage && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={activeRecipe.mealImage} 
                        alt={activeRecipe.mealName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                    </div>
                  )}
                  <button
                    data-testid="close-recipe-modal"
                    onClick={() => setActiveRecipe(null)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center gap-2 text-[#EF4444] mb-2">
                      <ChefHat className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase">{isFr ? 'Recette' : 'Recipe'}</span>
                    </div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {activeRecipe.mealName}
                    </h2>
                  </div>
                </div>

                {/* Info temps et portions */}
                <div className="px-6 py-4 border-b border-[#27272a]">
                  <div className="flex flex-wrap gap-4">
                    {activeRecipe.prep_time && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">
                          <span className="text-gray-500">{isFr ? 'Préparation:' : 'Prep:'}</span>{' '}
                          <span className="text-white font-medium">{activeRecipe.prep_time}</span>
                        </span>
                      </div>
                    )}
                    {activeRecipe.cook_time && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-sm">
                          <span className="text-gray-500">{isFr ? 'Cuisson:' : 'Cook:'}</span>{' '}
                          <span className="text-white font-medium">{activeRecipe.cook_time}</span>
                        </span>
                      </div>
                    )}
                    {activeRecipe.servings && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-sm">
                          <span className="text-gray-500">{isFr ? 'Portions:' : 'Servings:'}</span>{' '}
                          <span className="text-white font-medium">{activeRecipe.servings}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu de la recette */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Ingrédients */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#EF4444]">
                      <Utensils className="w-5 h-5" />
                      {isFr ? 'Ingrédients' : 'Ingredients'}
                    </h3>
                    <ul className="space-y-2">
                      {activeRecipe.ingredients?.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-[#EF4444] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-300">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Étapes */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#EF4444]">
                      <BookOpen className="w-5 h-5" />
                      {isFr ? 'Préparation' : 'Instructions'}
                    </h3>
                    <ol className="space-y-4">
                      {activeRecipe.steps?.map((step, idx) => (
                        <li key={idx} className="flex gap-4">
                          <span className="w-8 h-8 bg-[#EF4444] rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            {idx + 1}
                          </span>
                          <p className="text-gray-300 pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#27272a] bg-[#09090b]">
                  <Button
                    onClick={() => setActiveRecipe(null)}
                    className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-sm"
                  >
                    {isFr ? 'Fermer' : 'Close'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplementsPage;