import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, User, Phone, Mail, Check, AlertCircle } from 'lucide-react';
import { salonAPI, bookingAPI } from '../utils/api';
// Inline types to avoid import issues
interface BookingRequest {
  salon_id: number;
  service_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  booking_date: string;
  booking_time: string;
}

const BookingPage: React.FC = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const salonIdNum = parseInt(salonId || '0');
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingError, setBookingError] = useState<string>('');

  const { data: salon, isLoading } = useQuery({
    queryKey: ['salon', salonIdNum],
    queryFn: () => salonAPI.getSalon(salonIdNum),
    enabled: salonIdNum > 0
  });

  // Fetch available time slots based on selected date and service
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', salonIdNum, selectedDate, selectedService],
    queryFn: () => salonAPI.getAvailability(salonIdNum, selectedDate, selectedService || undefined),
    enabled: !!selectedDate && salonIdNum > 0 && selectedService !== null
  });

  const timeSlots = availabilityData?.time_slots || [];
  const availableSlots = availabilityData?.available_slots || [];

  // Function to check if a slot should be highlighted based on selected time and service duration
  const isSlotHighlighted = (slotTime: string) => {
    if (!selectedTime || !selectedService) return false;
    
    const selectedServiceData = salon?.services?.find(s => s.id === selectedService);
    if (!selectedServiceData) return false;
    
    const duration = selectedServiceData.duration;
    const selectedTimeMinutes = timeToMinutes(selectedTime);
    const slotTimeMinutes = timeToMinutes(slotTime);
    
    // Check if this slot is within the service duration from the selected start time
    return slotTimeMinutes >= selectedTimeMinutes && 
           slotTimeMinutes < selectedTimeMinutes + duration;
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const createBookingMutation = useMutation({
    mutationFn: (bookingData: BookingRequest) => bookingAPI.createBooking(bookingData),
    onSuccess: () => {
      setShowConfirmation(true);
      setBookingError('');
      // Invalidate availability query to refresh available slots
      queryClient.invalidateQueries({ queryKey: ['availability', salonIdNum, selectedDate] });
    },
    onError: (error: any) => {
      setBookingError(error.response?.data?.error || 'Failed to create booking. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime && selectedService && customerInfo.name && customerInfo.email && customerInfo.phone) {
      const bookingData: BookingRequest = {
        salon_id: salonIdNum,
        service_id: selectedService,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        booking_date: selectedDate,
        booking_time: selectedTime
      };
      
      createBookingMutation.mutate(bookingData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!salon) {
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

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-2">
            <Link to="/" className="btn-primary w-full">
              Back to Home
            </Link>
            <Link to={`/salon/${salon.id}`} className="btn-secondary w-full">
              View Salon Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <h2 className="text-xl text-gray-600">{salon.nome}</h2>
          <p className="text-gray-500">{salon.cidade}, {salon.regiao}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Your Appointment</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {bookingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Booking Error</h3>
                    <p className="text-sm text-red-700 mt-1">{bookingError}</p>
                  </div>
                </div>
              )}
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service
                </label>
                <div className="space-y-2">
                  {salon.services?.map((service) => (
                    <label key={service.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={selectedService === service.id}
                        onChange={(e) => setSelectedService(parseInt(e.target.value))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-blue-600">€{service.price}</p>
                            <p className="text-xs text-gray-500">{service.duration} min</p>
                          </div>
                        </div>
                        {service.is_bio_diamond && (
                          <span className="inline-block mt-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            BIO Diamond
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(''); // Clear selected time when date changes
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                {!selectedDate ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Please select a date first</p>
                  </div>
                ) : availabilityLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading available times...</p>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : isSlotHighlighted(slot.time)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        title={!slot.available ? 'This time slot is already booked' : ''}
                      >
                        <div className="flex flex-col items-center">
                          <span>{slot.time}</span>
                          {!slot.available && (
                            <span className="text-xs text-gray-400 mt-1">Booked</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No available time slots for this date</p>
                    <p className="text-xs text-gray-400 mt-1">Please select a different date</p>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Your Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || !selectedService || !customerInfo.name || !customerInfo.email || !customerInfo.phone || createBookingMutation.isPending}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBookingMutation.isPending ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Salon Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Salon Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">{salon.nome}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600">{salon.rua} {salon.porta}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600">{salon.cidade}, {salon.regiao}</span>
                </div>
                {salon.telefone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <a href={`tel:${salon.telefone}`} className="text-gray-600 hover:text-blue-600">
                      {salon.telefone}
                    </a>
                  </div>
                )}
                {salon.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <a href={`mailto:${salon.email}`} className="text-gray-600 hover:text-blue-600">
                      {salon.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            {(selectedDate || selectedTime || selectedService) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  {selectedService && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {salon.services?.find(s => s.id === selectedService)?.name}
                      </span>
                      <span className="font-semibold">
                        €{salon.services?.find(s => s.id === selectedService)?.price}
                      </span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-semibold">{selectedDate}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-semibold">{selectedTime}</span>
                    </div>
                  )}
                  {selectedService && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">
                        {salon.services?.find(s => s.id === selectedService)?.duration} min
                      </span>
                    </div>
                  )}
                  <hr className="my-3" />
                  {selectedService && (
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>€{salon.services?.find(s => s.id === selectedService)?.price}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;