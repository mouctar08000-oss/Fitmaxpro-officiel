import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button.jsx';
import { Menu, X, Dumbbell, LogOut, User, Globe, Settings, TrendingUp, MessageCircle, Bell } from 'lucide-react';

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
            data-testid="logo"
          >
            <Dumbbell className="w-8 h-8 text-[#EF4444]" />
            <span 
              className="text-2xl font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              FITMAXPRO
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              data-testid="nav-home"
              onClick={() => navigate('/')}
              className={`hover:text-white transition-colors ${
                isActive('/') ? 'text-white' : 'text-gray-400'
              }`}
            >
              {t('nav.home')}
            </button>
            
            {user && (
              <>
                <button
                  data-testid="nav-dashboard"
                  onClick={() => navigate('/dashboard')}
                  className={`hover:text-white transition-colors ${
                    isActive('/dashboard') ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {t('nav.dashboard')}
                </button>
                <button
                  data-testid="nav-workouts"
                  onClick={() => navigate('/workouts')}
                  className={`hover:text-white transition-colors ${
                    isActive('/workouts') ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {t('nav.workouts')}
                </button>
                <button
                  data-testid="nav-supplements"
                  onClick={() => navigate('/supplements')}
                  className={`hover:text-white transition-colors ${
                    isActive('/supplements') ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {t('nav.supplements')}
                </button>
                <button
                  data-testid="nav-progress"
                  onClick={() => navigate('/my-progress')}
                  className={`flex items-center gap-1 hover:text-[#EF4444] transition-colors ${
                    isActive('/my-progress') ? 'text-[#EF4444]' : 'text-gray-400'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {i18n.language?.startsWith('fr') ? 'Évolution' : 'Progress'}
                </button>
                <button
                  data-testid="nav-messages"
                  onClick={() => navigate('/messages')}
                  className={`flex items-center gap-1 hover:text-green-400 transition-colors ${
                    isActive('/messages') ? 'text-green-400' : 'text-gray-400'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  {i18n.language?.startsWith('fr') ? 'Coach' : 'Coach'}
                </button>
                <button
                  data-testid="nav-reminders"
                  onClick={() => navigate('/reminders')}
                  className={`flex items-center gap-1 hover:text-yellow-400 transition-colors ${
                    isActive('/reminders') ? 'text-yellow-400' : 'text-gray-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {i18n.language?.startsWith('fr') ? 'Rappels' : 'Reminders'}
                </button>
              </>
            )}
            
            <button
              data-testid="nav-pricing"
              onClick={() => navigate('/pricing')}
              className={`hover:text-white transition-colors ${
                isActive('/pricing') ? 'text-white' : 'text-gray-400'
              }`}
            >
              {t('nav.pricing')}
            </button>

            {/* Language Toggle */}
            <button
              data-testid="language-toggle"
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{i18n.language?.startsWith('fr') ? 'FR' : 'EN'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                {user.subscription_tier === 'vip' && (
                  <button
                    data-testid="nav-admin"
                    onClick={() => navigate('/admin')}
                    className={`flex items-center gap-2 hover:text-white transition-colors ${
                      isActive('/admin') ? 'text-[#EF4444]' : 'text-gray-400'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </button>
                )}
                <button
                  data-testid="nav-profile"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.name}
                </button>
                <Button
                  data-testid="logout-btn"
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <Button
                data-testid="nav-login"
                onClick={() => navigate('/login')}
                className="bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold rounded-sm"
              >
                {t('hero.login')}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            data-testid="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10" data-testid="mobile-menu">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="block w-full text-left text-gray-400 hover:text-white transition-colors"
            >
              {t('nav.home')}
            </button>
            
            {user && (
              <>
                <button
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.dashboard')}
                </button>
                <button
                  onClick={() => { navigate('/workouts'); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.workouts')}
                </button>
                <button
                  onClick={() => { navigate('/supplements'); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.supplements')}
                </button>
                <button
                  onClick={() => { navigate('/my-progress'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left text-[#EF4444] hover:text-white transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  {i18n.language?.startsWith('fr') ? 'Mon Évolution' : 'My Progress'}
                </button>
                <button
                  onClick={() => { navigate('/messages'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left text-green-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {i18n.language?.startsWith('fr') ? 'Contacter Coach' : 'Contact Coach'}
                </button>
                <button
                  onClick={() => { navigate('/reminders'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left text-yellow-400 hover:text-white transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {i18n.language?.startsWith('fr') ? 'Mes Rappels' : 'My Reminders'}
                </button>
              </>
            )}
            
            <button
              onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}
              className="block w-full text-left text-gray-400 hover:text-white transition-colors"
            >
              {t('nav.pricing')}
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{i18n.language === 'fr' ? 'Français' : 'English'}</span>
            </button>

            {user ? (
              <>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-400 mb-2">{user.name}</p>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white hover:text-[#09090b]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="w-full bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold"
              >
                {t('hero.login')}
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;