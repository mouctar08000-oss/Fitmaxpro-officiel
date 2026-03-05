import React from 'react';
import { 
  Users, Eye, UserCog, Phone, Video, Trash2, 
  RefreshCw, TrendingUp, Dumbbell, Activity, Check, X, Clock 
} from 'lucide-react';
import { Button } from '../ui/button.jsx';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return '-'; }
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getTierBadge = (tier) => {
  switch (tier) {
    case 'vip': return 'border-yellow-400 text-yellow-400 bg-yellow-400/10';
    case 'standard': return 'border-blue-400 text-blue-400 bg-blue-400/10';
    case 'supplements': return 'border-green-400 text-green-400 bg-green-400/10';
    default: return 'border-gray-500 text-gray-500 bg-gray-500/10';
  }
};

const AdminSubscribers = ({
  subscribers,
  selectedUser,
  editingSubscription,
  setEditingSubscription,
  fetchSubscribers,
  fetchUserDetails,
  updateSubscription,
  deleteUser,
  navigate,
  isFr
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Subscribers List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EF4444]" />
            {isFr ? 'Liste des Abonnés' : 'Subscribers List'} ({subscribers.length})
          </h2>
          <Button onClick={fetchSubscribers} variant="outline" size="sm" className="border-[#27272a]">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Nom' : 'Name'}</th>
                <th className="text-left p-4 text-gray-400 text-sm">Email</th>
                <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Abonnement' : 'Subscription'}</th>
                <th className="text-left p-4 text-gray-400 text-sm">{isFr ? 'Séances' : 'Sessions'}</th>
                <th className="text-left p-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr 
                  key={sub.user_id} 
                  className={`border-t border-[#27272a] hover:bg-[#1a1a1a] cursor-pointer ${
                    selectedUser?.user?.user_id === sub.user_id ? 'bg-[#1a1a1a]' : ''
                  }`}
                  onClick={() => fetchUserDetails(sub.user_id)}
                >
                  <td className="p-4">
                    <div className="font-medium">{sub.name || '-'}</div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{sub.email}</td>
                  <td className="p-4">
                    {editingSubscription === sub.user_id ? (
                      <select
                        className="bg-[#09090b] border border-[#27272a] rounded px-2 py-1 text-sm"
                        defaultValue={sub.subscription_tier}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateSubscription(sub.user_id, e.target.value, 'active')}
                      >
                        <option value="none">None</option>
                        <option value="standard">Standard</option>
                        <option value="vip">VIP</option>
                        <option value="supplements">Supplements</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs border ${getTierBadge(sub.subscription_tier)}`}>
                        {sub.subscription_tier?.toUpperCase() || 'NONE'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-gray-400">{sub.stats?.total_sessions || 0}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => fetchUserDetails(sub.user_id)} className="text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSubscription(editingSubscription === sub.user_id ? null : sub.user_id)} className="text-blue-400 hover:text-blue-300">
                        <UserCog className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/call?type=video&callee=${sub.user_id}`)} className="text-green-400 hover:text-green-300" title={isFr ? 'Appeler' : 'Call'}>
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteUser(sub.user_id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Panel */}
      <div className="lg:col-span-1">
        {selectedUser ? (
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 sticky top-24 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#EF4444]" />
              {isFr ? 'Détails & Évolution' : 'Details & Progress'}
            </h3>
            
            {/* Call Buttons */}
            <div className="flex gap-2 mb-4">
              <Button onClick={() => navigate(`/call?type=video&callee=${selectedUser.user?.user_id}`)} className="flex-1 bg-green-600 hover:bg-green-700" data-testid="call-video-btn">
                <Video className="w-4 h-4 mr-2" />
                {isFr ? 'Appel Vidéo' : 'Video Call'}
              </Button>
              <Button onClick={() => navigate(`/call?type=audio&callee=${selectedUser.user?.user_id}`)} variant="outline" className="flex-1 border-green-600 text-green-400 hover:bg-green-600/20" data-testid="call-audio-btn">
                <Phone className="w-4 h-4 mr-2" />
                {isFr ? 'Appel Audio' : 'Audio Call'}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">{isFr ? 'Nom' : 'Name'}</p>
                <p className="font-bold">{selectedUser.user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-bold text-sm">{selectedUser.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isFr ? 'Abonnement' : 'Subscription'}</p>
                <span className={`px-3 py-1 rounded text-sm border inline-block mt-1 ${getTierBadge(selectedUser.user?.subscription_tier)}`}>
                  {selectedUser.user?.subscription_tier?.toUpperCase() || 'NONE'}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isFr ? 'Inscrit le' : 'Joined'}</p>
                <p className="font-bold">{formatDate(selectedUser.user?.created_at)}</p>
              </div>

              <hr className="border-[#27272a]" />

              {/* Progress Stats */}
              <h4 className="font-bold text-[#EF4444] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {isFr ? 'Évolution & Progression' : 'Evolution & Progress'}
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 p-3 rounded-lg">
                  <p className="text-blue-400 text-xs font-medium">{isFr ? 'Séances Totales' : 'Total Sessions'}</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedUser.stats?.total_sessions || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 p-3 rounded-lg">
                  <p className="text-green-400 text-xs font-medium">{isFr ? 'Complétées' : 'Completed'}</p>
                  <p className="text-2xl font-bold text-green-400">{selectedUser.stats?.completed_sessions || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 p-3 rounded-lg">
                  <p className="text-purple-400 text-xs font-medium">{isFr ? 'Temps Total' : 'Total Time'}</p>
                  <p className="text-lg font-bold text-purple-400">{selectedUser.stats?.total_duration_formatted || '0h 0m'}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 p-3 rounded-lg">
                  <p className="text-yellow-400 text-xs font-medium">{isFr ? 'Taux Complétion' : 'Completion Rate'}</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {selectedUser.stats?.total_sessions > 0 
                      ? Math.round((selectedUser.stats?.completed_sessions / selectedUser.stats?.total_sessions) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-[#09090b] p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{isFr ? 'Progression' : 'Progress'}</span>
                  <span className="text-[#EF4444] font-bold">
                    {selectedUser.stats?.completed_sessions || 0} / {selectedUser.stats?.total_sessions || 0}
                  </span>
                </div>
                <div className="w-full bg-[#27272a] rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[#EF4444] to-[#F97316] h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${selectedUser.stats?.total_sessions > 0 
                        ? (selectedUser.stats?.completed_sessions / selectedUser.stats?.total_sessions) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Workout History */}
              {selectedUser.workout_stats?.length > 0 && (
                <>
                  <h4 className="font-bold text-[#EF4444] mt-4 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    {isFr ? 'Détail par Séance' : 'Workout Breakdown'}
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedUser.workout_stats.map((ws, idx) => (
                      <div key={idx} className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
                        <p className="font-medium text-sm truncate mb-2">{ws.workout_title}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-blue-400" />
                            <span className="text-gray-400">{ws.launches}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-gray-400">{ws.completed}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span className="text-gray-400">{formatDuration(ws.total_duration || 0)}</span>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-[#27272a] rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${ws.launches > 0 ? (ws.completed / ws.launches) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Recent Sessions */}
              {selectedUser.recent_sessions?.length > 0 && (
                <>
                  <h4 className="font-bold text-[#EF4444] mt-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {isFr ? 'Séances Récentes' : 'Recent Sessions'}
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUser.recent_sessions.slice(0, 5).map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#09090b] p-2 rounded text-xs">
                        <div className="flex items-center gap-2">
                          {session.completed ? 
                            <Check className="w-3 h-3 text-green-400" /> : 
                            <X className="w-3 h-3 text-red-400" />
                          }
                          <span className="truncate max-w-[120px]">{session.workout_title}</span>
                        </div>
                        <span className="text-gray-500">{formatDate(session.started_at)?.split(',')[0]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center text-gray-400">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{isFr ? 'Sélectionnez un utilisateur pour voir son évolution' : 'Select a user to view their progress'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscribers;
