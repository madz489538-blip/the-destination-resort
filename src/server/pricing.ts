import { db } from './db.js';
import { PriceBreakdown } from '../types/resort.js';

export function calculateStayPrice(params: {
  roomTypeId: string;
  checkInDate: string;  // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  roomsCount: number;
  adults: number;
  children: number;
  selectedAddons?: Array<{ id: string; quantity?: number }>;
  promoCode?: string;
}): { error?: string; breakdown?: PriceBreakdown } {
  const {
    roomTypeId,
    checkInDate,
    checkOutDate,
    roomsCount,
    adults,
    children,
    selectedAddons = [],
    promoCode = '',
  } = params;

  // Date parsing & validation
  const start = new Date(checkInDate + 'T00:00:00Z');
  const end = new Date(checkOutDate + 'T00:00:00Z');

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: 'Invalid dates provided.' };
  }

  const diffTime = end.getTime() - start.getTime();
  const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    return { error: 'Check-out date must be after check-in date.' };
  }

  // Load Settings
  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get() as any;
  if (!settings) {
    return { error: 'Site settings not initialized.' };
  }

  if (nights < settings.min_stay_nights) {
    return { error: `Minimum stay requirement is ${settings.min_stay_nights} night(s).` };
  }
  if (nights > settings.max_stay_nights) {
    return { error: `Maximum stay limit is ${settings.max_stay_nights} nights.` };
  }

  // Load Room Type
  const roomType = db.prepare('SELECT * FROM room_types WHERE id = ?').get(roomTypeId) as any;
  if (!roomType) {
    return { error: 'Room type not found.' };
  }

  const totalGuests = adults + children;
  const maxPossibleOccupancy = roomType.max_occupancy * roomsCount;
  if (totalGuests > maxPossibleOccupancy) {
    return { error: `Guest count (${totalGuests}) exceeds the maximum occupancy (${maxPossibleOccupancy}) for ${roomsCount} room(s).` };
  }

  // Calculate day-by-day room rate (handling weekend rates)
  let baseRoomSubtotal = 0;
  let weekendSurcharge = 0;

  const baseRate = roomType.base_nightly_rate;
  const weekendRate = roomType.weekend_rate || baseRate;

  let current = new Date(start);
  for (let i = 0; i < nights; i++) {
    // 0 = Sunday, 5 = Friday, 6 = Saturday
    const dayOfWeek = current.getUTCDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    if (isWeekend && weekendRate > baseRate) {
      baseRoomSubtotal += baseRate * roomsCount;
      weekendSurcharge += (weekendRate - baseRate) * roomsCount;
    } else {
      baseRoomSubtotal += baseRate * roomsCount;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Extra guest charge (if guest count exceeds standard 2 guests per room)
  const standardCapacity = 2 * roomsCount;
  const extraGuests = Math.max(0, totalGuests - standardCapacity);
  const extraGuestCharges = extraGuests * (roomType.extra_guest_charge || 1200) * nights;

  // Addons calculation
  const addonsList: PriceBreakdown['addonsList'] = [];
  let addonsTotal = 0;

  if (selectedAddons.length > 0) {
    const addonIds = selectedAddons.map(a => a.id);
    const placeholders = addonIds.map(() => '?').join(',');
    const addonRows = db.prepare(`SELECT * FROM addons WHERE id IN (${placeholders}) AND is_active = 1`).all(...addonIds) as any[];

    for (const addon of addonRows) {
      const requested = selectedAddons.find(a => a.id === addon.id);
      const qty = Math.max(1, requested?.quantity || 1);

      let itemTotal = 0;
      if (addon.pricing_type === 'per_night') {
        itemTotal = addon.price * nights * qty;
      } else if (addon.pricing_type === 'per_guest') {
        itemTotal = addon.price * totalGuests * nights;
      } else {
        // per_stay
        itemTotal = addon.price * qty;
      }

      addonsTotal += itemTotal;
      addonsList.push({
        id: addon.id,
        name: addon.name,
        unitPrice: addon.price,
        quantity: qty,
        total: itemTotal,
      });
    }
  }

  // Promotional discount
  let discountAmount = 0;
  if (promoCode && promoCode.trim().toUpperCase() === 'DESTINATION10') {
    discountAmount = Math.round((baseRoomSubtotal + weekendSurcharge) * 0.10);
  }

  const taxableAmount = Math.max(0, baseRoomSubtotal + weekendSurcharge + extraGuestCharges + addonsTotal - discountAmount);
  const taxPercent = Number(settings.tax_percent) || 12.0;
  const taxAmount = Math.round((taxableAmount * taxPercent) / 100);
  const serviceFeePercent = Number(settings.service_fee_percent) || 2.5;
  const serviceFee = Math.round((taxableAmount * serviceFeePercent) / 100);

  const finalTotal = taxableAmount + taxAmount + serviceFee;

  return {
    breakdown: {
      nights,
      roomsCount,
      baseRoomRate: baseRate,
      roomSubtotal: baseRoomSubtotal,
      weekendSurcharge,
      extraGuestCharges,
      addonsList,
      addonsTotal,
      taxableAmount,
      taxPercent,
      taxAmount,
      serviceFee,
      discountAmount,
      finalTotal,
      currency: settings.currency || 'INR',
    },
  };
}
