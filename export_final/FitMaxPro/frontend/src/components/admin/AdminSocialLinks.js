import React from 'react';
import { Users, Instagram, Video, Phone, Send, Trash2, Check, RefreshCw, Save, Eye } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';

const AdminSocialLinks = ({ 
  socialLinks, 
  setSocialLinks, 
  saveSingleSocialLink, 
  deleteSingleSocialLink,
  saveSocialLinks,
  savingPlatform,
  savingSocial,
  isFr 
}) => {
  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-5 h-5 text-white" />, bgClass: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500', placeholder: 'https://instagram.com/votre-compte' },
    { id: 'youtube', label: 'YouTube', icon: <Video className="w-5 h-5 text-white" />, bgClass: 'bg-red-600', placeholder: 'https://youtube.com/@votre-chaine' },
    { id: 'tiktok', label: 'TikTok', icon: <span className="text-white font-bold text-xs">TT</span>, bgClass: 'bg-black border border-[#27272a]', placeholder: 'https://tiktok.com/@votre-compte' },
    { id: 'facebook', label: 'Facebook', icon: <span className="text-white font-bold">f</span>, bgClass: 'bg-blue-600', placeholder: 'https://facebook.com/votre-page' },
    { id: 'snapchat', label: 'Snapchat', icon: <span className="text-black font-bold text-lg">👻</span>, bgClass: 'bg-yellow-400', placeholder: 'https://snapchat.com/add/votre-compte' },
    { id: 'twitter', label: 'X (Twitter)', icon: <span className="text-white font-bold">X</span>, bgClass: 'bg-black border border-[#27272a]', placeholder: 'https://x.com/votre-compte' },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Phone className="w-5 h-5 text-white" />, bgClass: 'bg-green-500', placeholder: 'https://wa.me/33612345678' },
    { id: 'telegram', label: 'Telegram', icon: <Send className="w-5 h-5 text-white" />, bgClass: 'bg-blue-500', placeholder: 'https://t.me/votre-compte' },
    { id: 'website', label: isFr ? 'Site Web' : 'Website', icon: <span className="text-white text-lg">🌐</span>, bgClass: 'bg-gray-700', placeholder: 'https://votre-site.com' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Users className="w-5 h-5 text-pink-400" />
        {isFr ? 'Gestion des Réseaux Sociaux' : 'Social Media Management'}
      </h2>
      <p className="text-gray-400 text-sm">
        {isFr 
          ? 'Ajoutez vos liens de réseaux sociaux. Ils seront affichés dans le footer du site et sur le Dashboard. Laissez un champ vide pour ne pas afficher ce réseau.'
          : 'Add your social media links. They will be displayed in the site footer and Dashboard. Leave a field empty to hide that network.'}
      </p>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          {isFr 
            ? '💡 Conseil : Ajoutez uniquement les réseaux sociaux où vous êtes actif.'
            : '💡 Tip: Only add social networks where you are active.'}
        </p>
      </div>

      <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-lg mb-4">{isFr ? 'Vos Réseaux Sociaux' : 'Your Social Networks'}</h3>
        
        {platforms.map(platform => (
          <div key={platform.id} className="flex items-center gap-4">
            <div className={`w-10 h-10 ${platform.bgClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {platform.icon}
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-1 block">{platform.label}</label>
              <Input
                value={socialLinks[platform.id] || ''}
                onChange={(e) => setSocialLinks({...socialLinks, [platform.id]: e.target.value})}
                placeholder={platform.placeholder}
                className="bg-[#09090b] border-[#27272a]"
              />
            </div>
            <Button
              size="sm"
              onClick={() => saveSingleSocialLink(platform.id)}
              disabled={savingPlatform === platform.id}
              className="bg-green-600 hover:bg-green-700"
            >
              {savingPlatform === platform.id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
            {socialLinks[platform.id] && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteSingleSocialLink(platform.id)}
                disabled={savingPlatform === platform.id}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <div className="flex gap-4 mt-6 pt-4 border-t border-[#27272a]">
          <Button 
            onClick={() => setSocialLinks({})} 
            variant="outline" 
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isFr ? 'Tout supprimer' : 'Clear all'}
          </Button>
          <Button onClick={saveSocialLinks} className="bg-[#EF4444] flex-1" disabled={savingSocial}>
            {savingSocial ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isFr ? 'Enregistrer les liens' : 'Save links'}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          {isFr ? 'Aperçu (liens actifs)' : 'Preview (active links)'}
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(socialLinks).filter(([_, url]) => url).length === 0 ? (
            <p className="text-gray-500 text-sm">
              {isFr ? 'Aucun réseau social configuré' : 'No social networks configured'}
            </p>
          ) : (
            Object.entries(socialLinks).filter(([_, url]) => url).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-400" />}
                {platform === 'youtube' && <Video className="w-4 h-4 text-red-500" />}
                {platform === 'tiktok' && <span className="text-xs font-bold">TT</span>}
                {platform === 'facebook' && <span className="text-blue-500 font-bold">f</span>}
                {platform === 'snapchat' && <span>👻</span>}
                {platform === 'twitter' && <span className="font-bold">X</span>}
                {platform === 'whatsapp' && <Phone className="w-4 h-4 text-green-500" />}
                {platform === 'telegram' && <Send className="w-4 h-4 text-blue-400" />}
                {platform === 'website' && <span>🌐</span>}
                <span className="capitalize">{platform}</span>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSocialLinks;
