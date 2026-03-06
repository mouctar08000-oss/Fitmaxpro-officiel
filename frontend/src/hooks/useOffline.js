/**
 * FitMaxPro - useOffline Hook
 * Manages offline mode and data synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import offlineStorage from '../services/offlineStorage';

const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloadedWorkouts, setDownloadedWorkouts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [storageUsage, setStorageUsage] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState(true);
  const [autoDownloading, setAutoDownloading] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        await offlineStorage.init();
        setIsInitialized(true);
        await refreshDownloadedWorkouts();
        await refreshFavorites();
        await refreshStorageUsage();
        const autoEnabled = await offlineStorage.isAutoDownloadEnabled();
        setAutoDownloadEnabled(autoEnabled);
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };
    init();
  }, []);

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Refresh downloaded workouts list
  const refreshDownloadedWorkouts = useCallback(async () => {
    if (!isInitialized) return;
    try {
      const workouts = await offlineStorage.getAllDownloadedWorkouts();
      setDownloadedWorkouts(workouts);
    } catch (error) {
      console.error('Failed to get downloaded workouts:', error);
    }
  }, [isInitialized]);

  // Refresh favorites list
  const refreshFavorites = useCallback(async () => {
    if (!isInitialized) return;
    try {
      const favs = await offlineStorage.getAllFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to get favorites:', error);
    }
  }, [isInitialized]);

  // Refresh storage usage
  const refreshStorageUsage = useCallback(async () => {
    const usage = await offlineStorage.getStorageUsage();
    setStorageUsage(usage);
  }, []);

  // Download workout for offline access
  const downloadWorkout = useCallback(async (workout) => {
    if (!isInitialized) return false;
    try {
      await offlineStorage.saveWorkout(workout);
      await refreshDownloadedWorkouts();
      await refreshStorageUsage();
      return true;
    } catch (error) {
      console.error('Failed to download workout:', error);
      return false;
    }
  }, [isInitialized, refreshDownloadedWorkouts, refreshStorageUsage]);

  // Remove workout from offline storage
  const removeWorkout = useCallback(async (workoutId) => {
    if (!isInitialized) return false;
    try {
      await offlineStorage.deleteWorkout(workoutId);
      await refreshDownloadedWorkouts();
      await refreshStorageUsage();
      return true;
    } catch (error) {
      console.error('Failed to remove workout:', error);
      return false;
    }
  }, [isInitialized, refreshDownloadedWorkouts, refreshStorageUsage]);

  // Check if workout is downloaded
  const isWorkoutDownloaded = useCallback(async (workoutId) => {
    if (!isInitialized) return false;
    return await offlineStorage.isWorkoutDownloaded(workoutId);
  }, [isInitialized]);

  // Get workout (from cache if offline)
  const getWorkout = useCallback(async (workoutId, fetchFn) => {
    // If online, try to fetch fresh data
    if (isOnline && fetchFn) {
      try {
        const workout = await fetchFn();
        // Update cache with fresh data
        if (workout && await isWorkoutDownloaded(workoutId)) {
          await offlineStorage.saveWorkout(workout);
        }
        return workout;
      } catch (error) {
        console.warn('Failed to fetch workout online, trying cache:', error);
      }
    }
    
    // Return cached version
    return await offlineStorage.getWorkout(workoutId);
  }, [isOnline, isWorkoutDownloaded]);

  // Get cached image URL
  const getCachedImage = useCallback(async (url) => {
    if (isOnline) return url;
    const cached = await offlineStorage.getCachedImage(url);
    return cached || url;
  }, [isOnline]);

  // Sync pending data
  const syncData = useCallback(async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    try {
      await offlineStorage.syncPendingData();
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing]);

  // Add to sync queue (for offline-first operations)
  const addToSyncQueue = useCallback(async (type, data) => {
    if (!isInitialized) return;
    await offlineStorage.addToSyncQueue(type, data);
    
    // If online, sync immediately
    if (isOnline) {
      await syncData();
    }
  }, [isInitialized, isOnline, syncData]);

  // Clear all offline data
  const clearAllData = useCallback(async () => {
    if (!isInitialized) return false;
    try {
      await offlineStorage.clearAllData();
      await refreshDownloadedWorkouts();
      await refreshFavorites();
      await refreshStorageUsage();
      return true;
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  }, [isInitialized, refreshDownloadedWorkouts, refreshFavorites, refreshStorageUsage]);

  // ==================== FAVORITES ====================

  // Add to favorites (and optionally auto-download)
  const addToFavorites = useCallback(async (workout) => {
    if (!isInitialized) return false;
    try {
      await offlineStorage.addToFavorites(workout.workout_id, workout);
      await refreshFavorites();
      
      // Auto-download if enabled and online
      if (autoDownloadEnabled && isOnline) {
        await downloadWorkout(workout);
      }
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }, [isInitialized, autoDownloadEnabled, isOnline, refreshFavorites]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (workoutId) => {
    if (!isInitialized) return false;
    try {
      await offlineStorage.removeFromFavorites(workoutId);
      await refreshFavorites();
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }, [isInitialized, refreshFavorites]);

  // Check if workout is favorite
  const isFavorite = useCallback(async (workoutId) => {
    if (!isInitialized) return false;
    return await offlineStorage.isFavorite(workoutId);
  }, [isInitialized]);

  // Toggle auto-download setting
  const toggleAutoDownload = useCallback(async (enabled) => {
    await offlineStorage.setAutoDownloadEnabled(enabled);
    setAutoDownloadEnabled(enabled);
  }, []);

  // Auto-download all favorites
  const autoDownloadAllFavorites = useCallback(async (fetchWorkoutFn) => {
    if (!isOnline || autoDownloading) return null;
    setAutoDownloading(true);
    try {
      const result = await offlineStorage.autoDownloadFavorites(fetchWorkoutFn);
      await refreshDownloadedWorkouts();
      await refreshStorageUsage();
      return result;
    } finally {
      setAutoDownloading(false);
    }
  }, [isOnline, autoDownloading, refreshDownloadedWorkouts, refreshStorageUsage]);

  return {
    // Status
    isOnline,
    isInitialized,
    syncing,
    autoDownloading,
    
    // Downloaded workouts
    downloadedWorkouts,
    downloadWorkout,
    removeWorkout,
    isWorkoutDownloaded,
    getWorkout,
    
    // Favorites
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    
    // Auto-download
    autoDownloadEnabled,
    toggleAutoDownload,
    autoDownloadAllFavorites,
    
    // Image caching
    getCachedImage,
    
    // Sync
    syncData,
    addToSyncQueue,
    
    // Storage
    storageUsage,
    clearAllData,
    refreshStorageUsage
  };
};

export default useOffline;
