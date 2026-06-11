export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  category: string;
  experience: number;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  distance: number;
  availability: 'Available' | 'Busy' | 'Offline';
  hourlyRate: number;
  dailyRate: number;
  verified: boolean;
  phone: string;
  email: string;
  skills: string[];
  certifications: string[];
  bio: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  locality?: string;
  specialties?: string[];
  calendarSlots: string[];
}

export interface Booking {
  id: string;
  userId?: string;
  workerId: string;
  workerName: string;
  workerCategory: string;
  workerAvatar: string;
  date: string;
  time: string;
  duration: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled';
  address: string;
}

export interface JobRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  earnings: number;
  address: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface Complaint {
  id: string;
  ticketId: string;
  userType: 'User' | 'Worker';
  reporterName: string;
  subject: string;
  description: string;
  date: string;
  status: 'Open' | 'Resolved' | 'In Progress';
}

export const CATEGORIES = [
  { id: 'babysitter', name: 'Babysitter', icon: 'Baby', description: 'Nannies and babysitters for all age groups' },
  { id: 'elderly_care', name: 'Elderly Care', icon: 'HeartPulse', description: 'Experienced caregivers and patient attendants' },
  { id: 'house_help', name: 'House Help', icon: 'Home', description: 'Daily helpers, cleaning, and laundry services' },
  { id: 'cook', name: 'Cook', icon: 'Utensils', description: 'Home chefs and meal prep experts' },
  { id: 'driver', name: 'Driver', icon: 'Car', description: 'Personal chauffeurs and on-demand drivers' },
  { id: 'plumber', name: 'Plumber', icon: 'Wrench', description: 'Leaking pipes, installs, and emergency plumbing' },
  { id: 'electrician', name: 'Electrician', icon: 'Zap', description: 'Wiring, fixtures, and emergency electrical fixes' },
  { id: 'cleaner', name: 'Cleaner', icon: 'Sparkles', description: 'Deep home and office sanitization experts' }
];
