import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Target, 
  Pill, 
  TrendingUp, 
  Play, 
  Users, 
  Award, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Clock,
  Heart,
  Shield,
  Smartphone
} from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isFr = i18n.language?.startsWith('fr');
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { value: '50+', label: isFr ? 'Programmes' : 'Programs', icon: Dumbbell },
    { value: '1000+', label: isFr ? 'Exercices' : 'Exercises', icon: Zap },
    { value: '4', label: isFr ? 'Plans Nutrition' : 'Nutrition Plans', icon: Pill },
    { value: '24/7', label: isFr ? 'Support' : 'Support', icon: Heart }
  ];

  const steps = [
    {
      number: '01',
      title: isFr ? 'Créez votre compte' : 'Create your account',
      description: isFr 
        ? 'Inscription gratuite en quelques secondes. Commencez avec 7 jours d\'essai gratuit.' 
        : 'Free registration in seconds. Start with 7-day free trial.',
      icon: Users
    },
    {
      number: '02',
      title: isFr ? 'Choisissez votre programme' : 'Choose your program',
      description: isFr 
        ? 'Prise de masse, perte de poids, jambes & fessiers - trouvez votre objectif.' 
        : 'Muscle gain, weight loss, legs & glutes - find your goal.',
      icon: Target
    },
    {
      number: '03',
      title: isFr ? 'Suivez vos séances' : 'Follow your sessions',
      description: isFr 
        ? 'Vidéos HD, instructions détaillées et temps de repos intégrés.' 
        : 'HD videos, detailed instructions and built-in rest timers.',
      icon: Play
    },
    {
      number: '04',
      title: isFr ? 'Transformez-vous' : 'Transform yourself',
      description: isFr 
        ? 'Suivez vos progrès et atteignez vos objectifs fitness.' 
        : 'Track your progress and achieve your fitness goals.',
      icon: Award
    }
  ];

  const testimonials = [
    {
      name: 'Marie L.',
      role: isFr ? 'Membre VIP depuis 6 mois' : 'VIP Member for 6 months',
      text: isFr 
        ? 'FitMaxPro a complètement transformé ma routine fitness. Les programmes sont bien structurés et les vidéos sont très claires. J\'ai perdu 12kg en 4 mois!' 
        : 'FitMaxPro completely transformed my fitness routine. The programs are well structured and the videos are very clear. I lost 12kg in 4 months!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3768722/pexels-photo-3768722.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      name: 'Thomas K.',
      role: isFr ? 'Membre Standard depuis 3 mois' : 'Standard Member for 3 months',
      text: isFr 
        ? 'En tant que débutant, j\'avais besoin d\'un accompagnement clair. FitMaxPro m\'a donné exactement ça. J\'ai pris 8kg de muscle propre!' 
        : 'As a beginner, I needed clear guidance. FitMaxPro gave me exactly that. I gained 8kg of lean muscle!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      name: 'Sophie R.',
      role: isFr ? 'Membre VIP depuis 1 an' : 'VIP Member for 1 year',
      text: isFr 
        ? 'Le programme Spécial Femme est incroyable! Les exercices ciblent exactement ce que je voulais. Mes jambes et fessiers sont transformés.' 
        : 'The Women\'s Special program is incredible! The exercises target exactly what I wanted. My legs and glutes are transformed.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    }
  ];

  const faqs = [
    {
      question: isFr ? 'Puis-je annuler mon abonnement à tout moment?' : 'Can I cancel my subscription anytime?',
      answer: isFr 
        ? 'Oui, les abonnements mensuels peuvent être annulés à tout moment. L\'abonnement annuel offre une réduction mais engage pour 12 mois.' 
        : 'Yes, monthly subscriptions can be canceled anytime. Annual subscription offers a discount but commits for 12 months.'
    },
    {
      question: isFr ? 'Quel équipement me faut-il?' : 'What equipment do I need?',
      answer: isFr 
        ? 'La plupart de nos programmes peuvent être réalisés avec des haltères basiques. Certains programmes avancés nécessitent un accès à une salle de sport.' 
        : 'Most of our programs can be done with basic dumbbells. Some advanced programs require gym access.'
    },
    {
      question: isFr ? 'Les programmes conviennent-ils aux débutants?' : 'Are programs suitable for beginners?',
      answer: isFr 
        ? 'Absolument! Nous avons des programmes pour tous les niveaux: Débutant, Amateur et Pro. Chaque exercice inclut des instructions détaillées et des vidéos.' 
        : 'Absolutely! We have programs for all levels: Beginner, Intermediate and Pro. Each exercise includes detailed instructions and videos.'
    },
    {
      question: isFr ? 'Comment fonctionne l\'essai gratuit?' : 'How does the free trial work?',
      answer: isFr 
        ? 'Vous bénéficiez de 7 jours d\'accès complet à votre plan choisi. Vous ne serez facturé qu\'après la période d\'essai, et vous pouvez annuler à tout moment.' 
        : 'You get 7 days of full access to your chosen plan. You will only be charged after the trial period, and you can cancel anytime.'
    },
    {
      question: isFr ? 'L\'application est-elle disponible sur mobile?' : 'Is the app available on mobile?',
      answer: isFr 
        ? 'Oui! FitMaxPro est disponible sur iOS (App Store) et Android (Google Play). Emportez vos séances partout avec vous.' 
        : 'Yes! FitMaxPro is available on iOS (App Store) and Android (Google Play). Take your workouts anywhere with you.'
    }
  ];

  const programs = [
    {
      title: isFr ? 'Prise de Masse' : 'Muscle Gain',
      description: isFr ? 'Développez votre masse musculaire' : 'Build your muscle mass',
      image: 'https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=600',
      workouts: 15,
      color: 'bg-[#EF4444]'
    },
    {
      title: isFr ? 'Perte de Poids' : 'Weight Loss',
      description: isFr ? 'Brûlez les graisses efficacement' : 'Burn fat effectively',
      image: 'https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=600',
      workouts: 12,
      color: 'bg-[#3B82F6]'
    },
    {
      title: isFr ? 'Jambes & Fessiers' : 'Legs & Glutes',
      description: isFr ? 'Sculptez le bas du corps' : 'Sculpt your lower body',
      image: 'https://images.pexels.com/photos/6456149/pexels-photo-6456149.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=600',
      workouts: 8,
      color: 'bg-[#10B981]'
    },
    {
      title: isFr ? 'Spécial Femme' : 'Women\'s Special',
      description: isFr ? 'Programmes adaptés aux femmes' : 'Programs designed for women',
      image: 'https://images.pexels.com/photos/6456300/pexels-photo-6456300.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=600',
      workouts: 9,
      color: 'bg-[#EC4899]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/6389076/pexels-photo-6389076.jpeg?auto=compress&cs=tinysrgb&dpr=2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/50 via-transparent to-[#09090b]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-flex items-center gap-2 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-[#EF4444]" />
            <span className="text-sm text-[#EF4444] font-medium">
              {isFr ? '7 jours d\'essai gratuit' : '7-day free trial'}
            </span>
          </div>
          
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              data-testid="get-started-btn"
              onClick={() => navigate('/pricing')}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-6 text-lg font-bold rounded-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all hover:-translate-y-1"
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

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center p-4 bg-[#121212]/80 backdrop-blur-sm border border-[#27272a] rounded-lg">
                <stat.icon className="w-6 h-6 text-[#EF4444] mb-2" />
                <span className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{stat.value}</span>
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {isFr ? 'COMMENT ÇA MARCHE' : 'HOW IT WORKS'}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {isFr 
                ? 'Commencez votre transformation en 4 étapes simples' 
                : 'Start your transformation in 4 simple steps'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="relative group"
                data-testid={`step-${idx + 1}`}
              >
                <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 hover:border-[#EF4444]/50 transition-all hover:-translate-y-2">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl font-bold text-[#EF4444]/20" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {step.number}
                    </span>
                    <div className="p-3 bg-[#EF4444]/10 rounded-lg">
                      <step.icon className="w-6 h-6 text-[#EF4444]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#27272a]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="features-title"
            >
              {t('features.title')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {isFr 
                ? 'Des programmes adaptés à chaque objectif' 
                : 'Programs adapted to every goal'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, idx) => (
              <div 
                key={idx}
                className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-2 cursor-pointer"
                onClick={() => navigate('/workouts')}
                data-testid={`program-${idx}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                  <div className={`absolute top-4 left-4 ${program.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {program.workouts} {isFr ? 'séances' : 'workouts'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {program.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{program.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/workouts')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#09090b] px-8 py-4 font-bold"
            >
              {isFr ? 'VOIR TOUS LES PROGRAMMES' : 'VIEW ALL PROGRAMS'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {isFr ? 'POURQUOI FITMAXPRO?' : 'WHY FITMAXPRO?'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121212] border border-[#27272a] p-8 rounded-lg hover:border-[#EF4444]/30 transition-colors">
              <div className="p-4 bg-[#EF4444]/10 rounded-lg w-fit mb-6">
                <Play className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {isFr ? 'Vidéos HD' : 'HD Videos'}
              </h3>
              <p className="text-gray-400">
                {isFr 
                  ? 'Chaque exercice accompagné de vidéos professionnelles avec instructions détaillées.' 
                  : 'Every exercise with professional videos and detailed instructions.'}
              </p>
            </div>
            
            <div className="bg-[#121212] border border-[#27272a] p-8 rounded-lg hover:border-[#3B82F6]/30 transition-colors">
              <div className="p-4 bg-[#3B82F6]/10 rounded-lg w-fit mb-6">
                <Clock className="w-8 h-8 text-[#3B82F6]" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {isFr ? 'Temps de Repos' : 'Rest Timers'}
              </h3>
              <p className="text-gray-400">
                {isFr 
                  ? 'Minuteries intégrées pour optimiser votre récupération entre les séries.' 
                  : 'Built-in timers to optimize your recovery between sets.'}
              </p>
            </div>
            
            <div className="bg-[#121212] border border-[#27272a] p-8 rounded-lg hover:border-[#10B981]/30 transition-colors">
              <div className="p-4 bg-[#10B981]/10 rounded-lg w-fit mb-6">
                <Smartphone className="w-8 h-8 text-[#10B981]" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {isFr ? 'Multi-Plateforme' : 'Multi-Platform'}
              </h3>
              <p className="text-gray-400">
                {isFr 
                  ? 'Disponible sur Web, iOS et Android. Emportez vos séances partout.' 
                  : 'Available on Web, iOS and Android. Take your workouts anywhere.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {isFr ? 'ILS ONT TRANSFORMÉ LEUR CORPS' : 'THEY TRANSFORMED THEIR BODY'}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {isFr 
                ? 'Découvrez les témoignages de nos membres' 
                : 'Discover testimonials from our members'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="bg-[#121212] border border-[#27272a] rounded-lg p-6 hover:border-[#EF4444]/30 transition-colors"
                data-testid={`testimonial-${idx}`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#EAB308] text-[#EAB308]" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {isFr ? 'QUESTIONS FRÉQUENTES' : 'FREQUENTLY ASKED QUESTIONS'}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden"
                data-testid={`faq-${idx}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#1a1a1a] transition-colors"
                >
                  <span className="font-bold pr-4">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-400 animate-in slide-in-from-top-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/8874917/pexels-photo-8874917.jpeg?auto=compress&cs=tinysrgb&dpr=2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#10B981]/20 border border-[#10B981]/30 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm text-[#10B981] font-medium">
              {isFr ? 'Satisfait ou remboursé sous 30 jours' : '30-day money-back guarantee'}
            </span>
          </div>
          
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {isFr ? 'PRÊT À TRANSFORMER VOTRE CORPS?' : 'READY TO TRANSFORM YOUR BODY?'}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {isFr 
              ? 'Rejoignez des milliers de membres et commencez votre transformation dès aujourd\'hui. 7 jours d\'essai gratuit inclus.'
              : 'Join thousands of members and start your transformation today. 7-day free trial included.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              data-testid="cta-pricing-btn"
              onClick={() => navigate('/pricing')}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-12 py-6 text-xl font-bold rounded-sm hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all hover:-translate-y-1"
            >
              {isFr ? 'COMMENCER GRATUITEMENT' : 'START FOR FREE'}
            </Button>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            {isFr 
              ? 'Aucune carte de crédit requise pour l\'essai gratuit' 
              : 'No credit card required for free trial'}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
