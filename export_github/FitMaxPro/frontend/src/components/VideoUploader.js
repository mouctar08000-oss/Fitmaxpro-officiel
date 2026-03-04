import React, { useState, useRef } from 'react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Upload, Link, Video, X, Check, RefreshCw, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VideoUploader = ({ value, onChange, onUploadComplete }) => {
  const [mode, setMode] = useState(value?.startsWith('/api/videos/') ? 'uploaded' : 'url');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const fileInputRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez MP4, WebM, MOV ou AVI');
      return;
    }

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Maximum: 500 MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/admin/upload-video`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        const videoUrl = `${API}${response.data.url.replace('/api', '')}`;
        setUploadedVideo({
          id: response.data.video_id,
          url: response.data.url,
          filename: response.data.filename,
          size: response.data.size
        });
        onChange(response.data.url);
        onUploadComplete?.(response.data);
        toast.success('Vidéo uploadée avec succès !');
        setMode('uploaded');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlChange = (url) => {
    onChange(url);
    setUploadedVideo(null);
  };

  const clearVideo = () => {
    onChange('');
    setUploadedVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <label className="text-gray-400 text-xs block mb-1">Vidéo de l'exercice</label>
      
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          size="sm"
          variant={mode === 'upload' ? 'default' : 'outline'}
          onClick={() => setMode('upload')}
          className={mode === 'upload' ? 'bg-[#EF4444] hover:bg-[#DC2626]' : ''}
        >
          <Upload className="w-4 h-4 mr-1" />
          Uploader
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'url' ? 'default' : 'outline'}
          onClick={() => setMode('url')}
          className={mode === 'url' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <Link className="w-4 h-4 mr-1" />
          Lien YouTube
        </Button>
        {(value || uploadedVideo) && mode !== 'uploaded' && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearVideo}
            className="text-red-400 hover:text-red-300 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
          />
          
          {uploading ? (
            <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-5 h-5 text-[#EF4444] animate-spin" />
                <span className="text-white">Upload en cours... {uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#27272a] rounded-full h-2">
                <div 
                  className="bg-[#EF4444] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <label 
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full h-32 bg-[#09090b] border-2 border-dashed border-[#27272a] rounded-lg cursor-pointer hover:border-[#EF4444] transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-400 text-sm">Cliquez pour uploader une vidéo</span>
              <span className="text-gray-500 text-xs mt-1">MP4, WebM, MOV, AVI (max 500 MB)</span>
            </label>
          )}
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <Input
          value={value || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
          className="bg-[#09090b] border-[#27272a]"
        />
      )}

      {/* Uploaded Video Preview */}
      {mode === 'uploaded' && value && (
        <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-white font-medium">Vidéo uploadée</p>
                <p className="text-gray-400 text-sm">
                  {uploadedVideo?.filename || 'video.mp4'}
                  {uploadedVideo?.size && ` (${formatFileSize(uploadedVideo.size)})`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => window.open(`${BACKEND_URL}${value}`, '_blank')}
              >
                <Video className="w-4 h-4 mr-1" />
                Voir
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  clearVideo();
                  setMode('upload');
                }}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview for URL */}
      {mode === 'url' && value && !value.startsWith('/api/videos/') && (
        <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Lien vidéo ajouté</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
