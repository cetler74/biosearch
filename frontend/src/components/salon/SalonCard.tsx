import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ExternalLink, Star } from 'lucide-react';
// Using inline types to avoid import issues
interface Salon {
  id: number;
  nome: string;
  cidade: string;
  regiao: string;
  telefone?: string;
  email?: string;
  website?: string;
  rua?: string;
  porta?: string;
  cod_postal?: string;
  latitude?: number;
  longitude?: number;
  services?: SalonService[];
}

interface SalonService {
  id: number;
  name: string;
  category: string;
  description: string;
  is_bio_diamond: boolean;
  price: number;
  duration: number;
}

interface SalonCardProps {
  salon: Salon;
  showServices?: boolean;
}

const SalonCard: React.FC<SalonCardProps> = ({ salon, showServices = false }) => {
  const formatAddress = () => {
    const parts = [];
    if (salon.rua) parts.push(salon.rua);
    if (salon.porta) parts.push(salon.porta);
    if (salon.cidade) parts.push(salon.cidade);
    if (salon.cod_postal) parts.push(salon.cod_postal);
    return parts.join(', ');
  };

  const bioServices = salon.services?.filter(service => service.is_bio_diamond);
  const hasBioServices = bioServices && bioServices.length > 0;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {salon.nome}
            </h3>
            {hasBioServices && (
              <span className="bg-secondary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                BIO Diamond
              </span>
            )}
          </div>
          
          {salon.cidade && salon.regiao && (
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {salon.cidade}, {salon.regiao}
              </span>
            </div>
          )}
          
          {formatAddress() && (
            <p className="text-sm text-gray-500 mb-3">
              {formatAddress()}
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
              className="text-sm text-gray-600 hover:text-primary-600"
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
              className="text-sm text-gray-600 hover:text-primary-600"
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
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              Website
            </a>
          </div>
        )}
      </div>

      {/* Services Preview */}
      {showServices && salon.services && salon.services.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Featured Services</h4>
          <div className="flex flex-wrap gap-1">
            {salon.services.slice(0, 3).map((service) => (
              <span
                key={service.id}
                className={`text-xs px-2 py-1 rounded-full ${
                  service.is_bio_diamond 
                    ? 'bg-secondary-100 text-secondary-800' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {service.name}
              </span>
            ))}
            {salon.services.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                +{salon.services.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Link 
          to={`/salon/${salon.id}`}
          className="flex-1 btn-primary text-center"
        >
          View Details
        </Link>
        <Link 
          to={`/book/${salon.id}`}
          className="flex-1 btn-secondary text-center"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default SalonCard;
