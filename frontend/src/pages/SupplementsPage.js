import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Pill } from 'lucide-react';
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

  const fetchSupplements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/supplements?language=${i18n.language}`);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {supplements.map((supplement) => (
                <div
                  key={supplement.supplement_id}
                  data-testid={`supplement-card-${supplement.supplement_id}`}
                  className="bg-[#121212] border border-[#27272a] rounded-md p-8 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Pill 
                      className="w-8 h-8"
                      style={{ color: getTypeColor(supplement.program_type) }}
                    />
                    <h2 
                      className="text-3xl font-bold"
                      style={{ 
                        fontFamily: "'Barlow Condensed', sans-serif",
                        color: getTypeColor(supplement.program_type)
                      }}
                    >
                      {supplement.title}
                    </h2>
                  </div>
                  
                  <p className="text-gray-400 mb-6">{supplement.description}</p>

                  <div className="space-y-4 mb-6">
                    <h3 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      Nutiments inclus:
                    </h3>
                    {supplement.nutrients.map((nutrient, index) => (
                      <div
                        key={index}
                        data-testid={`nutrient-${index}`}
                        className="bg-[#09090b] border border-[#27272a] p-4 rounded-sm"
                      >
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
                        <p className="text-sm text-gray-400">
                          {t('supplements.timing')}: {nutrient.timing}
                        </p>
                      </div>
                    ))}
                  </div>

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
                      ? 'Déjà abonné' 
                      : t('supplements.subscribe')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplementsPage;