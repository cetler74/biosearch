import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Mail, ExternalLink, Clock, Star, Calendar, Navigation } from 'lucide-react';
import { salonAPI } from '../utils/api';
import ReviewSection from '../components/review/ReviewSection';
import StarRating from '../components/common/StarRating';
import SalonImageGallery from '../components/salon/SalonImageGallery';

const SalonDetailsWithImages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const salonId = parseInt(id || '0');

  const { data: salon, isLoading, error } = useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => salonAPI.getSalon(salonId),
    enabled: salonId > 0
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Salon not found</h2>
          <Link to="/search" className="btn-primary">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Only show BIO Diamond services if the salon itself is BIO Diamond certified
  const bioServices = salon.is_bio_diamond ? (salon.services?.filter(service => service.is_bio_diamond) || []) : [];
  const regularServices = salon.services?.filter(service => !service.is_bio_diamond) || [];

  const formatAddress = () => {
    const parts = [];
    if (salon.rua) parts.push(salon.rua);
    if (salon.porta) parts.push(salon.porta);
    if (salon.cidade) parts.push(salon.cidade);
    if (salon.cod_postal) parts.push(salon.cod_postal);
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link to="/search" className="hover:text-blue-600">Search</Link>
            <span>/</span>
            <span className="text-gray-900">{salon.nome}</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-2">
            <SalonImageGallery 
              images={salon.images || []} 
              salonName={salon.nome}
              className="mb-6"
            />

            {/* About Section */}
            {salon.about && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {salon.nome}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {salon.about}
                </p>
              </div>
            )}

            {/* Services */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>
              
              {bioServices.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">BIO Diamond Services</h3>
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium ml-2">
                      PREMIUM
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bioServices.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <span className="text-lg font-semibold text-blue-600">
                            €{service.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {regularServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Regular Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {regularServices.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <span className="text-lg font-semibold text-blue-600">
                            €{service.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {salon.services?.length === 0 && (
                <p className="text-gray-500 text-center py-8">No services available at this time.</p>
              )}
            </div>

            {/* Reviews Section */}
            <ReviewSection 
              salonId={salonId} 
              reviewSummary={salon.reviews || { average_rating: 0, total_reviews: 0 }}
            />
          </div>

          {/* Right Column - Salon Info & Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Salon Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{salon.nome}</h1>
                  {salon.is_bio_diamond && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      BIO Diamond
                    </span>
                  )}
                </div>

                {/* Rating */}
                {salon.reviews && salon.reviews.total_reviews > 0 && (
                  <div className="flex items-center mb-4">
                    <StarRating rating={salon.reviews.average_rating} size="sm" />
                    <span className="ml-2 text-sm text-gray-600">
                      {salon.reviews.average_rating.toFixed(1)} ({salon.reviews.total_reviews} reviews)
                    </span>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {salon.cidade}, {salon.regiao}
                      </p>
                      {formatAddress() && (
                        <p className="text-sm text-gray-600">{formatAddress()}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  {salon.telefone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <a 
                        href={`tel:${salon.telefone}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {salon.telefone}
                      </a>
                    </div>
                  )}

                  {salon.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <a 
                        href={`mailto:${salon.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {salon.email}
                      </a>
                    </div>
                  )}

                  {salon.website && (
                    <div className="flex items-center">
                      <ExternalLink className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <a 
                        href={salon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {salon.booking_enabled !== false ? (
                    <Link
                      to={`/book/${salon.id}`}
                      className="w-full btn-primary text-center flex items-center justify-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Link>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-500 text-center py-3 px-4 rounded-lg">
                      Booking not available
                    </div>
                  )}

                  {salon.latitude && salon.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${salon.latitude},${salon.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-secondary text-center flex items-center justify-center"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Services</span>
                    <span className="text-sm font-medium text-gray-900">
                      {salon.services?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reviews</span>
                    <span className="text-sm font-medium text-gray-900">
                      {salon.reviews?.total_reviews || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">BIO Diamond</span>
                    <span className="text-sm font-medium text-gray-900">
                      {salon.is_bio_diamond ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booking</span>
                    <span className="text-sm font-medium text-gray-900">
                      {salon.booking_enabled !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonDetailsWithImages;
