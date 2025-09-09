import axios from 'axios';

// Auth types
interface User {
  id: number;
  email: string;
  name: string;
  token?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  id: number;
  email: string;
  name: string;
  token: string;
}

// Temporary inline types to avoid import issues
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

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  is_bio_diamond: boolean;
}

interface SearchFilters {
  search?: string;
  cidade?: string;
  regiao?: string;
  bio_diamond?: boolean;
}

interface SearchResults {
  salons: Salon[];
  total: number;
  pages: number;
  current_page: number;
}

interface BookingRequest {
  salon_id: number;
  service_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  booking_date: string;
  booking_time: string;
}

interface Booking extends BookingRequest {
  id: number;
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

interface AvailabilityResponse {
  available_slots: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const salonAPI = {
  // Get salons with filters and pagination
  getSalons: async (filters: SearchFilters = {}, page = 1, perPage = 20): Promise<SearchResults> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.cidade) params.append('cidade', filters.cidade);
    if (filters.regiao) params.append('regiao', filters.regiao);
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const response = await api.get(`/salons?${params.toString()}`);
    return response.data;
  },

  // Get single salon with services
  getSalon: async (id: number): Promise<Salon> => {
    const response = await api.get(`/salons/${id}`);
    return response.data;
  },

  // Get available time slots for a salon on a specific date
  getAvailability: async (salonId: number, date: string): Promise<AvailabilityResponse> => {
    const response = await api.get(`/salons/${salonId}/availability?date=${date}`);
    return response.data;
  },
};

export const serviceAPI = {
  // Get all services
  getServices: async (bioDiamondOnly = false): Promise<Service[]> => {
    const params = bioDiamondOnly ? '?bio_diamond=true' : '';
    const response = await api.get(`/services${params}`);
    return response.data;
  },
};

export const bookingAPI = {
  // Create a new booking
  createBooking: async (booking: BookingRequest): Promise<{ id: number; message: string }> => {
    const response = await api.post('/bookings', booking);
    return response.data;
  },

  // Get booking details
  getBooking: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
};

export const authAPI = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const managerAPI = {
  // Get manager's salons
  getManagerSalons: async (): Promise<Salon[]> => {
    const response = await api.get('/manager/salons');
    return response.data;
  },

  // Create new salon
  createSalon: async (salonData: any): Promise<{ id: number; nome: string; message: string }> => {
    const response = await api.post('/manager/salons', salonData);
    return response.data;
  },

  // Get salon bookings
  getSalonBookings: async (salonId: number): Promise<Booking[]> => {
    const response = await api.get(`/manager/salons/${salonId}/bookings`);
    return response.data;
  },

  // Get salon services
  getSalonServices: async (salonId: number): Promise<SalonService[]> => {
    const response = await api.get(`/manager/salons/${salonId}/services`);
    return response.data;
  },

  // Add service to salon
  addSalonService: async (salonId: number, serviceData: any): Promise<{ id: number; message: string }> => {
    const response = await api.post(`/manager/salons/${salonId}/services`, serviceData);
    return response.data;
  },

  // Update salon service
  updateSalonService: async (salonId: number, serviceId: number, serviceData: any): Promise<{ message: string }> => {
    const response = await api.put(`/manager/salons/${salonId}/services/${serviceId}`, serviceData);
    return response.data;
  },

  // Delete salon service
  deleteSalonService: async (salonId: number, serviceId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/manager/salons/${salonId}/services/${serviceId}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId: number, status: string): Promise<{ message: string }> => {
    const response = await api.put(`/manager/bookings/${bookingId}/status`, { status });
    return response.data;
  },
};

export const healthAPI = {
  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
