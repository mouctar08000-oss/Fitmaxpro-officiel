/**
 * FitMaxPro - Offline Storage Service
 * Uses IndexedDB to store workout data for offline access
 */

const DB_NAME = 'fitmaxpro_offline';
const DB_VERSION = 2;

// Store names
const STORES = {
  WORKOUTS: 'workouts',
  IMAGES: 'images',
  SYNC_QUEUE: 'sync_queue',
  USER_DATA: 'user_data',
  FAVORITES: 'favorites',
  SETTINGS: 'settings'
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Workouts store
        if (!db.objectStoreNames.contains(STORES.WORKOUTS)) {
          const workoutsStore = db.createObjectStore(STORES.WORKOUTS, { keyPath: 'workout_id' });
          workoutsStore.createIndex('language', 'language', { unique: false });
          workoutsStore.createIndex('downloaded_at', 'downloaded_at', { unique: false });
        }

        // Images cache store
        if (!db.objectStoreNames.contains(STORES.IMAGES)) {
          db.createObjectStore(STORES.IMAGES, { keyPath: 'url' });
        }

        // Sync queue for offline actions
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // User data store (progress, sessions, etc.)
        if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
          const userStore = db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
          userStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Favorites store (for auto-download)
        if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
          const favStore = db.createObjectStore(STORES.FAVORITES, { keyPath: 'workout_id' });
          favStore.createIndex('added_at', 'added_at', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };
    });
  }

  // ==================== WORKOUTS ====================

  // Save workout for offline access
  async saveWorkout(workout) {
    const tx = this.db.transaction(STORES.WORKOUTS, 'readwrite');
    const store = tx.objectStore(STORES.WORKOUTS);
    
    const offlineWorkout = {
      ...workout,
      downloaded_at: new Date().toISOString(),
      offline_available: true
    };
    
    // Also cache images
    if (workout.image_url) {
      await this.cacheImage(workout.image_url);
    }
    for (const exercise of workout.exercises || []) {
      if (exercise.image_url) {
        await this.cacheImage(exercise.image_url);
      }
    }
    
    return new Promise((resolve, reject) => {
      const request = store.put(offlineWorkout);
      request.onsuccess = () => resolve(offlineWorkout);
      request.onerror = () => reject(request.error);
    });
  }

  // Get workout from offline storage
  async getWorkout(workoutId) {
    const tx = this.db.transaction(STORES.WORKOUTS, 'readonly');
    const store = tx.objectStore(STORES.WORKOUTS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(workoutId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all downloaded workouts
  async getAllDownloadedWorkouts() {
    const tx = this.db.transaction(STORES.WORKOUTS, 'readonly');
    const store = tx.objectStore(STORES.WORKOUTS);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete workout from offline storage
  async deleteWorkout(workoutId) {
    const tx = this.db.transaction(STORES.WORKOUTS, 'readwrite');
    const store = tx.objectStore(STORES.WORKOUTS);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(workoutId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Check if workout is downloaded
  async isWorkoutDownloaded(workoutId) {
    const workout = await this.getWorkout(workoutId);
    return !!workout;
  }

  // ==================== IMAGE CACHING ====================

  // Cache image as blob
  async cacheImage(url) {
    if (!url || url.startsWith('data:')) return;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const tx = this.db.transaction(STORES.IMAGES, 'readwrite');
      const store = tx.objectStore(STORES.IMAGES);
      
      return new Promise((resolve) => {
        const request = store.put({ url, blob, cached_at: new Date().toISOString() });
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.warn('Failed to cache image:', url, error);
      return false;
    }
  }

  // Get cached image
  async getCachedImage(url) {
    const tx = this.db.transaction(STORES.IMAGES, 'readonly');
    const store = tx.objectStore(STORES.IMAGES);
    
    return new Promise((resolve) => {
      const request = store.get(url);
      request.onsuccess = () => {
        if (request.result?.blob) {
          resolve(URL.createObjectURL(request.result.blob));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  // ==================== SYNC QUEUE ====================

  // Add action to sync queue (for offline-first operations)
  async addToSyncQueue(type, data) {
    const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    
    const item = {
      type,
      data,
      created_at: new Date().toISOString(),
      synced: false
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending sync items
  async getPendingSyncItems() {
    const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const items = (request.result || []).filter(item => !item.synced);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Mark sync item as synced
  async markSynced(id) {
    const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const updated = { ...getRequest.result, synced: true, synced_at: new Date().toISOString() };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(false);
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Sync pending data when online
  async syncPendingData() {
    if (!this.isOnline) return;
    
    const pendingItems = await this.getPendingSyncItems();
    const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
    const token = localStorage.getItem('session_token');
    const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    
    for (const item of pendingItems) {
      try {
        switch (item.type) {
          case 'workout_session_start':
            await fetch(`${API}/workout/start?workout_id=${item.data.workout_id}`, {
              method: 'POST',
              headers
            });
            break;
          case 'workout_session_end':
            await fetch(`${API}/workout/end?session_id=${item.data.session_id}&completed=${item.data.completed}`, {
              method: 'POST',
              headers
            });
            break;
          // Add more sync types as needed
        }
        
        await this.markSynced(item.id);
        console.log(`Synced item ${item.id} (${item.type})`);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
      }
    }
  }

  // ==================== USER DATA ====================

  // Save user data
  async saveUserData(key, value) {
    const tx = this.db.transaction(STORES.USER_DATA, 'readwrite');
    const store = tx.objectStore(STORES.USER_DATA);
    
    const data = {
      key,
      value,
      updated_at: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  // Get user data
  async getUserData(key) {
    const tx = this.db.transaction(STORES.USER_DATA, 'readonly');
    const store = tx.objectStore(STORES.USER_DATA);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== STORAGE INFO ====================

  // Get storage usage
  async getStorageUsage() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        usedFormatted: this.formatBytes(estimate.usage || 0),
        quotaFormatted: this.formatBytes(estimate.quota || 0),
        percentage: Math.round(((estimate.usage || 0) / (estimate.quota || 1)) * 100)
      };
    }
    return null;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clear all offline data
  async clearAllData() {
    const stores = [STORES.WORKOUTS, STORES.IMAGES, STORES.SYNC_QUEUE, STORES.USER_DATA, STORES.FAVORITES];
    
    for (const storeName of stores) {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await new Promise((resolve) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    }
    
    return true;
  }

  // ==================== FAVORITES ====================

  // Add workout to favorites
  async addToFavorites(workoutId, workoutData = null) {
    const tx = this.db.transaction(STORES.FAVORITES, 'readwrite');
    const store = tx.objectStore(STORES.FAVORITES);
    
    const favorite = {
      workout_id: workoutId,
      added_at: new Date().toISOString(),
      auto_download: true,
      workout_data: workoutData
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(favorite);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove from favorites
  async removeFromFavorites(workoutId) {
    const tx = this.db.transaction(STORES.FAVORITES, 'readwrite');
    const store = tx.objectStore(STORES.FAVORITES);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(workoutId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all favorites
  async getAllFavorites() {
    const tx = this.db.transaction(STORES.FAVORITES, 'readonly');
    const store = tx.objectStore(STORES.FAVORITES);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Check if workout is favorite
  async isFavorite(workoutId) {
    const tx = this.db.transaction(STORES.FAVORITES, 'readonly');
    const store = tx.objectStore(STORES.FAVORITES);
    
    return new Promise((resolve) => {
      const request = store.get(workoutId);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
  }

  // ==================== AUTO DOWNLOAD ====================

  // Get setting
  async getSetting(key) {
    if (!this.db) return null;
    const tx = this.db.transaction(STORES.SETTINGS, 'readonly');
    const store = tx.objectStore(STORES.SETTINGS);
    
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => resolve(null);
    });
  }

  // Set setting
  async setSetting(key, value) {
    const tx = this.db.transaction(STORES.SETTINGS, 'readwrite');
    const store = tx.objectStore(STORES.SETTINGS);
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value, updated_at: new Date().toISOString() });
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Auto-download all favorites
  async autoDownloadFavorites(fetchWorkoutFn) {
    const autoDownloadEnabled = await this.getSetting('auto_download_favorites');
    if (autoDownloadEnabled === false) return { downloaded: 0, skipped: 0 };
    
    const favorites = await this.getAllFavorites();
    let downloaded = 0;
    let skipped = 0;
    
    for (const fav of favorites) {
      const isAlreadyDownloaded = await this.isWorkoutDownloaded(fav.workout_id);
      
      if (!isAlreadyDownloaded) {
        try {
          // Fetch full workout data if not stored
          let workoutData = fav.workout_data;
          if (!workoutData && fetchWorkoutFn) {
            workoutData = await fetchWorkoutFn(fav.workout_id);
          }
          
          if (workoutData) {
            await this.saveWorkout(workoutData);
            downloaded++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.warn(`Failed to auto-download workout ${fav.workout_id}:`, error);
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    return { downloaded, skipped };
  }

  // Toggle auto-download setting
  async setAutoDownloadEnabled(enabled) {
    return await this.setSetting('auto_download_favorites', enabled);
  }

  // Check if auto-download is enabled
  async isAutoDownloadEnabled() {
    const setting = await this.getSetting('auto_download_favorites');
    return setting !== false; // Default to true
  }
}

// Singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;
export { STORES };
