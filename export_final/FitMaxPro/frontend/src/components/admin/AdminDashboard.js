import React from 'react';
import { 
  Users, Crown, Activity, Pill, Dumbbell, 
  Check, Clock 
} from 'lucide-react';

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const AdminDashboard = ({ stats, isFr }) => {
  if (!stats) return null;
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-[#EF4444]" />
            <span className="text-gray-400 text-sm">{isFr ? 'Total Utilisateurs' : 'Total Users'}</span>
          </div>
          <p className="text-3xl font-bold">{stats.total_users}</p>
        </div>
        
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-gray-400 text-sm">{isFr ? 'Abonnés VIP' : 'VIP Subscribers'}</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{stats.vip_users}</p>
        </div>
        
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-blue-400" />
            <span className="text-gray-400 text-sm">{isFr ? 'Standard' : 'Standard'}</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.standard_users}</p>
        </div>
        
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Pill className="w-6 h-6 text-green-400" />
            <span className="text-gray-400 text-sm">{isFr ? 'Suppléments' : 'Supplements'}</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.supplements_users || 0}</p>
        </div>
      </div>

      {/* Workout Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-[#EF4444]" />
            <span className="text-gray-400 text-sm">{isFr ? 'Séances Lancées' : 'Sessions Started'}</span>
          </div>
          <p className="text-3xl font-bold">{stats.total_workout_sessions || 0}</p>
        </div>
        
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-6 h-6 text-green-400" />
            <span className="text-gray-400 text-sm">{isFr ? 'Séances Complétées' : 'Completed Sessions'}</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.completed_workout_sessions || 0}</p>
        </div>
        
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-purple-400" />
            <span className="text-gray-400 text-sm">{isFr ? 'Temps Total' : 'Total Time'}</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {formatDuration(stats.total_workout_duration_seconds || 0)}
          </p>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#EF4444]" />
            {isFr ? 'Programmes d\'entraînement' : 'Workout Programs'}
          </h3>
          <p className="text-4xl font-bold">{stats.total_workouts}</p>
        </div>
        
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-green-400" />
            {isFr ? 'Plans Nutrition' : 'Nutrition Plans'}
          </h3>
          <p className="text-4xl font-bold">{stats.total_supplements}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
