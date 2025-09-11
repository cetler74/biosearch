import axios from 'axios';

// Auth types
interface User {
  id: number;
  email: string;
  name: string;
  customer_id?: string;
  token?: string;
  is_admin?: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  customer_id: string;
}

interface AuthResponse {
  id: number;
  email: string;
  name: string;
  customer_id?: string;
  token: string;
  is_admin?: boolean;
}

// Temporary inline types to avoid import issues
interface SalonImage {
  id: number;
  salon_id: number;
  image_url: string;
  image_alt?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

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
  images?: SalonImage[];
  reviews?: {
    average_rating: number;
    total_reviews: number;
  };
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

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailabilityResponse {
  available_slots: string[];
  time_slots: TimeSlot[];
}

// Dynamically determine API URL based on current hostname
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Otherwise, use the current hostname with port 5001
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5001/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Current location:', window.location.href);
console.log('Hostname:', window.location.hostname);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url);
    console.log('Full URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.status, error.response?.statusText, error.config?.url);
    console.error('Error details:', error.message);
    return Promise.reject(error);
  }
);

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
    if (filters.bio_diamond) params.append('bio_diamond', 'true');
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const url = `/salons?${params.toString()}`;
    
    // Debug logging
    if (filters.search) {
      console.log('API call with search:', filters.search);
      console.log('Full URL:', url);
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single salon with services
  getSalon: async (id: number): Promise<Salon> => {
    const response = await api.get(`/salons/${id}`);
    return response.data;
  },

  // Get available time slots for a salon on a specific date
  getAvailability: async (salonId: number, date: string, serviceId?: number): Promise<AvailabilityResponse> => {
    let url = `/salons/${salonId}/availability?date=${date}`;
    if (serviceId) {
      url += `&service_id=${serviceId}`;
    }
    const response = await api.get(url);
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

  // Create booking (for managers)
  createBooking: async (bookingData: any): Promise<{ id: number; message: string }> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (bookingId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/manager/bookings/${bookingId}`);
    return response.data;
  },

  // Get salon opening hours
  getOpeningHours: async (salonId: number): Promise<{ opening_hours: any }> => {
    const response = await api.get(`/manager/salons/${salonId}/opening-hours`);
    return response.data;
  },

  // Update salon opening hours
  updateOpeningHours: async (salonId: number, openingHours: any): Promise<{ message: string }> => {
    const response = await api.put(`/manager/salons/${salonId}/opening-hours`, { opening_hours: openingHours });
    return response.data;
  },

  // Update salon basic information
  updateSalon: async (salonId: number, salonData: any): Promise<{ message: string }> => {
    const response = await api.put(`/manager/salons/${salonId}`, salonData);
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

// Admin API types
interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  salon_count: number;
  created_at: string;
}

interface AdminSalon {
  id: number;
  nome: string;
  cidade: string;
  regiao: string;
  telefone?: string;
  email?: string;
  estado: string;
  booking_enabled: boolean;
  is_active: boolean;
  is_bio_diamond: boolean;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

interface AdminStats {
  users: {
    total: number;
    active: number;
    admins: number;
  };
  salons: {
    total: number;
    active: number;
    booking_enabled: number;
  };
  bookings: {
    total: number;
    recent_week: number;
  };
}

export const adminAPI = {
  // Get all users with pagination
  getUsers: async (page = 1, perPage = 20): Promise<{
    users: AdminUser[];
    total: number;
    pages: number;
    current_page: number;
  }> => {
    const response = await api.get(`/admin/users?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  // Get user details with salons
  getUserDetails: async (userId: number): Promise<{
    user: AdminUser;
    salons: AdminSalon[];
  }> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (userId: number): Promise<{
    message: string;
    is_active: boolean;
  }> => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  // Get all salons with pagination
  getSalons: async (page = 1, perPage = 20): Promise<{
    salons: AdminSalon[];
    total: number;
    pages: number;
    current_page: number;
  }> => {
    const response = await api.get(`/admin/salons?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  // Toggle salon booking status
  toggleSalonBooking: async (salonId: number): Promise<{
    message: string;
    booking_enabled: boolean;
  }> => {
    const response = await api.put(`/admin/salons/${salonId}/toggle-booking`);
    return response.data;
  },

  // Toggle salon status
  toggleSalonStatus: async (salonId: number): Promise<{
    message: string;
    is_active: boolean;
  }> => {
    const response = await api.put(`/admin/salons/${salonId}/toggle-status`);
    return response.data;
  },

  // Toggle salon BIO Diamond status
  toggleSalonBioDiamond: async (salonId: number): Promise<{
    message: string;
    is_bio_diamond: boolean;
  }> => {
    const response = await api.put(`/admin/salons/${salonId}/toggle-bio-diamond`);
    return response.data;
  },

  // Get admin dashboard statistics
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

// Image Management API
export const imageAPI = {
  // Get all images for a salon
  getSalonImages: async (salonId: number): Promise<{ images: SalonImage[] }> => {
    const response = await api.get(`/salons/${salonId}/images`);
    return response.data;
  },

  // Add a new image to a salon
  addSalonImage: async (salonId: number, imageData: {
    image_url: string;
    image_alt?: string;
    is_primary?: boolean;
    display_order?: number;
  }): Promise<SalonImage> => {
    const response = await api.post(`/salons/${salonId}/images`, imageData);
    return response.data;
  },

  // Update a salon image
  updateSalonImage: async (salonId: number, imageId: number, imageData: {
    image_url?: string;
    image_alt?: string;
    is_primary?: boolean;
    display_order?: number;
  }): Promise<SalonImage> => {
    const response = await api.put(`/salons/${salonId}/images/${imageId}`, imageData);
    return response.data;
  },

  // Delete a salon image
  deleteSalonImage: async (salonId: number, imageId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/salons/${salonId}/images/${imageId}`);
    return response.data;
  },
};

export default api;
