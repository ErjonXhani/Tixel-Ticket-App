
// API service for connecting to PHP backend

// Base API URL (change to your XAMPP localhost URL)
const API_BASE_URL = 'http://localhost/tixel-api';

// Helper for making API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Default headers for JSON API
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Get token from storage if available
    const storedUser = localStorage.getItem('tixel_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Check if response is OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Parse JSON if response is not empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return true;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API methods
export const api = {
  // Auth methods
  auth: {
    login: (email: string, password: string) => 
      apiRequest('/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
      
    signup: (name: string, email: string, password: string) =>
      apiRequest('/signup.php', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
  },
  
  // Event methods
  events: {
    getAll: () => apiRequest('/events.php'),
    
    getById: (id: string | number) => apiRequest(`/events.php?id=${id}`),
    
    create: (eventData: any) => 
      apiRequest('/events.php', {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),
      
    update: (id: string | number, eventData: any) =>
      apiRequest('/events.php', {
        method: 'PUT',
        body: JSON.stringify({ id, ...eventData }),
      }),
      
    delete: (id: string | number) =>
      apiRequest('/events.php', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      }),
  },
  
  // Ticket methods
  tickets: {
    purchase: (eventId: string | number, quantity: number, ticketType: string) =>
      apiRequest('/tickets.php', {
        method: 'POST',
        body: JSON.stringify({ eventId, quantity, ticketType }),
      }),
      
    getUserTickets: () => apiRequest('/tickets.php?user=true'),
  },
};

export default api;
