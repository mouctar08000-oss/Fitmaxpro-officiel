import React, { useState, useEffect } from 'react';
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
  Smartphone,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Custom icons for social platforms
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SnapchatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.809-.329-1.24-.719-1.24-1.138 0-.359.27-.689.72-.854.12-.044.298-.074.494-.074.12 0 .313.029.464.104.39.18.748.3 1.033.3.199 0 .33-.06.405-.105l-.03-.51c-.015-.06-.029-.12-.029-.18-.105-1.628-.225-3.654.304-4.847C7.865 1.054 11.217.793 12.206.793z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const Footer = () => {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await axios.get(`${API}/social-links`);
        setSocialLinks(response.data.links || {});
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    };
    fetchSocialLinks();
  }, []);

  const quickLinks = [
    { name: isFr ? 'Accueil' : 'Home', path: '/' },
    { name: isFr ? 'Programmes' : 'Programs', path: '/workouts' },
    { name: isFr ? 'Nutrition' : 'Nutrition', path: '/supplements' },
    { name: isFr ? 'Tarifs' : 'Pricing', path: '/pricing' },
    { name: isFr ? 'Avis' : 'Reviews', path: '/reviews' }
  ];

  const supportLinks = [
    { name: 'FAQ', path: '/#faq' },
    { name: isFr ? 'Contact Coach' : 'Contact Coach', path: '/messages' },
    { name: isFr ? 'Conditions d\'utilisation' : 'Terms of Service', path: '#' },
    { name: isFr ? 'Politique de confidentialité' : 'Privacy Policy', path: '#' }
  ];

  const socialPlatforms = [
    { key: 'instagram', icon: Instagram, color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500', label: 'Instagram' },
    { key: 'youtube', icon: Youtube, color: 'hover:bg-red-600', label: 'YouTube' },
    { key: 'tiktok', icon: TikTokIcon, color: 'hover:bg-gradient-to-br hover:from-cyan-400 hover:to-pink-500', label: 'TikTok' },
    { key: 'snapchat', icon: SnapchatIcon, color: 'hover:bg-yellow-400', label: 'Snapchat' },
    { key: 'facebook', icon: FacebookIcon, color: 'hover:bg-blue-600', label: 'Facebook' },
    { key: 'twitter', icon: TwitterIcon, color: 'hover:bg-black', label: 'X (Twitter)' },
    { key: 'whatsapp', icon: WhatsAppIcon, color: 'hover:bg-green-500', label: 'WhatsApp' },
    { key: 'telegram', icon: TelegramIcon, color: 'hover:bg-blue-500', label: 'Telegram' }
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
            <div className="flex items-center gap-3 flex-wrap">
              {socialPlatforms.map(({ key, icon: Icon, color, label }) => {
                const url = socialLinks[key];
                if (!url) return null;
                return (
                  <a 
                    key={key}
                    href={url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-3 bg-[#1a1a1a] rounded-xl ${color} transition-all duration-300 group hover:scale-110 hover:shadow-lg`}
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
              {Object.keys(socialLinks).length === 0 && (
                <p className="text-gray-500 text-xs">{isFr ? 'Réseaux sociaux bientôt' : 'Social media coming soon'}</p>
              )}
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
              <Link 
                to="/messages"
                className="flex items-center gap-2 text-[#EF4444] hover:text-white transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                {isFr ? 'Contacter le Coach' : 'Contact Coach'}
              </Link>
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
