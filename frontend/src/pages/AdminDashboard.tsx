import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

interface AdminStats {
  users: {
    total: number;
    active: number;
    admins: number;
  };
  salons: {
    total: number;
    active: number;
    booking_enabled: number;
  };
  bookings: {
    total: number;
    recent_week: number;
  };
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  salon_count: number;
  created_at: string;
}

interface AdminSalon {
  id: number;
  nome: string;
  cidade: string;
  regiao: string;
  telefone?: string;
  email?: string;
  estado: string;
  booking_enabled: boolean;
  is_active: boolean;
  is_bio_diamond: boolean;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'salons'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [salons, setSalons] = useState<AdminSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'stats') {
        const statsData = await adminAPI.getStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const usersData = await adminAPI.getUsers(currentPage, 20);
        setUsers(usersData.users);
        setTotalPages(usersData.pages);
      } else if (activeTab === 'salons') {
        const salonsData = await adminAPI.getSalons(currentPage, 20);
        setSalons(salonsData.salons);
        setTotalPages(salonsData.pages);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      loadData(); // Reload data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleToggleSalonBooking = async (salonId: number) => {
    try {
      await adminAPI.toggleSalonBooking(salonId);
      loadData(); // Reload data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update salon booking status');
    }
  };

  const handleToggleSalonStatus = async (salonId: number) => {
    try {
      await adminAPI.toggleSalonStatus(salonId);
      loadData(); // Reload data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update salon status');
    }
  };

  const handleToggleSalonBioDiamond = async (salonId: number) => {
    try {
      await adminAPI.toggleSalonBioDiamond(salonId);
      loadData(); // Reload data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update BIO Diamond status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (loading && !stats && !users.length && !salons.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users, salons, and system settings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'stats', label: 'Statistics', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'salons', label: 'Salons', icon: '🏪' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Users Stats */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.users.total}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    <span className="text-green-600">{stats.users.active}</span> active,{' '}
                    <span className="text-blue-600">{stats.users.admins}</span> admins
                  </div>
                </div>
              </div>
            </div>

            {/* Salons Stats */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🏪</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Salons</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.salons.total}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    <span className="text-green-600">{stats.salons.active}</span> active,{' '}
                    <span className="text-blue-600">{stats.salons.booking_enabled}</span> with booking
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Stats */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Bookings</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.bookings.total}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600">{stats.bookings.recent_week}</span> this week
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Users Management</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage user accounts and permissions</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          user.is_admin ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            user.is_admin ? 'text-purple-600' : 'text-gray-600'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          {user.is_admin && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                          {!user.is_active && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          {user.salon_count} salon{user.salon_count !== 1 ? 's' : ''} • Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          user.is_active
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Salons Tab */}
        {activeTab === 'salons' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Salons Management</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage salon settings and booking permissions</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {salons.map((salon) => (
                <li key={salon.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          salon.is_active ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            salon.is_active ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {salon.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{salon.nome}</p>
                          {!salon.is_active && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                          {salon.booking_enabled && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Booking Enabled
                            </span>
                          )}
                          {salon.is_bio_diamond && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white">
                              BIO Diamond
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{salon.cidade}, {salon.regiao}</p>
                        <p className="text-sm text-gray-500">
                          {salon.owner ? `Owner: ${salon.owner.name}` : 'No Owner'} • {formatDate(salon.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSalonBioDiamond(salon.id)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          salon.is_bio_diamond
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-purple-700 bg-purple-100 hover:bg-purple-200'
                        }`}
                      >
                        {salon.is_bio_diamond ? 'Remove BIO Diamond' : 'Make BIO Diamond'}
                      </button>
                      <button
                        onClick={() => handleToggleSalonBooking(salon.id)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          salon.booking_enabled
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {salon.booking_enabled ? 'Disable Booking' : 'Enable Booking'}
                      </button>
                      <button
                        onClick={() => handleToggleSalonStatus(salon.id)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          salon.is_active
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {salon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
