import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button.jsx';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  const pollPaymentStatus = async (sessionId, attempt = 0) => {
    if (attempt >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(
        `${API}/payments/status/${sessionId}`,
        { withCredentials: true }
      );

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        await checkAuth();
      } else if (response.data.status === 'expired') {
        setStatus('expired');
      } else {
        setTimeout(() => {
          setAttempts(attempt + 1);
          pollPaymentStatus(sessionId, attempt + 1);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      navigate('/pricing');
      return;
    }

    pollPaymentStatus(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
            <h1 
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Vérification du paiement...
            </h1>
            <p className="text-gray-400">Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" data-testid="success-icon" />
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="success-title"
            >
              {t('success.title')}
            </h1>
            <p className="text-gray-400 mb-8 text-lg">{t('success.message')}</p>
            <Button
              data-testid="goto-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              className="bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold px-8 py-6 rounded-sm hover:-translate-y-1 transition-all"
            >
              {t('success.dashboard')}
            </Button>
          </>
        )}

        {(status === 'error' || status === 'timeout' || status === 'expired') && (
          <>
            <div className="text-red-500 text-5xl mb-6">❌</div>
            <h1 
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Erreur de paiement
            </h1>
            <p className="text-gray-400 mb-8">
              {status === 'timeout' && 'La vérification du paiement a pris trop de temps.'}
              {status === 'expired' && 'La session de paiement a expiré.'}
              {status === 'error' && 'Une erreur est survenue lors de la vérification.'}
            </p>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold px-8 py-6 rounded-sm"
            >
              Retour aux tarifs
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;