import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import Navigation from '../components/Navigation';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignup = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        },
        { withCredentials: true }
      );

      // Store token in localStorage for persistent login
      if (response.data.session_token) {
        localStorage.setItem('session_token', response.data.session_token);
      }
      
      // Store user data in localStorage for persistence
      if (response.data.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      setUser(response.data.user);
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.detail || 'Erreur lors de la création du compte';
      toast.error(message);
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
            <div className="text-center mb-8">
              <h1 
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                data-testid="signup-title"
              >
                Créer un compte
              </h1>
              <p className="text-gray-400">Rejoignez FitMaxPro aujourd'hui</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  data-testid="name-input"
                  type="text"
                  name="name"
                  placeholder="Nom complet"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-transparent border-b border-white/20 rounded-none focus:border-white focus:ring-0 px-0"
                />
              </div>
              
              <div>
                <Input
                  data-testid="email-input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-transparent border-b border-white/20 rounded-none focus:border-white focus:ring-0 px-0"
                />
              </div>
              
              <div className="relative">
                <Input
                  data-testid="password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mot de passe (min. 6 caractères)"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-transparent border-b border-white/20 rounded-none focus:border-white focus:ring-0 px-0 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  data-testid="confirm-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmer le mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-transparent border-b border-white/20 rounded-none focus:border-white focus:ring-0 px-0 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2"
                  data-testid="toggle-confirm-password-visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button 
                data-testid="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold py-6 rounded-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#27272a]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#121212] text-gray-400">OU</span>
                </div>
              </div>

              <Button
                data-testid="google-signup-btn"
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full mt-6 border-white text-white hover:bg-white hover:text-[#09090b] font-bold py-6 rounded-sm transition-all hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                S'inscrire avec Google
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Déjà un compte ?{' '}
                <Link 
                  to="/login" 
                  className="text-white hover:underline font-bold"
                  data-testid="login-link"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
