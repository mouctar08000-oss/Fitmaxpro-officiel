import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Target, Pill, TrendingUp } from 'lucide-react';
import { Button } from './components/ui/button';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1634042341465-f08e0d10a670?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
        }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            data-testid="hero-title"
          >
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              data-testid="get-started-btn"
              onClick={() => navigate('/pricing')}
              className="bg-[#FAFAFA] text-[#09090b] hover:bg-white px-8 py-6 text-lg font-bold rounded-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1"
            >
              {t('hero.cta')}
            </Button>
            <Button 
              data-testid="login-btn"
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#09090b] px-8 py-6 text-lg font-bold rounded-sm transition-all hover:-translate-y-1"
            >
              {t('hero.login')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Tetris Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-4xl sm:text-5xl font-bold text-center mb-16"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            data-testid="features-title"
          >
            {t('features.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Mass Gain - Large */}
            <div 
              className="md:col-span-7 bg-[#121212] border border-[#27272a] p-8 rounded-md hover:border-white/20 hover:bg-[#18181b] transition-colors group"
              data-testid="feature-mass-gain"
            >
              <div 
                className="h-64 mb-6 rounded-md overflow-hidden"
                style={{
                  backgroundImage: 'url(https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#EF4444] rounded-sm">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {t('features.mass.title')}
                </h3>
              </div>
              <p className="text-gray-400">{t('features.mass.desc')}</p>
            </div>

            {/* Weight Loss - Medium */}
            <div 
              className="md:col-span-5 bg-[#121212] border border-[#27272a] p-8 rounded-md hover:border-white/20 hover:bg-[#18181b] transition-colors group"
              data-testid="feature-weight-loss"
            >
              <div 
                className="h-64 mb-6 rounded-md overflow-hidden"
                style={{
                  backgroundImage: 'url(https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#3B82F6] rounded-sm">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {t('features.loss.title')}
                </h3>
              </div>
              <p className="text-gray-400">{t('features.loss.desc')}</p>
            </div>

            {/* Supplements - Medium */}
            <div 
              className="md:col-span-5 bg-[#121212] border border-[#27272a] p-8 rounded-md hover:border-white/20 hover:bg-[#18181b] transition-colors group"
              data-testid="feature-supplements"
            >
              <div 
                className="h-48 mb-6 rounded-md overflow-hidden"
                style={{
                  backgroundImage: 'url(https://images.pexels.com/photos/15120889/pexels-photo-15120889.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#10B981] rounded-sm">
                  <Pill className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {t('features.supplements.title')}
                </h3>
              </div>
              <p className="text-gray-400">{t('features.supplements.desc')}</p>
            </div>

            {/* All Levels - Large */}
            <div 
              className="md:col-span-7 bg-[#121212] border border-[#27272a] p-8 rounded-md hover:border-white/20 hover:bg-[#18181b] transition-colors group"
              data-testid="feature-all-levels"
            >
              <div 
                className="h-48 mb-6 rounded-md overflow-hidden"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1668260990796-3855d0efa823?crop=entropy&cs=srgb&fm=jpg&q=85)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#EAB308] rounded-sm">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {t('features.levels.title')}
                </h3>
              </div>
              <p className="text-gray-400">{t('features.levels.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-8"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            PRÊT À COMMENCER?
          </h2>
          <Button 
            data-testid="cta-pricing-btn"
            onClick={() => navigate('/pricing')}
            className="bg-[#FAFAFA] text-[#09090b] hover:bg-white px-12 py-6 text-xl font-bold rounded-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all hover:-translate-y-1"
          >
            VOIR LES TARIFS
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;