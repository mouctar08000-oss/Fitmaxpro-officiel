/**
 * FitMaxPro - Admin Users Management Component
 * Gestion complète de tous les utilisateurs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Users, Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight,
  Crown, Clock, UserCheck, UserX, AlertTriangle, Gift, Mail, Eye,
  MoreVertical, CheckCircle, XCircle, Zap, TrendingUp, Calendar
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminUsersManager = () => {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');
  
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  
  // Selected users for bulk actions
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // User detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        tier: tierFilter,
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await axios.get(`${API}/admin/users/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setStats(response.data.stats);
    } catch (error) {
      toast.error(isFr ? 'Erreur lors du chargement' : 'Error loading users');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, tierFilter, searchQuery, pagination.limit, isFr]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserDetails(response.data);
      setShowUserModal(true);
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.put(`${API}/admin/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(isFr ? 'Utilisateur mis à jour' : 'User updated');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const handleExtendTrial = async (userId, days = 7) => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.post(`${API}/admin/users/${userId}/extend-trial?days=${days}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(isFr ? `Essai prolongé de ${days} jours` : `Trial extended by ${days} days`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const handleGrantSubscription = async (userId, tier, days = 30) => {
    try {
      const token = localStorage.getItem('session_token');
      await axios.post(`${API}/admin/users/${userId}/grant-subscription?tier=${tier}&duration_days=${days}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(isFr ? `Abonnement ${tier} offert pour ${days} jours` : `${tier} subscription granted for ${days} days`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm(isFr ? 'Désactiver cet utilisateur ?' : 'Deactivate this user?')) return;
    
    try {
      const token = localStorage.getItem('session_token');
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(isFr ? 'Utilisateur désactivé' : 'User deactivated');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const handleBulkAction = async (action, value = null) => {
    if (selectedUsers.length === 0) {
      toast.error(isFr ? 'Sélectionnez des utilisateurs' : 'Select users first');
      return;
    }
    
    try {
      const token = localStorage.getItem('session_token');
      await axios.post(`${API}/admin/users/bulk-action`, {
        user_ids: selectedUsers,
        action,
        value
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(isFr ? 'Action effectuée' : 'Action completed');
      setSelectedUsers([]);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(isFr ? 'Erreur' : 'Error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await axios.get(`${API}/admin/users/export/csv?status=${statusFilter}&tier=${tierFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const blob = new Blob([response.data.csv_content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(isFr ? `${response.data.total_users} utilisateurs exportés` : `${response.data.total_users} users exported`);
    } catch (error) {
      toast.error(isFr ? 'Erreur export' : 'Export error');
    }
  };

  const getStatusBadge = (user) => {
    const status = user.subscription_status || 'none';
    const configs = {
      'active': { color: 'bg-green-500', icon: CheckCircle, label: isFr ? 'Actif' : 'Active' },
      'trial': { color: 'bg-blue-500', icon: Clock, label: isFr ? 'Essai' : 'Trial' },
      'trialing': { color: 'bg-blue-500', icon: Clock, label: isFr ? 'Essai' : 'Trial' },
      'cancelled': { color: 'bg-red-500', icon: XCircle, label: isFr ? 'Annulé' : 'Cancelled' },
      'expired': { color: 'bg-orange-500', icon: AlertTriangle, label: isFr ? 'Expiré' : 'Expired' },
      'deactivated': { color: 'bg-gray-500', icon: UserX, label: isFr ? 'Désactivé' : 'Deactivated' },
      'none': { color: 'bg-gray-600', icon: Users, label: isFr ? 'Gratuit' : 'Free' }
    };
    const config = configs[status] || configs['none'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color} text-white`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getTierBadge = (tier) => {
    const configs = {
      'vip': { color: 'text-yellow-400 bg-yellow-500/20', icon: Crown, label: 'VIP' },
      'standard': { color: 'text-blue-400 bg-blue-500/20', icon: Zap, label: 'Standard' },
      'supplements': { color: 'text-green-400 bg-green-500/20', icon: Gift, label: 'Supplements' },
      'free': { color: 'text-gray-400 bg-gray-500/20', icon: Users, label: 'Free' }
    };
    const config = configs[tier] || configs['free'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" />
              {isFr ? 'Total' : 'Total'}
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
              <CheckCircle className="w-4 h-4" />
              {isFr ? 'Actifs' : 'Active'}
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.by_status.active}</p>
          </div>
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
              <Clock className="w-4 h-4" />
              {isFr ? 'Essai' : 'Trial'}
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.by_status.trial}</p>
          </div>
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
              <Crown className="w-4 h-4" />
              VIP
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.by_tier.vip}</p>
          </div>
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              {isFr ? 'Cette semaine' : 'This week'}
            </div>
            <p className="text-2xl font-bold text-purple-400">+{stats.growth.new_this_week}</p>
          </div>
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
            <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              {isFr ? 'Ce mois' : 'This month'}
            </div>
            <p className="text-2xl font-bold text-cyan-400">+{stats.growth.new_this_month}</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFr ? 'Rechercher par email, nom...' : 'Search by email, name...'}
                className="pl-10 bg-[#09090b] border-[#27272a]"
              />
            </div>
          </form>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-sm"
          >
            <option value="all">{isFr ? 'Tous les statuts' : 'All statuses'}</option>
            <option value="active">{isFr ? 'Actifs' : 'Active'}</option>
            <option value="trial">{isFr ? 'Essai gratuit' : 'Trial'}</option>
            <option value="expired">{isFr ? 'Expirés' : 'Expired'}</option>
            <option value="cancelled">{isFr ? 'Annulés' : 'Cancelled'}</option>
            <option value="none">{isFr ? 'Sans abonnement' : 'No subscription'}</option>
          </select>
          
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-sm"
          >
            <option value="all">{isFr ? 'Tous les plans' : 'All tiers'}</option>
            <option value="vip">VIP</option>
            <option value="standard">Standard</option>
            <option value="supplements">Supplements</option>
            <option value="free">{isFr ? 'Gratuit' : 'Free'}</option>
          </select>
          
          <Button onClick={() => fetchUsers(1)} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            {isFr ? 'Actualiser' : 'Refresh'}
          </Button>
          
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
        </div>
        
        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded flex items-center gap-4">
            <span className="text-blue-400 text-sm">
              {selectedUsers.length} {isFr ? 'sélectionné(s)' : 'selected'}
            </span>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('extend_trial', '7')}>
              +7 {isFr ? 'jours essai' : 'days trial'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('upgrade', 'standard')}>
              → Standard
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('upgrade', 'vip')}>
              → VIP
            </Button>
            <Button size="sm" variant="outline" className="text-red-400" onClick={() => handleBulkAction('deactivate')}>
              {isFr ? 'Désactiver' : 'Deactivate'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])}>
              {isFr ? 'Annuler' : 'Cancel'}
            </Button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#09090b] border-b border-[#27272a]">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.user_id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">
                  {isFr ? 'Utilisateur' : 'User'}
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">
                  {isFr ? 'Statut' : 'Status'}
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">
                  {isFr ? 'Plan' : 'Tier'}
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">
                  {isFr ? 'Activité' : 'Activity'}
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">
                  {isFr ? 'Inscription' : 'Joined'}
                </th>
                <th className="p-3 text-right text-sm font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    {isFr ? 'Chargement...' : 'Loading...'}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    {isFr ? 'Aucun utilisateur trouvé' : 'No users found'}
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.user_id} className="border-b border-[#27272a] hover:bg-[#09090b]">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.user_id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'Sans nom'}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-400" title="Admin" />
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(user)}
                      {user.trial_info && (
                        <span className={`text-xs ${user.trial_info.expired ? 'text-red-400' : 'text-blue-400'}`}>
                          {user.trial_info.expired 
                            ? (isFr ? 'Essai expiré' : 'Trial expired')
                            : `${user.trial_info.days_left}j ${isFr ? 'restants' : 'left'}`
                          }
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {getTierBadge(user.subscription_tier)}
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <p>{user.completed_workouts || 0} {isFr ? 'séances' : 'workouts'}</p>
                      {user.last_activity && (
                        <p className="text-xs text-gray-400">
                          {isFr ? 'Dernière activité:' : 'Last:'} {new Date(user.last_activity).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-400">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => fetchUserDetails(user.user_id)}
                        title={isFr ? 'Voir détails' : 'View details'}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {user.subscription_status !== 'active' && user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExtendTrial(user.user_id, 7)}
                          title={isFr ? '+7 jours essai' : '+7 days trial'}
                          className="text-blue-400"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {user.subscription_tier !== 'vip' && user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleGrantSubscription(user.user_id, 'vip', 30)}
                          title={isFr ? 'Offrir VIP 30j' : 'Grant VIP 30d'}
                          className="text-yellow-400"
                        >
                          <Gift className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeactivateUser(user.user_id)}
                          title={isFr ? 'Désactiver' : 'Deactivate'}
                          className="text-red-400"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-[#27272a] flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {isFr ? 'Page' : 'Page'} {pagination.page} {isFr ? 'sur' : 'of'} {pagination.pages} ({pagination.total} {isFr ? 'utilisateurs' : 'users'})
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchUsers(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && userDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <h3 className="text-xl font-bold">{isFr ? 'Détails utilisateur' : 'User Details'}</h3>
              <Button variant="ghost" onClick={() => setShowUserModal(false)}>✕</Button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(userDetails.user?.name || userDetails.user?.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{userDetails.user?.name || 'Sans nom'}</h4>
                  <p className="text-gray-400">{userDetails.user?.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(userDetails.user)}
                    {getTierBadge(userDetails.user?.subscription_tier)}
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#09090b] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{userDetails.activity?.total_workouts || 0}</p>
                  <p className="text-sm text-gray-400">{isFr ? 'Séances' : 'Workouts'}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{userDetails.activity?.total_runs || 0}</p>
                  <p className="text-sm text-gray-400">{isFr ? 'Courses' : 'Runs'}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{userDetails.payments?.length || 0}</p>
                  <p className="text-sm text-gray-400">{isFr ? 'Paiements' : 'Payments'}</p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleExtendTrial(userDetails.user.user_id, 7);
                    setShowUserModal(false);
                  }}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  +7 {isFr ? 'jours essai' : 'days trial'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleGrantSubscription(userDetails.user.user_id, 'standard', 30);
                    setShowUserModal(false);
                  }}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Standard 30j
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleGrantSubscription(userDetails.user.user_id, 'vip', 30);
                    setShowUserModal(false);
                  }}
                  className="text-yellow-400 border-yellow-500"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  VIP 30j
                </Button>
              </div>
              
              {/* Subscription Details */}
              {userDetails.subscription && (
                <div className="bg-[#09090b] rounded-lg p-4">
                  <h5 className="font-medium mb-2">{isFr ? 'Abonnement' : 'Subscription'}</h5>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-400">Plan:</span> {userDetails.subscription.tier}</p>
                    <p><span className="text-gray-400">Cycle:</span> {userDetails.subscription.billing_cycle}</p>
                    <p><span className="text-gray-400">{isFr ? 'Début:' : 'Started:'}</span> {userDetails.subscription.started_at ? new Date(userDetails.subscription.started_at).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManager;
