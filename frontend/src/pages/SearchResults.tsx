import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Map, List, Filter, Search, Star, Phone, Mail, ExternalLink } from 'lucide-react';
import { salonAPI } from '../utils/api';
// Using inline types to avoid import issues
interface SearchFilters {
  search?: string;
  cidade?: string;
  regiao?: string;
  bio_diamond?: boolean;
}

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: searchParams.get('q') || '',
    cidade: searchParams.get('cidade') || '',
    regiao: searchParams.get('regiao') || '',
    bio_diamond: searchParams.get('bio_diamond') === 'true'
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      search: searchParams.get('q') || '',
      cidade: searchParams.get('cidade') || '',
      regiao: searchParams.get('regiao') || '',
      bio_diamond: searchParams.get('bio_diamond') === 'true'
    });
  }, [searchParams]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['salons', filters, currentPage],
    queryFn: () => salonAPI.getSalons(filters, currentPage, 20),
    enabled: true
  });

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', cidade: '', regiao: '', bio_diamond: false });
    setSearchParams({});
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">We couldn't load the salon results. Please try again.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {filters.search ? `Search Results for "${filters.search}"` : 'All Salons'}
              </h1>
              {searchResults && (
                <p className="text-gray-600">
                  {searchResults.total} salon{searchResults.total !== 1 ? 's' : ''} found
                  {filters.cidade && ` in ${filters.cidade}`}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="h-4 w-4 mr-1" />
                  Map
                </button>
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Salon name or service..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange({ search: e.target.value })}
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    value={filters.cidade || ''}
                    onChange={(e) => handleFilterChange({ cidade: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    placeholder="Enter region..."
                    value={filters.regiao || ''}
                    onChange={(e) => handleFilterChange({ regiao: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                {/* BIO Diamond Filter */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.bio_diamond || false}
                      onChange={(e) => handleFilterChange({ bio_diamond: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      BIO Diamond services only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : viewMode === 'list' ? (
              <div>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResults?.salons.map((salon) => (
                    <div key={salon.id} className="card hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {salon.nome}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <span className="text-sm">
                              {salon.cidade}, {salon.regiao}
                            </span>
                          </div>
                          {salon.rua && (
                            <p className="text-sm text-gray-500 mb-3">
                              {salon.rua} {salon.porta && salon.porta}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2 mb-4">
                        {salon.telefone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a 
                              href={`tel:${salon.telefone}`}
                              className="text-sm text-gray-600 hover:text-blue-600"
                            >
                              {salon.telefone}
                            </a>
                          </div>
                        )}
                        
                        {salon.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a 
                              href={`mailto:${salon.email}`}
                              className="text-sm text-gray-600 hover:text-blue-600"
                            >
                              {salon.email}
                            </a>
                          </div>
                        )}
                        
                        {salon.website && (
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                            <a 
                              href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 hover:text-blue-600"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <a 
                          href={`/salon/${salon.id}`}
                          className="flex-1 btn-primary text-center"
                        >
                          View Details
                        </a>
                        <a 
                          href={`/book/${salon.id}`}
                          className="flex-1 btn-secondary text-center"
                        >
                          Book Now
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults && searchResults.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      {Array.from({ length: searchResults.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            page === currentPage
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchResults?.salons.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No salons found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or browse all salons.
                    </p>
                    <button onClick={clearFilters} className="btn-primary">
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
                  <p className="text-gray-600">Map integration coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;