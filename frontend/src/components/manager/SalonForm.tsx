import React, { useState } from 'react';
import { managerAPI } from '../../utils/api';
import { X, MapPin, Phone, Mail, Globe, Building } from 'lucide-react';

interface SalonFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SalonForm: React.FC<SalonFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    regiao: '',
    telefone: '',
    email: '',
    website: '',
    rua: '',
    porta: '',
    cod_postal: '',
    pais: 'Portugal',
    about: 'Welcome to our salon! We specialize in professional nail care, beauty treatments, and exceptional customer service. Our experienced team is dedicated to providing you with the highest quality services in a relaxing and comfortable environment. We use only premium products and the latest techniques to ensure you leave feeling beautiful and refreshed. Book your appointment today and experience the difference!',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting salon data:', formData); // Debug log
      await managerAPI.createSalon(formData);
      // Reset form data after successful submission
      setFormData({
        nome: '',
        cidade: '',
        regiao: '',
        telefone: '',
        email: '',
        website: '',
        rua: '',
        porta: '',
        cod_postal: '',
        pais: 'Portugal',
        about: 'Welcome to our salon! We specialize in professional nail care, beauty treatments, and exceptional customer service. Our experienced team is dedicated to providing you with the highest quality services in a relaxing and comfortable environment. We use only premium products and the latest techniques to ensure you leave feeling beautiful and refreshed. Book your appointment today and experience the difference!',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create salon';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Salon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salon Name */}
            <div className="md:col-span-2">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-2" />
                Salon Name *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter salon name"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                City *
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                required
                value={formData.cidade}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter city"
              />
            </div>

            {/* Region */}
            <div>
              <label htmlFor="regiao" className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <input
                type="text"
                id="regiao"
                name="regiao"
                required
                value={formData.regiao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter region"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone *
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                required
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter website URL"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="pais" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Portugal">Portugal</option>
                <option value="Spain">Spain</option>
                <option value="France">France</option>
                <option value="Italy">Italy</option>
              </select>
            </div>

            {/* Street */}
            <div>
              <label htmlFor="rua" className="block text-sm font-medium text-gray-700 mb-2">
                Street
              </label>
              <input
                type="text"
                id="rua"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter street name"
              />
            </div>

            {/* Door Number */}
            <div>
              <label htmlFor="porta" className="block text-sm font-medium text-gray-700 mb-2">
                Door Number
              </label>
              <input
                type="text"
                id="porta"
                name="porta"
                value={formData.porta}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter door number"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="cod_postal" className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                id="cod_postal"
                name="cod_postal"
                value={formData.cod_postal}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter postal code"
              />
            </div>
          </div>

          {/* About Section */}
          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
              About Your Salon
            </label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              placeholder="Customize this text to describe your salon..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will be displayed on your salon's public page
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Salon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalonForm;
