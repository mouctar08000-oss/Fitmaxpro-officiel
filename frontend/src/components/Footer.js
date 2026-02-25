import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dumbbell } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#121212] border-t border-[#27272a] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-[#EF4444]" />
            <span 
              className="text-2xl font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              FITMAXPRO
            </span>
          </div>
          
          <p className="text-gray-400 text-center">
            {t('footer.tagline')}
          </p>
          
          <p className="text-gray-500 text-sm">
            © {currentYear} FitMaxPro. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;