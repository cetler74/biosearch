import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (location.trim()) params.append('cidade', location.trim());
    
    navigate(`/search?${params.toString()}`);
  };

  const popularCities = [
    'Lisboa', 'Porto', 'Coimbra', 'Braga', 'Aveiro', 'Faro'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Bio Sculpture Style */}
      <section className="relative py-20 bg-white overflow-hidden">
        {/* Background Image with Fade */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
              filter: 'brightness(0.9) contrast(1.0)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/60 to-white/50" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto container-padding">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Salon Finder
            </h1>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Looking for a Bio Sculpture Gel Manicure near you? Use our salon finder to locate your closest nail technician.
            </p>

            {/* Search Form - Clean and Simple */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Find Salons
                </button>
              </div>
            </form>

            {/* Popular Cities */}
            <div className="mb-12">
              <p className="text-gray-600 mb-4">Popular locations:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularCities.map((city) => (
                  <Link
                    key={city}
                    to={`/search?cidade=${encodeURIComponent(city)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIO Diamond Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            BIO Diamond Services
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the premium Bio Sculpture gel nail treatments. Our certified salons offer 
            the complete range of BIO Diamond services for long-lasting, natural-looking nails.
          </p>
          <Link
            to="/bio-diamond"
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200 inline-block"
          >
            Find BIO Diamond Salons
          </Link>
        </div>
      </section>

      {/* Concierge Service Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Can't find a tech in your area?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Try our Concierge Service - facilitating quick and simple bookings for Bio Sculpture manicures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200"
            >
              Browse All Salons
            </Link>
            <Link
              to="/manager"
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-medium text-lg border border-gray-300 transition-colors duration-200"
            >
              List Your Salon
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1,181+</div>
              <div className="text-gray-600">Verified Salons</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
              <div className="text-gray-600">Service Types</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">7</div>
              <div className="text-gray-600">BIO Diamond Services</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;