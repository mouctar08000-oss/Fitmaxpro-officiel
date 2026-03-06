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
  const [storageUsage, setStorageUsage] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        await offlineStorage.init();
        setIsInitialized(true);
        await refreshDownloadedWorkouts();
        await refreshStorageUsage();
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
      await refreshStorageUsage();
      return true;
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  }, [isInitialized, refreshDownloadedWorkouts, refreshStorageUsage]);

  return {
    // Status
    isOnline,
    isInitialized,
    syncing,
    
    // Downloaded workouts
    downloadedWorkouts,
    downloadWorkout,
    removeWorkout,
    isWorkoutDownloaded,
    getWorkout,
    
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
