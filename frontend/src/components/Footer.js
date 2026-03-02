import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Instagram, 
  Youtube, 
  Mail, 
  MapPin,
  Phone,
  Apple,
  Smartphone
} from 'lucide-react';

const Footer = () => {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: isFr ? 'Accueil' : 'Home', path: '/' },
    { name: isFr ? 'Programmes' : 'Programs', path: '/workouts' },
    { name: isFr ? 'Nutrition' : 'Nutrition', path: '/supplements' },
    { name: isFr ? 'Tarifs' : 'Pricing', path: '/pricing' }
  ];

  const supportLinks = [
    { name: 'FAQ', path: '/#faq' },
    { name: isFr ? 'Contact' : 'Contact', path: 'mailto:support@fitmaxpro.com' },
    { name: isFr ? 'Conditions d\'utilisation' : 'Terms of Service', path: '#' },
    { name: isFr ? 'Politique de confidentialité' : 'Privacy Policy', path: '#' }
  ];

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#27272a]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-8 h-8 text-[#EF4444]" />
              <span 
                className="text-2xl font-bold"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                FITMAXPRO
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              {isFr 
                ? 'Transformez votre corps avec des programmes professionnels de musculation et nutrition.'
                : 'Transform your body with professional bodybuilding and nutrition programs.'}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com/fitmaxpro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-[#121212] rounded-lg hover:bg-[#EF4444] transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
              <a 
                href="https://youtube.com/@fitmaxpro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-[#121212] rounded-lg hover:bg-[#EF4444] transition-colors group"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {isFr ? 'LIENS RAPIDES' : 'QUICK LINKS'}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {isFr ? 'SUPPORT' : 'SUPPORT'}
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link, idx) => (
                <li key={idx}>
                  {link.path.startsWith('mailto:') ? (
                    <a 
                      href={link.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link 
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Apps */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {isFr ? 'TÉLÉCHARGER' : 'DOWNLOAD'}
            </h3>
            
            {/* App Store Buttons */}
            <div className="space-y-3 mb-6">
              <a 
                href="#"
                className="flex items-center gap-3 bg-[#121212] border border-[#27272a] rounded-lg px-4 py-2 hover:border-white/30 transition-colors"
              >
                <Apple className="w-6 h-6" />
                <div>
                  <p className="text-xs text-gray-400">{isFr ? 'Télécharger sur' : 'Download on'}</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </a>
              <a 
                href="#"
                className="flex items-center gap-3 bg-[#121212] border border-[#27272a] rounded-lg px-4 py-2 hover:border-white/30 transition-colors"
              >
                <Smartphone className="w-6 h-6" />
                <div>
                  <p className="text-xs text-gray-400">{isFr ? 'Disponible sur' : 'Get it on'}</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </a>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <a 
                href="mailto:support@fitmaxpro.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                support@fitmaxpro.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} FitMaxPro. {isFr ? 'Tous droits réservés.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-xs">
                {isFr ? 'Paiements sécurisés par' : 'Secure payments by'}
              </span>
              <div className="flex items-center gap-2">
                <div className="bg-[#121212] border border-[#27272a] rounded px-2 py-1">
                  <span className="text-xs font-bold text-[#6772E5]">stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
