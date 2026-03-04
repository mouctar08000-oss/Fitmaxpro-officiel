import React from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button.jsx';
import { Download, Share2, Smartphone, QrCode } from 'lucide-react';

const QRCodePage = () => {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/qrcode-fitmaxpro.png';
    link.download = 'FitMaxPro-QRCode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FitMaxPro',
          text: isFr 
            ? 'Découvrez FitMaxPro - Votre coach fitness personnel !' 
            : 'Discover FitMaxPro - Your personal fitness coach!',
          url: window.location.origin
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
      alert(isFr ? 'Lien copié !' : 'Link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EF4444] rounded-full mb-4">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="qrcode-title"
            >
              {isFr ? 'SCANNEZ POUR ACCÉDER' : 'SCAN TO ACCESS'}
            </h1>
            <p className="text-gray-400 text-lg">
              {isFr 
                ? 'Scannez ce QR Code avec votre téléphone pour accéder à FitMaxPro' 
                : 'Scan this QR Code with your phone to access FitMaxPro'}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-8 rounded-lg inline-block mb-8 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <img 
              src="/qrcode-fitmaxpro.png" 
              alt="FitMaxPro QR Code"
              className="w-64 h-64 mx-auto"
              data-testid="qrcode-image"
            />
          </div>

          {/* App Info */}
          <div className="bg-[#121212] border border-[#27272a] rounded-md p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-[#EF4444]" />
              <span className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                FITMAXPRO
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              {isFr 
                ? 'Programmes de musculation professionnels et plans nutritionnels personnalisés' 
                : 'Professional bodybuilding programs and personalized nutrition plans'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-[#EF4444]/20 text-[#EF4444] px-3 py-1 rounded-full text-sm">
                {isFr ? 'Prise de masse' : 'Mass Gain'}
              </span>
              <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 rounded-full text-sm">
                {isFr ? 'Perte de poids' : 'Weight Loss'}
              </span>
              <span className="bg-[#10B981]/20 text-[#10B981] px-3 py-1 rounded-full text-sm">
                {isFr ? 'Nutrition' : 'Nutrition'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              data-testid="download-qr-btn"
              onClick={handleDownload}
              className="bg-[#FAFAFA] text-[#09090b] hover:bg-white font-bold px-8 py-6 rounded-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              {isFr ? 'Télécharger le QR Code' : 'Download QR Code'}
            </Button>
            <Button
              data-testid="share-btn"
              onClick={handleShare}
              variant="outline"
              className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white font-bold px-8 py-6 rounded-sm transition-all"
            >
              <Share2 className="w-5 h-5 mr-2" />
              {isFr ? 'Partager' : 'Share'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-12 text-left bg-[#121212] border border-[#27272a] rounded-md p-6">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {isFr ? 'COMMENT SCANNER ?' : 'HOW TO SCAN?'}
            </h3>
            <ol className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="bg-[#EF4444] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                <span>{isFr ? 'Ouvrez l\'appareil photo de votre téléphone' : 'Open your phone\'s camera'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#EF4444] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                <span>{isFr ? 'Pointez vers le QR Code' : 'Point at the QR Code'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#EF4444] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                <span>{isFr ? 'Cliquez sur le lien qui apparaît' : 'Tap the link that appears'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-[#EF4444] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
                <span>{isFr ? 'Inscrivez-vous et commencez votre transformation !' : 'Sign up and start your transformation!'}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QRCodePage;
