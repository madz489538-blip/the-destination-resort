export type ReservationStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'COMPLETED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface RoomType {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  bedConfig: string;
  roomSizeSqft: number;
  amenities: string[];
  images: string[];
  published: boolean;
  baseNightlyRate: number;
  weekendRate?: number;
  extraGuestCharge: number;
}

export interface PhysicalRoom {
  id: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status: 'active' | 'maintenance' | 'inactive';
  notes?: string;
}

export interface RoomBlock {
  id: number;
  physicalRoomId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  createdAt: string;
}

export interface AddonItem {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: 'per_night' | 'per_guest' | 'per_stay';
  category: 'dining' | 'wellness' | 'transport' | 'experience';
  isActive: boolean;
}

export interface PriceBreakdown {
  nights: number;
  roomsCount: number;
  baseRoomRate: number;
  roomSubtotal: number;
  weekendSurcharge: number;
  extraGuestCharges: number;
  addonsList: Array<{
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
  addonsTotal: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  serviceFee: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
}

export interface Reservation {
  id: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomsCount: number;
  specialRequests?: string;
  status: ReservationStatus;
  isDemo: boolean;
  roomTypeId: string;
  roomTypeName?: string;
  assignedRooms?: string[];
  priceSnapshot: PriceBreakdown;
  holdExpiresAt?: string;
  paymentMethod?: string;
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  resortName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxPercent: number;
  serviceFeePercent: number;
  checkInTime: string;
  checkOutTime: string;
  minStayNights: number;
  maxStayNights: number;
  cancellationHoursPrior: number;
  refundPercentage: number;
  isDemoMode: boolean;
}

export interface GuestEnquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'RESPONDED' | 'ARCHIVED';
  createdAt: string;
}
