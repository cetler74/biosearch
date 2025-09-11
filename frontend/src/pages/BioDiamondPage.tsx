import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { salonAPI } from '../utils/api';
import { Sparkles, RefreshCw } from 'lucide-react';
import SalonCardWithImages from '../components/salon/SalonCardWithImages';

const BioDiamondPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['bio-diamond-salons'],
    queryFn: () => salonAPI.getSalons({ bio_diamond: true }, 1, 50),
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-500 p-4 rounded-full">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              BIO Diamond Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Discover salons offering premium Bio Sculpture gel nail treatments. 
              Experience long-lasting, natural-looking nails with professional care.
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh BIO Diamond Salons
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Certified BIO Diamond Salons
          </h2>
          {searchResults && (
            <p className="text-gray-600">
              {searchResults.total} salon{searchResults.total !== 1 ? 's' : ''} offering BIO Diamond services
            </p>
          )}
        </div>


        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {searchResults?.salons.map((salon) => (
              <SalonCardWithImages
                key={salon.id}
                salon={salon}
                showServices={false}
              />
            ))}
          </div>
        )}

        {searchResults?.salons.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No BIO Diamond salons found
            </h3>
            <p className="text-gray-600">
              We're working to add more certified salons to our network.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BioDiamondPage;