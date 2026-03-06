/**
 * FitMaxPro - Offline Manager Component
 * UI for managing offline workouts and sync status
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { 
  Download, Trash2, Wifi, WifiOff, Cloud, CloudOff,
  RefreshCw, HardDrive, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import useOffline from '../hooks/useOffline';

const OfflineManager = ({ workout, onDownloadComplete }) => {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');
  
  const {
    isOnline,
    downloadedWorkouts,
    downloadWorkout,
    removeWorkout,
    syncing,
    syncData,
    storageUsage
  } = useOffline();
  
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (workout && downloadedWorkouts) {
      setIsDownloaded(downloadedWorkouts.some(w => w.workout_id === workout.workout_id));
    }
  }, [workout, downloadedWorkouts]);

  const handleDownload = async () => {
    if (!workout) return;
    
    setDownloading(true);
    try {
      const success = await downloadWorkout(workout);
      if (success) {
        setIsDownloaded(true);
        toast.success(isFr 
          ? `"${workout.title}" téléchargé pour l'utilisation hors-ligne`
          : `"${workout.title}" downloaded for offline use`
        );
        onDownloadComplete?.();
      } else {
        toast.error(isFr ? 'Échec du téléchargement' : 'Download failed');
      }
    } catch (error) {
      toast.error(isFr ? 'Erreur lors du téléchargement' : 'Error downloading');
    } finally {
      setDownloading(false);
    }
  };

  const handleRemove = async () => {
    if (!workout) return;
    
    try {
      const success = await removeWorkout(workout.workout_id);
      if (success) {
        setIsDownloaded(false);
        toast.success(isFr 
          ? `"${workout.title}" supprimé du stockage hors-ligne`
          : `"${workout.title}" removed from offline storage`
        );
      }
    } catch (error) {
      toast.error(isFr ? 'Erreur lors de la suppression' : 'Error removing');
    }
  };

  if (!workout) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline indicator */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
        isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? (isFr ? 'En ligne' : 'Online') : (isFr ? 'Hors-ligne' : 'Offline')}
      </div>

      {/* Download/Remove button */}
      {isDownloaded ? (
        <Button
          onClick={handleRemove}
          variant="ghost"
          size="sm"
          className="text-green-400 hover:text-red-400 hover:bg-red-500/10"
          title={isFr ? 'Supprimer du hors-ligne' : 'Remove from offline'}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {isFr ? 'Hors-ligne' : 'Offline'}
          <Trash2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
        </Button>
      ) : (
        <Button
          onClick={handleDownload}
          disabled={downloading || !isOnline}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          title={isFr ? 'Télécharger pour hors-ligne' : 'Download for offline'}
        >
          {downloading ? (
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-1" />
          )}
          {isFr ? 'Télécharger' : 'Download'}
        </Button>
      )}
    </div>
  );
};

// Offline Status Bar - Shows at top when offline
export const OfflineStatusBar = () => {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');
  const { isOnline, syncing, syncData } = useOffline();

  if (isOnline && !syncing) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm ${
      isOnline ? 'bg-blue-600' : 'bg-orange-600'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            {isFr 
              ? 'Mode hors-ligne - Seules les séances téléchargées sont disponibles'
              : 'Offline mode - Only downloaded workouts are available'
            }
          </>
        ) : syncing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            {isFr ? 'Synchronisation en cours...' : 'Syncing...'}
          </>
        ) : null}
      </div>
    </div>
  );
};

// Downloaded Workouts Manager - Full page component
export const DownloadedWorkoutsManager = () => {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');
  
  const {
    isOnline,
    downloadedWorkouts,
    removeWorkout,
    storageUsage,
    clearAllData,
    syncing,
    syncData
  } = useOffline();

  const handleRemove = async (workoutId, title) => {
    const success = await removeWorkout(workoutId);
    if (success) {
      toast.success(isFr 
        ? `"${title}" supprimé`
        : `"${title}" removed`
      );
    }
  };

  const handleClearAll = async () => {
    if (window.confirm(isFr 
      ? 'Supprimer toutes les données hors-ligne ?'
      : 'Clear all offline data?'
    )) {
      await clearAllData();
      toast.success(isFr ? 'Données effacées' : 'Data cleared');
    }
  };

  return (
    <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
            {isOnline ? (
              <Cloud className="w-6 h-6 text-green-400" />
            ) : (
              <CloudOff className="w-6 h-6 text-orange-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {isFr ? 'Séances Hors-ligne' : 'Offline Workouts'}
            </h3>
            <p className="text-gray-400 text-sm">
              {downloadedWorkouts.length} {isFr ? 'séances téléchargées' : 'workouts downloaded'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isOnline && (
            <Button
              onClick={syncData}
              disabled={syncing}
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-500"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {isFr ? 'Sync' : 'Sync'}
            </Button>
          )}
          {downloadedWorkouts.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isFr ? 'Tout effacer' : 'Clear all'}
            </Button>
          )}
        </div>
      </div>

      {/* Storage usage */}
      {storageUsage && (
        <div className="mb-6 p-4 bg-[#09090b] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              {isFr ? 'Stockage utilisé' : 'Storage used'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-[#27272a] rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
              />
            </div>
            <span className="text-sm font-mono">
              {storageUsage.usedFormatted} / {storageUsage.quotaFormatted}
            </span>
          </div>
        </div>
      )}

      {/* Downloaded workouts list */}
      {downloadedWorkouts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <CloudOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{isFr ? 'Aucune séance téléchargée' : 'No downloaded workouts'}</p>
          <p className="text-sm mt-1">
            {isFr 
              ? 'Téléchargez des séances pour y accéder hors-ligne'
              : 'Download workouts to access them offline'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloadedWorkouts.map((workout) => (
            <div 
              key={workout.workout_id}
              className="flex items-center gap-4 p-4 bg-[#09090b] rounded-lg"
            >
              {workout.image_url && (
                <img 
                  src={workout.image_url}
                  alt={workout.title}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{workout.title}</h4>
                <p className="text-gray-400 text-sm">
                  {workout.exercises?.length || 0} {isFr ? 'exercices' : 'exercises'}
                  {workout.downloaded_at && (
                    <span className="ml-2">
                      • {isFr ? 'Téléchargé le' : 'Downloaded'} {new Date(workout.downloaded_at).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {isFr ? 'Disponible' : 'Available'}
                </span>
                <Button
                  onClick={() => handleRemove(workout.workout_id, workout.title)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfflineManager;
