const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const req = async (method, path, body) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}/bookings${path}`, options);
  const data = await res.json();

  // Check for new badges in the response (from first file)
  if (data && data.newBadges && data.newBadges.length > 0) {
    import('../components/badges/BadgeToast').then(({ showBadgeToast }) => {
      showBadgeToast(data.newBadges);
    });
  }

  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const createBooking  = (payload)   => req('POST',   '/',               payload);
export const getMyBookings  = ()          => req('GET',    '/my');
export const cancelBooking  = (bookingId) => req('PATCH',  `/${bookingId}/cancel`);
export const getBookingById = (bookingId) => req('GET',    `/${bookingId}`);
export const deleteBooking  = (bookingId) => req('DELETE', `/${bookingId}`);