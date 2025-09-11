import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, List, Map, Star, Phone, Mail, ExternalLink } from 'lucide-react';
import { salonAPI } from '../utils/api';
import SalonCardWithImages from '../components/salon/SalonCardWithImages';

const SearchResultsWithImages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    cidade: searchParams.get('cidade') || '',
    regiao: searchParams.get('regiao') || '',
    bio_diamond: searchParams.get('bio_diamond') === 'true'
  });

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await salonAPI.getSalons({
        search: filters.search,
        cidade: filters.cidade,
        regiao: filters.regiao,
        bio_diamond: filters.bio_diamond
      });
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search salons. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      cidade: '',
      regiao: '',
      bio_diamond: false
    });
  };

  const hasActiveFilters = filters.search || filters.cidade || filters.regiao || filters.bio_diamond;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Salons</h1>
          <p className="text-gray-600">
            {searchResults ? `${searchResults.total} salons found` : 'Searching...'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Salon name or service..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={filters.cidade}
                    onChange={(e) => handleFilterChange('cidade', e.target.value)}
                    placeholder="Enter city name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={filters.regiao}
                    onChange={(e) => handleFilterChange('regiao', e.target.value)}
                    placeholder="Enter region..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* BIO Diamond Filter */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bio_diamond"
                    checked={filters.bio_diamond}
                    onChange={(e) => handleFilterChange('bio_diamond', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="bio_diamond" className="ml-2 text-sm text-gray-700">
                    BIO Diamond services only
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Map className="h-4 w-4 mr-1" />
                  Map
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showFilters
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                </button>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={performSearch} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : searchResults?.salons.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No salons found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                  {searchResults?.salons.map((salon: any) => (
                    <SalonCardWithImages
                      key={salon.id}
                      salon={salon}
                      showServices={false}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {searchResults && searchResults.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={searchResults.current_page === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-700">
                        Page {searchResults.current_page} of {searchResults.pages}
                      </span>
                      <button
                        disabled={searchResults.current_page === searchResults.pages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
                <p className="text-gray-600">
                  Map view is coming soon! For now, please use the list view to browse salons.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsWithImages;
