import { db } from './db.js';
import crypto from 'node:crypto';
import { calculateStayPrice } from './pricing.js';
import { ReservationStatus } from '../types/resort.js';

// Clean expired holds (releases locked rooms for other guests)
export function cleanupExpiredHolds() {
  const nowStr = new Date().toISOString();
  db.prepare(`
    UPDATE reservations
    SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
    WHERE status IN ('PENDING', 'PAYMENT_PENDING')
      AND hold_expires_at IS NOT NULL
      AND hold_expires_at < ?
  `).run(nowStr);
}

// Find available physical rooms for a given room type and date range
export function getAvailablePhysicalRooms(
  roomTypeId: string,
  checkInDate: string,
  checkOutDate: string
): Array<{ id: string; roomNumber: string }> {
  cleanupExpiredHolds();

  // Query physical rooms that are NOT blocked and NOT reserved on overlapping dates
  const available = db.prepare(`
    SELECT pr.id, pr.room_number as roomNumber
    FROM physical_rooms pr
    WHERE pr.room_type_id = ?
      AND pr.status = 'active'
      -- Exclude rooms with maintenance blocks overlapping [checkIn, checkOut)
      AND pr.id NOT IN (
        SELECT rb.physical_room_id
        FROM room_blocks rb
        WHERE rb.start_date < ? AND rb.end_date > ?
      )
      -- Exclude rooms with active overlapping reservations
      AND pr.id NOT IN (
        SELECT rr.physical_room_id
        FROM reservation_rooms rr
        JOIN reservations res ON res.id = rr.reservation_id
        WHERE res.status IN ('CONFIRMED', 'PENDING', 'PAYMENT_PENDING')
          AND res.check_in_date < ?
          AND res.check_out_date > ?
      )
  `).all(roomTypeId, checkOutDate, checkInDate, checkOutDate, checkInDate) as Array<{ id: string; roomNumber: string }>;

  return available;
}

// Get availability overview for all published room types for given search params
export function searchRoomAvailability(params: {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomsCount: number;
}) {
  cleanupExpiredHolds();
  const { checkInDate, checkOutDate, adults, children, roomsCount } = params;

  // Validation
  const start = new Date(checkInDate + 'T00:00:00Z');
  const end = new Date(checkOutDate + 'T00:00:00Z');
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: 'Please enter valid check-in and check-out dates.' };
  }
  if (start < now) {
    return { error: 'Check-in date cannot be in the past.' };
  }
  if (end <= start) {
    return { error: 'Check-out date must be after check-in date.' };
  }

  const roomTypes = db.prepare(`
    SELECT * FROM room_types WHERE published = 1 ORDER BY base_nightly_rate ASC
  `).all() as any[];

  const results = roomTypes.map((rt) => {
    const availableRooms = getAvailablePhysicalRooms(rt.id, checkInDate, checkOutDate);
    const availableCount = availableRooms.length;
    const isAvailable = availableCount >= roomsCount && (adults + children) <= (rt.max_occupancy * roomsCount);

    const priceCalc = calculateStayPrice({
      roomTypeId: rt.id,
      checkInDate,
      checkOutDate,
      roomsCount,
      adults,
      children,
    });

    return {
      roomType: {
        id: rt.id,
        name: rt.name,
        shortDesc: rt.short_desc,
        description: rt.description,
        maxAdults: rt.max_adults,
        maxChildren: rt.max_children,
        maxOccupancy: rt.max_occupancy,
        bedConfig: rt.bed_config,
        roomSizeSqft: rt.room_size_sqft,
        amenities: JSON.parse(rt.amenities || '[]'),
        images: JSON.parse(rt.images || '[]'),
        published: Boolean(rt.published),
        baseNightlyRate: rt.base_nightly_rate,
        weekendRate: rt.weekend_rate,
        extraGuestCharge: rt.extra_guest_charge,
      },
      availableCount,
      isAvailable,
      unavailabilityReason: !isAvailable
        ? (availableCount < roomsCount
            ? `Only ${availableCount} room(s) available for selected dates (requested ${roomsCount}).`
            : `Exceeds max occupancy of ${rt.max_occupancy * roomsCount} guests.`)
        : null,
      pricing: priceCalc.breakdown,
    };
  });

  return { results };
}

// Generate unique booking reference: TDR-2026-XXXXXX
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  const ref = `TDR-2026-${code}`;

  // Ensure uniqueness
  const exists = db.prepare('SELECT id FROM reservations WHERE booking_reference = ?').get(ref);
  if (exists) {
    return generateBookingReference();
  }
  return ref;
}

// Create a reservation with inventory hold atomically
export function createReservationHold(params: {
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  roomsCount: number;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  selectedAddons?: Array<{ id: string; quantity?: number }>;
  paymentMethod: string;
  isDemo?: boolean;
}): { error?: string; reservation?: any } {
  const {
    roomTypeId,
    checkInDate,
    checkOutDate,
    roomsCount,
    adults,
    children,
    guestName,
    guestEmail,
    guestPhone,
    specialRequests,
    selectedAddons,
    paymentMethod,
    isDemo = true,
  } = params;

  // Basic validation
  if (!guestName || guestName.trim().length < 2) {
    return { error: 'Please provide a valid guest full name.' };
  }
  if (!guestEmail || !guestEmail.includes('@')) {
    return { error: 'Please provide a valid guest email address.' };
  }
  if (!guestPhone || guestPhone.trim().length < 7) {
    return { error: 'Please provide a valid guest phone number.' };
  }

  // Recalculate price server-side
  const priceResult = calculateStayPrice({
    roomTypeId,
    checkInDate,
    checkOutDate,
    roomsCount,
    adults,
    children,
    selectedAddons,
  });

  if (priceResult.error || !priceResult.breakdown) {
    return { error: priceResult.error || 'Failed to calculate price.' };
  }

  const breakdown = priceResult.breakdown;

  // Perform atomic reservation hold inside SQLite transaction
  try {
    db.exec('BEGIN IMMEDIATE;');

    cleanupExpiredHolds();

    // Check available physical rooms
    const availableRooms = getAvailablePhysicalRooms(roomTypeId, checkInDate, checkOutDate);
    if (availableRooms.length < roomsCount) {
      db.exec('ROLLBACK;');
      return {
        error: `Inventory conflict: Only ${availableRooms.length} room(s) available for these dates. Another guest may have just reserved this room.`,
      };
    }

    const assignedRooms = availableRooms.slice(0, roomsCount);
    const bookingRef = generateBookingReference();

    // 15-minute temporary hold
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const insertRes = db.prepare(`
      INSERT INTO reservations (
        booking_reference, guest_name, guest_email, guest_phone,
        check_in_date, check_out_date, adults, children, rooms_count,
        special_requests, status, is_demo, room_type_id,
        hold_expires_at, payment_method, payment_status, price_snapshot
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAYMENT_PENDING', ?, ?, ?, ?, 'UNPAID', ?)
    `);

    const result = insertRes.run(
      bookingRef,
      guestName.trim(),
      guestEmail.trim(),
      guestPhone.trim(),
      checkInDate,
      checkOutDate,
      adults,
      children,
      roomsCount,
      specialRequests?.trim() || null,
      isDemo ? 1 : 0,
      roomTypeId,
      holdExpiresAt,
      paymentMethod,
      JSON.stringify(breakdown)
    );

    const reservationId = Number(result.lastInsertRowid);

    // Assign physical rooms to reservation
    const insertResRoom = db.prepare(`
      INSERT INTO reservation_rooms (reservation_id, physical_room_id, nightly_rate)
      VALUES (?, ?, ?)
    `);

    for (const room of assignedRooms) {
      insertResRoom.run(reservationId, room.id, breakdown.baseRoomRate);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (action, entity_type, entity_id, actor, details)
      VALUES ('CREATE_HOLD', 'reservation', ?, ?, ?)
    `).run(
      String(reservationId),
      guestEmail.trim(),
      `Temporary hold created for ${bookingRef} (${roomsCount} room(s), hold expires at ${holdExpiresAt})`
    );

    db.exec('COMMIT;');

    const resRecord = db.prepare(`
      SELECT r.*, rt.name as roomTypeName
      FROM reservations r
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE r.id = ?
    `).get(reservationId) as any;

    return {
      reservation: {
        ...resRecord,
        priceSnapshot: JSON.parse(resRecord.price_snapshot),
        assignedRooms: assignedRooms.map((r) => r.roomNumber),
      },
    };
  } catch (err: any) {
    try {
      db.exec('ROLLBACK;');
    } catch (_) {}
    return { error: 'Failed to reserve room: ' + err.message };
  }
}

// Transition status safely according to business lifecycle
export function updateReservationStatus(
  reservationId: number,
  newStatus: ReservationStatus,
  actor: string = 'system',
  notes?: string
): { success: boolean; error?: string } {
  const current = db.prepare('SELECT * FROM reservations WHERE id = ?').get(reservationId) as any;
  if (!current) {
    return { success: false, error: 'Reservation not found.' };
  }

  const allowedTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'REJECTED', 'EXPIRED'],
    PAYMENT_PENDING: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    CONFIRMED: ['CANCELLED', 'COMPLETED', 'REFUND_PENDING'],
    CANCELLED: ['REFUND_PENDING', 'REFUNDED'],
    REFUND_PENDING: ['REFUNDED', 'CANCELLED'],
    REJECTED: [],
    EXPIRED: [],
    COMPLETED: [],
    REFUNDED: [],
  };

  const allowed = allowedTransitions[current.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${current.status} to ${newStatus}.`,
    };
  }

  db.prepare(`
    UPDATE reservations
    SET status = ?,
        hold_expires_at = CASE WHEN ? = 'CONFIRMED' THEN NULL ELSE hold_expires_at END,
        payment_status = CASE WHEN ? = 'CONFIRMED' THEN 'PAID' ELSE payment_status END,
        internal_notes = CASE WHEN ? IS NOT NULL THEN COALESCE(internal_notes || CHAR(10), '') || ? ELSE internal_notes END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newStatus, newStatus, newStatus, notes || null, notes || null, reservationId);

  db.prepare(`
    INSERT INTO audit_logs (action, entity_type, entity_id, actor, details)
    VALUES ('STATUS_CHANGE', 'reservation', ?, ?, ?)
  `).run(String(reservationId), actor, `Status changed from ${current.status} to ${newStatus}. ${notes || ''}`);

  return { success: true };
}
