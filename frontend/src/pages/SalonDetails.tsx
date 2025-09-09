import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Mail, ExternalLink, Clock, Star } from 'lucide-react';
import { salonAPI } from '../utils/api';

const SalonDetails: React.FC = () => {
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

  const bioServices = salon.services?.filter(service => service.is_bio_diamond) || [];
  const regularServices = salon.services?.filter(service => !service.is_bio_diamond) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{salon.nome}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{salon.cidade}, {salon.regiao}</span>
              </div>
              <div className="flex items-center space-x-1 text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-sm text-gray-600">4.5 (127 reviews)</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/book/${salon.id}`}
                className="btn-primary text-center"
              >
                Book Appointment
              </Link>
              <button className="btn-secondary">
                Save Salon
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4">
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
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4">
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

              {(!salon.services || salon.services.length === 0) && (
                <p className="text-gray-600">No services listed for this salon.</p>
              )}
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Salon</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to {salon.nome}, your premier destination for professional nail care services. 
                We specialize in Bio Sculpture treatments and offer a wide range of nail services 
                to keep your nails healthy and beautiful.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {salon.telefone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <a 
                      href={`tel:${salon.telefone}`}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      {salon.telefone}
                    </a>
                  </div>
                )}
                
                {salon.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <a 
                      href={`mailto:${salon.email}`}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      {salon.email}
                    </a>
                  </div>
                )}
                
                {salon.website && (
                  <div className="flex items-center">
                    <ExternalLink className="h-5 w-5 text-gray-400 mr-3" />
                    <a 
                      href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="text-gray-600">
                {salon.rua && <p>{salon.rua} {salon.porta}</p>}
                <p>{salon.cidade}</p>
                {salon.cod_postal && <p>{salon.cod_postal}</p>}
                <p>{salon.regiao}</p>
              </div>
              
              {salon.latitude && salon.longitude && (
                <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map integration coming soon</p>
                </div>
              )}
            </div>

            {/* Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday</span>
                  <span className="text-gray-900">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuesday</span>
                  <span className="text-gray-900">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wednesday</span>
                  <span className="text-gray-900">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thursday</span>
                  <span className="text-gray-900">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Friday</span>
                  <span className="text-gray-900">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="text-gray-900">10:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="text-gray-900">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonDetails;