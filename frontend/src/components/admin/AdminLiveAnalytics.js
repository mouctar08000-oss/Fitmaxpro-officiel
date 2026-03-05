import React from 'react';
import { Video, RefreshCw, Users, Clock, Heart, MessageCircle, Crown, Calendar } from 'lucide-react';
import { Button } from '../ui/button.jsx';

const AdminLiveAnalytics = ({ 
  liveAnalytics, 
  loadingLiveAnalytics, 
  fetchLiveAnalytics, 
  isFr 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Video className="w-6 h-6 text-[#EF4444]" />
          {isFr ? 'Statistiques des Lives' : 'Live Streaming Analytics'}
        </h2>
        <Button onClick={fetchLiveAnalytics} disabled={loadingLiveAnalytics}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loadingLiveAnalytics ? 'animate-spin' : ''}`} />
          {isFr ? 'Actualiser' : 'Refresh'}
        </Button>
      </div>

      {loadingLiveAnalytics ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-[#EF4444]" />
        </div>
      ) : !liveAnalytics ? (
        <div className="text-center py-20">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">{isFr ? 'Chargez les statistiques pour les voir' : 'Load statistics to view them'}</p>
          <Button onClick={fetchLiveAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {isFr ? 'Charger les stats' : 'Load Stats'}
          </Button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6">
              <div className="text-red-200 text-sm mb-1">{isFr ? 'Total Lives' : 'Total Lives'}</div>
              <div className="text-3xl font-bold">{liveAnalytics.summary.total_lives}</div>
              <div className="text-red-200 text-xs mt-2">
                {liveAnalytics.summary.active_lives} {isFr ? 'actifs' : 'active'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
              <div className="text-blue-200 text-sm mb-1">{isFr ? 'Spectateurs Total' : 'Total Viewers'}</div>
              <div className="text-3xl font-bold">{liveAnalytics.summary.total_viewers_all_time}</div>
              <div className="text-blue-200 text-xs mt-2">
                ~{liveAnalytics.averages.avg_peak_viewers} {isFr ? 'moy./live' : 'avg/live'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
              <div className="text-green-200 text-sm mb-1">{isFr ? 'Durée Totale' : 'Total Duration'}</div>
              <div className="text-3xl font-bold">{Math.round(liveAnalytics.summary.total_duration_minutes / 60)}h</div>
              <div className="text-green-200 text-xs mt-2">
                ~{liveAnalytics.averages.avg_duration_minutes} {isFr ? 'min moy.' : 'min avg'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6">
              <div className="text-purple-200 text-sm mb-1">{isFr ? 'Engagement' : 'Engagement'}</div>
              <div className="text-3xl font-bold">{liveAnalytics.summary.total_chat_messages + liveAnalytics.summary.total_reactions}</div>
              <div className="text-purple-200 text-xs mt-2">
                {liveAnalytics.summary.total_chat_messages} msgs + {liveAnalytics.summary.total_reactions} ❤️
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top by Viewers */}
            <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                {isFr ? 'Top Spectateurs' : 'Top by Viewers'}
              </h3>
              {liveAnalytics.top_performers.by_viewers.length === 0 ? (
                <p className="text-gray-500 text-sm">{isFr ? 'Aucun live terminé' : 'No ended lives'}</p>
              ) : (
                <div className="space-y-3">
                  {liveAnalytics.top_performers.by_viewers.map((live, idx) => (
                    <div key={live.live_id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg">
                      <span className={`text-lg font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                        #{idx + 1}
                      </span>
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{live.title}</p>
                      </div>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-bold">
                        {live.peak_viewers} 👥
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top by Duration */}
            <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                {isFr ? 'Top Durée' : 'Top by Duration'}
              </h3>
              {liveAnalytics.top_performers.by_duration.length === 0 ? (
                <p className="text-gray-500 text-sm">{isFr ? 'Aucun live terminé' : 'No ended lives'}</p>
              ) : (
                <div className="space-y-3">
                  {liveAnalytics.top_performers.by_duration.map((live, idx) => (
                    <div key={live.live_id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg">
                      <span className={`text-lg font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                        #{idx + 1}
                      </span>
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{live.title}</p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-bold">
                        {live.duration_minutes} min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Lives History */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#EF4444]" />
              {isFr ? 'Historique des Lives' : 'Lives History'}
            </h3>
            {liveAnalytics.recent_lives.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{isFr ? 'Aucun live enregistré' : 'No lives recorded'}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-[#27272a]">
                      <th className="pb-3 pl-3">{isFr ? 'Titre' : 'Title'}</th>
                      <th className="pb-3">{isFr ? 'Statut' : 'Status'}</th>
                      <th className="pb-3">{isFr ? 'Date' : 'Date'}</th>
                      <th className="pb-3">{isFr ? 'Durée' : 'Duration'}</th>
                      <th className="pb-3">{isFr ? 'Spectateurs' : 'Viewers'}</th>
                      <th className="pb-3">{isFr ? 'Engagement' : 'Engagement'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveAnalytics.recent_lives.map(live => (
                      <tr key={live.live_id} className="border-b border-[#27272a]/50 hover:bg-[#1a1a1a]">
                        <td className="py-3 pl-3">
                          <div className="flex items-center gap-2">
                            {live.vip_only && <Crown className="w-4 h-4 text-yellow-400" />}
                            <span className="truncate max-w-[200px]">{live.title}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            live.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            live.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {live.status === 'active' ? (isFr ? 'En direct' : 'Live') :
                             live.status === 'ended' ? (isFr ? 'Terminé' : 'Ended') :
                             (isFr ? 'Programmé' : 'Scheduled')}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(live.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {live.duration_minutes > 0 ? `${live.duration_minutes} min` : '-'}
                        </td>
                        <td className="py-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-400" />
                            {live.peak_viewers}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-purple-400" />
                            {live.chat_messages_count}
                            <Heart className="w-4 h-4 text-pink-400 ml-2" />
                            {live.total_reactions}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLiveAnalytics;
