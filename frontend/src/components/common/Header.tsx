import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                BioSearch
              </Link>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">BioSearch</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search salons, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/search"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Find Salons
            </Link>
            <Link
              to="/bio-diamond"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              BIO Diamond
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/manager"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Manager
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/manager"
                className="btn-primary text-sm"
              >
                Manager Login
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search salons, services, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container-padding py-4 space-y-4">
            <Link
              to="/search"
              className="block text-gray-600 hover:text-gray-900 text-base font-medium transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Salons
            </Link>
            <Link
              to="/bio-diamond"
              className="block text-gray-600 hover:text-gray-900 text-base font-medium transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BIO Diamond
            </Link>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block text-gray-600 hover:text-gray-900 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/manager"
                  className="block text-gray-600 hover:text-gray-900 text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Manager
                </Link>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Welcome, {user?.name}</p>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/manager"
                className="block btn-primary text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Manager Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
