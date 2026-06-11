import type { Worker, Booking, Complaint, Review } from './mockData';

const BASE_URL = '/api';

export const api = {
  // Workers
  async getWorkers(): Promise<Worker[]> {
    const res = await fetch(`${BASE_URL}/workers`);
    if (!res.ok) throw new Error('Failed to fetch workers');
    return res.json();
  },

  async getWorkerById(id: string): Promise<Worker> {
    const res = await fetch(`${BASE_URL}/workers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch worker details');
    return res.json();
  },

  async verifyWorker(id: string, verified: boolean): Promise<void> {
    const res = await fetch(`${BASE_URL}/workers/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified })
    });
    if (!res.ok) throw new Error('Failed to update verification');
  },

  async getUnverifiedWorkers(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/workers/unverified`);
    if (!res.ok) throw new Error('Failed to fetch unverified workers');
    return res.json();
  },

  async getAdminStats(): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/bookings`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/bookings/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user bookings');
    return res.json();
  },

  async getWorkerBookings(workerId: string): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/bookings/worker/${workerId}`);
    if (!res.ok) throw new Error('Failed to fetch worker bookings');
    return res.json();
  },

  async createBooking(booking: Partial<Booking>): Promise<string> {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    if (!res.ok) throw new Error('Failed to create booking');
    const data = await res.json();
    return data.bookingId;
  },

  async updateBookingStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update booking status');
  },

  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    const res = await fetch(`${BASE_URL}/complaints`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async createComplaint(complaint: Partial<Complaint>): Promise<string> {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint)
    });
    if (!res.ok) throw new Error('Failed to file complaint');
    const data = await res.json();
    return data.ticketId;
  },

  async updateComplaintStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/complaints/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update complaint status');
  },

  // Reviews
  async getWorkerReviews(workerId: string): Promise<Review[]> {
    const res = await fetch(`${BASE_URL}/reviews/worker/${workerId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async createReview(review: Partial<Review> & { workerId: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) throw new Error('Failed to create review');
  },

  // Auth
  async login(email: string, password: string, role?: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) {
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const err = isJson ? await res.json() : { error: 'Backend server is unreachable' };
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(user: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) {
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const err = isJson ? await res.json() : { error: 'Backend server is unreachable' };
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  }
};
