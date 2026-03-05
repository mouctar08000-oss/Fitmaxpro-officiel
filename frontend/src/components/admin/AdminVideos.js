import React from 'react';
import { 
  Video, Plus, Play, Pause, Trash2, Edit, Eye, 
  RefreshCw, Lock, Upload, Clock, CheckCircle
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';

const AdminVideos = ({
  videos,
  isAddingVideo,
  setIsAddingVideo,
  newVideo,
  setNewVideo,
  addVideo,
  deleteVideo,
  toggleVideoVisibility,
  fetchVideos,
  isFr
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-400" />
          {isFr ? 'Gestion des Vidéos' : 'Video Management'}
        </h2>
        <div className="flex gap-2">
          <Button onClick={fetchVideos} variant="outline" size="sm" className="border-[#27272a]">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsAddingVideo(!isAddingVideo)} className="bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            {isFr ? 'Ajouter' : 'Add'}
          </Button>
        </div>
      </div>

      {/* Add Video Form */}
      {isAddingVideo && (
        <div className="bg-[#121212] border border-purple-500/30 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-purple-400 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {isFr ? 'Nouvelle Vidéo' : 'New Video'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={newVideo.title || ''}
              onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
              placeholder={isFr ? "Titre de la vidéo" : "Video title"}
              className="bg-[#09090b] border-[#27272a]"
            />
            <Input
              value={newVideo.url || ''}
              onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
              placeholder="URL (YouTube, Vimeo, etc.)"
              className="bg-[#09090b] border-[#27272a]"
            />
            <Input
              value={newVideo.thumbnail || ''}
              onChange={(e) => setNewVideo({...newVideo, thumbnail: e.target.value})}
              placeholder={isFr ? "URL de la miniature" : "Thumbnail URL"}
              className="bg-[#09090b] border-[#27272a]"
            />
            <select
              value={newVideo.category || 'workout'}
              onChange={(e) => setNewVideo({...newVideo, category: e.target.value})}
              className="bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2"
            >
              <option value="workout">{isFr ? 'Entraînement' : 'Workout'}</option>
              <option value="nutrition">{isFr ? 'Nutrition' : 'Nutrition'}</option>
              <option value="motivation">{isFr ? 'Motivation' : 'Motivation'}</option>
              <option value="tutorial">{isFr ? 'Tutoriel' : 'Tutorial'}</option>
            </select>
          </div>
          <textarea
            value={newVideo.description || ''}
            onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
            placeholder={isFr ? "Description..." : "Description..."}
            rows={3}
            className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newVideo.vip_only || false}
                onChange={(e) => setNewVideo({...newVideo, vip_only: e.target.checked})}
                className="rounded border-[#27272a]"
              />
              <Lock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">{isFr ? 'Réservé VIP' : 'VIP Only'}</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={addVideo} className="bg-purple-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              {isFr ? 'Enregistrer' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => { setIsAddingVideo(false); setNewVideo({}); }} className="border-[#27272a]">
              {isFr ? 'Annuler' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-[#121212] border border-[#27272a] rounded-lg p-8 text-center">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{isFr ? 'Aucune vidéo' : 'No videos'}</p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video.video_id} className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[#09090b]">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="ghost" className="text-white">
                    <Play className="w-5 h-5" />
                  </Button>
                </div>
                {/* VIP Badge */}
                {video.vip_only && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold">
                    VIP
                  </div>
                )}
                {/* Status Badge */}
                {!video.is_visible && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs">
                    {isFr ? 'Masqué' : 'Hidden'}
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold truncate">{video.title}</h3>
                <p className="text-gray-500 text-xs mb-3">{video.category}</p>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Eye className="w-3 h-3" />
                    {video.views || 0}
                    <Clock className="w-3 h-3 ml-2" />
                    {video.duration || '0:00'}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toggleVideoVisibility(video.video_id)}
                      className={video.is_visible ? 'text-green-400' : 'text-gray-500'}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteVideo(video.video_id)}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVideos;
