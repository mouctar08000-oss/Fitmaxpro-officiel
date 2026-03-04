import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import Navigation from '../components/Navigation';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Email envoyé !');
    } catch (error) {
      console.error('Forgot password error:', error);
      // Show success even if email doesn't exist (security)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-[#121212] border border-[#27272a] p-8 rounded-md">
            {!sent ? (
              <>
                <div className="text-center mb-8">
                  <h1 
                    className="text-3xl font-bold mb-2"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Mot de passe oublié ?
                  </h1>
                  <p className="text-gray-400">
                    Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      type="email"
                      placeholder="Votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-b border-white/20 rounded-none focus:border-white focus:ring-0 px-0"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold py-6 rounded-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Email envoyé !</h2>
                <p className="text-gray-400 mb-6">
                  Si un compte existe avec l'email <span className="text-white font-bold">{email}</span>, 
                  vous recevrez un lien pour réinitialiser votre mot de passe.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Pensez à vérifier vos spams si vous ne voyez pas l'email.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
