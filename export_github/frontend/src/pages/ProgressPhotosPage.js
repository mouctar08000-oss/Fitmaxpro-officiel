import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { 
  ArrowLeft, Camera, Upload, Trash2, Calendar, 
  Scale, Image, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProgressPhotosPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    photo_type: 'before',
    photo_url: '',
    weight_kg: '',
    notes: ''
  });
  const [uploading, setUploading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedBefore, setSelectedBefore] = useState(null);
  const [selectedAfter, setSelectedAfter] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/progress-photos`, { headers: getAuthHeaders() });
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, [user, fetchPhotos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPhoto.photo_url) {
      toast.error(isFr ? 'Veuillez entrer l\'URL de la photo' : 'Please enter photo URL');
      return;
    }
    
    setUploading(true);
    try {
      await axios.post(`${API}/progress-photos`, {
        ...newPhoto,
        weight_kg: newPhoto.weight_kg ? parseFloat(newPhoto.weight_kg) : null
      }, { headers: getAuthHeaders() });
      
      toast.success(isFr ? 'Photo ajoutée!' : 'Photo added!');
      setNewPhoto({ photo_type: 'before', photo_url: '', weight_kg: '', notes: '' });
      setShowUpload(false);
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setUploading(false);
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm(isFr ? 'Supprimer cette photo?' : 'Delete this photo?')) return;
    
    try {
      await axios.delete(`${API}/progress-photos/${photoId}`, { headers: getAuthHeaders() });
      toast.success(isFr ? 'Photo supprimée' : 'Photo deleted');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const beforePhotos = photos.filter(p => p.photo_type === 'before');
  const afterPhotos = photos.filter(p => p.photo_type === 'after');

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] noise-bg">
        <Navigation />
        <div className="py-20 px-4 text-center">
          <p className="text-gray-400 text-lg mb-4">
            {isFr ? 'Connectez-vous pour voir vos photos' : 'Login to see your photos'}
          </p>
          <Button onClick={() => navigate('/login')} className="bg-[#EF4444]">
            {isFr ? 'Se connecter' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate('/my-progress')}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFr ? 'Retour' : 'Back'}
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 
              className="text-4xl font-bold flex items-center gap-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              <Camera className="w-10 h-10 text-[#EF4444]" />
              {isFr ? 'PHOTOS AVANT/APRÈS' : 'BEFORE/AFTER PHOTOS'}
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setCompareMode(!compareMode)}
                variant={compareMode ? 'default' : 'outline'}
                className={compareMode ? 'bg-[#EF4444]' : 'border-[#27272a]'}
              >
                <Image className="w-4 h-4 mr-2" />
                {isFr ? 'Comparer' : 'Compare'}
              </Button>
              <Button onClick={() => setShowUpload(true)} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                {isFr ? 'Ajouter' : 'Add'}
              </Button>
            </div>
          </div>

          <p className="text-gray-400 mb-8">
            {isFr 
              ? 'Suivez votre transformation en ajoutant des photos de votre progression. Votre coach pourra voir votre évolution!'
              : 'Track your transformation by adding progress photos. Your coach will be able to see your evolution!'}
          </p>

          {/* Upload Form */}
          {showUpload && (
            <div className="bg-[#121212] border border-green-500/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-400" />
                {isFr ? 'Ajouter une photo' : 'Add a photo'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {isFr ? 'Type de photo' : 'Photo type'}
                  </label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => setNewPhoto({...newPhoto, photo_type: 'before'})}
                      className={newPhoto.photo_type === 'before' ? 'bg-orange-500' : 'bg-[#27272a]'}
                    >
                      {isFr ? 'AVANT' : 'BEFORE'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setNewPhoto({...newPhoto, photo_type: 'after'})}
                      className={newPhoto.photo_type === 'after' ? 'bg-green-500' : 'bg-[#27272a]'}
                    >
                      {isFr ? 'APRÈS' : 'AFTER'}
                    </Button>
                  </div>
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {isFr ? 'URL de la photo *' : 'Photo URL *'}
                  </label>
                  <Input
                    value={newPhoto.photo_url}
                    onChange={(e) => setNewPhoto({...newPhoto, photo_url: e.target.value})}
                    placeholder="https://..."
                    className="bg-[#09090b] border-[#27272a]"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {isFr 
                      ? 'Utilisez un service comme Imgur ou Google Photos pour héberger votre image'
                      : 'Use a service like Imgur or Google Photos to host your image'}
                  </p>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {isFr ? 'Poids (kg) - optionnel' : 'Weight (kg) - optional'}
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newPhoto.weight_kg}
                    onChange={(e) => setNewPhoto({...newPhoto, weight_kg: e.target.value})}
                    placeholder="75.5"
                    className="bg-[#09090b] border-[#27272a] w-32"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {isFr ? 'Notes - optionnel' : 'Notes - optional'}
                  </label>
                  <textarea
                    value={newPhoto.notes}
                    onChange={(e) => setNewPhoto({...newPhoto, notes: e.target.value})}
                    placeholder={isFr ? "Début du programme..." : "Start of program..."}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-md p-3 text-white min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={uploading}>
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isFr ? 'Enregistrer' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUpload(false)} className="border-[#27272a]">
                    {isFr ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Compare Mode */}
          {compareMode && (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{isFr ? 'Mode comparaison' : 'Compare mode'}</h2>
              <div className="grid grid-cols-2 gap-8">
                {/* Before */}
                <div>
                  <h3 className="text-orange-400 font-bold mb-3 text-center">
                    {isFr ? 'AVANT' : 'BEFORE'}
                  </h3>
                  {selectedBefore ? (
                    <div className="relative">
                      <img 
                        src={selectedBefore.photo_url} 
                        alt="Before" 
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      <p className="text-center mt-2 text-gray-400 text-sm">
                        {formatDate(selectedBefore.created_at)}
                        {selectedBefore.weight_kg && ` • ${selectedBefore.weight_kg} kg`}
                      </p>
                    </div>
                  ) : (
                    <div className="h-80 bg-[#09090b] rounded-lg flex items-center justify-center border border-dashed border-orange-500/30">
                      <p className="text-gray-500">{isFr ? 'Sélectionnez une photo AVANT' : 'Select a BEFORE photo'}</p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {beforePhotos.map(photo => (
                      <img
                        key={photo.photo_id}
                        src={photo.photo_url}
                        alt="Before"
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                          selectedBefore?.photo_id === photo.photo_id ? 'border-orange-500' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedBefore(photo)}
                      />
                    ))}
                  </div>
                </div>

                {/* After */}
                <div>
                  <h3 className="text-green-400 font-bold mb-3 text-center">
                    {isFr ? 'APRÈS' : 'AFTER'}
                  </h3>
                  {selectedAfter ? (
                    <div className="relative">
                      <img 
                        src={selectedAfter.photo_url} 
                        alt="After" 
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      <p className="text-center mt-2 text-gray-400 text-sm">
                        {formatDate(selectedAfter.created_at)}
                        {selectedAfter.weight_kg && ` • ${selectedAfter.weight_kg} kg`}
                      </p>
                    </div>
                  ) : (
                    <div className="h-80 bg-[#09090b] rounded-lg flex items-center justify-center border border-dashed border-green-500/30">
                      <p className="text-gray-500">{isFr ? 'Sélectionnez une photo APRÈS' : 'Select an AFTER photo'}</p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {afterPhotos.map(photo => (
                      <img
                        key={photo.photo_id}
                        src={photo.photo_url}
                        alt="After"
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                          selectedAfter?.photo_id === photo.photo_id ? 'border-green-500' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedAfter(photo)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Weight Difference */}
              {selectedBefore?.weight_kg && selectedAfter?.weight_kg && (
                <div className="mt-6 text-center bg-[#09090b] rounded-lg p-4">
                  <Scale className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold">
                    {(selectedAfter.weight_kg - selectedBefore.weight_kg).toFixed(1)} kg
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedAfter.weight_kg > selectedBefore.weight_kg 
                      ? (isFr ? 'Prise de masse' : 'Weight gain')
                      : (isFr ? 'Perte de poids' : 'Weight loss')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Photos Grid */}
          {!compareMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Before Photos */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-orange-400 flex items-center gap-2">
                  <ChevronLeft className="w-5 h-5" />
                  {isFr ? 'PHOTOS AVANT' : 'BEFORE PHOTOS'}
                </h2>
                {beforePhotos.length === 0 ? (
                  <div className="bg-[#121212] border border-dashed border-orange-500/30 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {isFr ? 'Aucune photo AVANT' : 'No BEFORE photos'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {beforePhotos.map(photo => (
                      <div key={photo.photo_id} className="bg-[#121212] border border-orange-500/30 rounded-lg overflow-hidden">
                        <img src={photo.photo_url} alt="Before" className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(photo.created_at)}
                            </span>
                            {photo.weight_kg && (
                              <span className="text-blue-400 text-sm flex items-center gap-1">
                                <Scale className="w-3 h-3" />
                                {photo.weight_kg} kg
                              </span>
                            )}
                          </div>
                          {photo.notes && <p className="text-gray-500 text-sm">{photo.notes}</p>}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(photo.photo_id)}
                            className="text-red-400 mt-2"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {isFr ? 'Supprimer' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* After Photos */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                  {isFr ? 'PHOTOS APRÈS' : 'AFTER PHOTOS'}
                  <ChevronRight className="w-5 h-5" />
                </h2>
                {afterPhotos.length === 0 ? (
                  <div className="bg-[#121212] border border-dashed border-green-500/30 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {isFr ? 'Aucune photo APRÈS' : 'No AFTER photos'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {afterPhotos.map(photo => (
                      <div key={photo.photo_id} className="bg-[#121212] border border-green-500/30 rounded-lg overflow-hidden">
                        <img src={photo.photo_url} alt="After" className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(photo.created_at)}
                            </span>
                            {photo.weight_kg && (
                              <span className="text-blue-400 text-sm flex items-center gap-1">
                                <Scale className="w-3 h-3" />
                                {photo.weight_kg} kg
                              </span>
                            )}
                          </div>
                          {photo.notes && <p className="text-gray-500 text-sm">{photo.notes}</p>}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(photo.photo_id)}
                            className="text-red-400 mt-2"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {isFr ? 'Supprimer' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPhotosPage;
