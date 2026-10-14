import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { initDatabase, db } from './src/server/db.js';
import {
  searchRoomAvailability,
  createReservationHold,
  updateReservationStatus,
  cleanupExpiredHolds,
  getAvailablePhysicalRooms,
} from './src/server/availability.js';
import { calculateStayPrice } from './src/server/pricing.js';
import {
  verifyAdminCredentials,
  createAdminSession,
  validateAdminSession,
  destroyAdminSession,
  updateAdminPassword,
} from './src/server/auth.js';
import {
  initiatePaymentOrder,
  verifyAndConfirmPayment,
  processRefund,
} from './src/server/payments.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize database schemas and seed data
initDatabase();

// Admin auth middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || (req.query.token as string);

  const { valid, admin } = validateAdminSession(token);
  if (!valid || !admin) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session.' });
  }

  (req as any).admin = admin;
  next();
}

// ==========================================
// PUBLIC GUEST APIS
// ==========================================

// 1. Settings & Info
app.get('/api/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get() as any;
  if (!settings) return res.status(500).json({ error: 'Settings not found' });

  res.json({
    resortName: settings.resort_name,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    currency: settings.currency,
    taxPercent: settings.tax_percent,
    serviceFeePercent: settings.service_fee_percent,
    checkInTime: settings.check_in_time,
    checkOutTime: settings.check_out_time,
    minStayNights: settings.min_stay_nights,
    maxStayNights: settings.max_stay_nights,
    cancellationHoursPrior: settings.cancellation_hours_prior,
    refundPercentage: settings.refund_percentage,
    isDemoMode: Boolean(settings.is_demo_mode),
  });
});

// 2. Room Types Catalogue
app.get('/api/room-types', (req, res) => {
  const types = db.prepare('SELECT * FROM room_types WHERE published = 1 ORDER BY base_nightly_rate ASC').all() as any[];
  const formatted = types.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    shortDesc: t.short_desc,
    maxAdults: t.max_adults,
    maxChildren: t.max_children,
    maxOccupancy: t.max_occupancy,
    bedConfig: t.bed_config,
    roomSizeSqft: t.room_size_sqft,
    amenities: JSON.parse(t.amenities || '[]'),
    images: JSON.parse(t.images || '[]'),
    published: Boolean(t.published),
    baseNightlyRate: t.base_nightly_rate,
    weekendRate: t.weekend_rate,
    extraGuestCharge: t.extra_guest_charge,
  }));
  res.json(formatted);
});

app.get('/api/room-types/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM room_types WHERE id = ?').get(req.params.id) as any;
  if (!t) return res.status(404).json({ error: 'Room type not found' });
  res.json({
    id: t.id,
    name: t.name,
    description: t.description,
    shortDesc: t.short_desc,
    maxAdults: t.max_adults,
    maxChildren: t.max_children,
    maxOccupancy: t.max_occupancy,
    bedConfig: t.bed_config,
    roomSizeSqft: t.room_size_sqft,
    amenities: JSON.parse(t.amenities || '[]'),
    images: JSON.parse(t.images || '[]'),
    published: Boolean(t.published),
    baseNightlyRate: t.base_nightly_rate,
    weekendRate: t.weekend_rate,
    extraGuestCharge: t.extra_guest_charge,
  });
});

// 3. Search Availability
app.post('/api/availability/search', (req, res) => {
  const { checkInDate, checkOutDate, adults = 2, children = 0, roomsCount = 1 } = req.body;
  const result = searchRoomAvailability({
    checkInDate,
    checkOutDate,
    adults: parseInt(adults, 10),
    children: parseInt(children, 10),
    roomsCount: parseInt(roomsCount, 10),
  });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
});

// 4. Calculate Price
app.post('/api/pricing/calculate', (req, res) => {
  const result = calculateStayPrice(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.breakdown);
});

// 5. Addons
app.get('/api/addons', (req, res) => {
  const addons = db.prepare('SELECT * FROM addons WHERE is_active = 1').all() as any[];
  res.json(
    addons.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      price: a.price,
      pricingType: a.pricing_type,
      category: a.category,
      isActive: Boolean(a.is_active),
    }))
  );
});

// 6. Create Reservation Hold
app.post('/api/reservations/hold', (req, res) => {
  const result = createReservationHold(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.reservation);
});

// 7. Secure Booking Lookup
app.get('/api/reservations/lookup', (req, res) => {
  const { reference, contact } = req.query as { reference?: string; contact?: string };
  if (!reference || !contact) {
    return res.status(400).json({ error: 'Please provide both booking reference and email/phone.' });
  }

  const cleanRef = reference.trim().toUpperCase();
  const cleanContact = contact.trim().toLowerCase();

  const r = db.prepare(`
    SELECT r.*, rt.name as roomTypeName, rt.short_desc as roomTypeShortDesc
    FROM reservations r
    JOIN room_types rt ON rt.id = r.room_type_id
    WHERE UPPER(r.booking_reference) = ?
      AND (LOWER(r.guest_email) = ? OR r.guest_phone = ?)
  `).get(cleanRef, cleanContact, contact.trim()) as any;

  if (!r) {
    return res.status(404).json({ error: 'No matching reservation found for the given details.' });
  }

  const assignedRooms = db.prepare(`
    SELECT pr.room_number FROM reservation_rooms rr
    JOIN physical_rooms pr ON pr.id = rr.physical_room_id
    WHERE rr.reservation_id = ?
  `).all(r.id) as Array<{ room_number: string }>;

  const cancellationRequest = db.prepare(`
    SELECT * FROM cancellation_requests WHERE reservation_id = ? ORDER BY id DESC LIMIT 1
  `).get(r.id) as any;

  res.json({
    id: r.id,
    bookingReference: r.booking_reference,
    guestName: r.guest_name,
    guestEmail: r.guest_email,
    guestPhone: r.guest_phone,
    checkInDate: r.check_in_date,
    checkOutDate: r.check_out_date,
    adults: r.adults,
    children: r.children,
    roomsCount: r.rooms_count,
    specialRequests: r.special_requests,
    status: r.status,
    isDemo: Boolean(r.is_demo),
    roomTypeId: r.room_type_id,
    roomTypeName: r.roomTypeName,
    assignedRooms: assignedRooms.map((x) => x.room_number),
    priceSnapshot: JSON.parse(r.price_snapshot),
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    cancellationRequest: cancellationRequest ? {
      status: cancellationRequest.status,
      reason: cancellationRequest.reason,
      createdAt: cancellationRequest.created_at,
    } : null,
    createdAt: r.created_at,
  });
});

// 8. Submit Cancellation Request
app.post('/api/reservations/cancel-request', (req, res) => {
  const { bookingReference, contact, reason } = req.body;
  if (!bookingReference || !contact || !reason) {
    return res.status(400).json({ error: 'Reference, contact identifier and cancellation reason are required.' });
  }

  const r = db.prepare(`
    SELECT * FROM reservations
    WHERE UPPER(booking_reference) = ?
      AND (LOWER(guest_email) = ? OR guest_phone = ?)
  `).get(bookingReference.trim().toUpperCase(), contact.trim().toLowerCase(), contact.trim()) as any;

  if (!r) {
    return res.status(404).json({ error: 'Reservation not found.' });
  }

  if (r.status === 'CANCELLED' || r.status === 'REFUNDED') {
    return res.status(400).json({ error: 'This reservation is already cancelled.' });
  }

  // Check check-in deadline
  const settings = db.prepare('SELECT cancellation_hours_prior FROM site_settings WHERE id = 1').get() as any;
  const deadlineHours = settings?.cancellation_hours_prior || 48;

  const checkInDateTime = new Date(`${r.check_in_date}T14:00:00Z`).getTime();
  const now = Date.now();
  const hoursUntilCheckIn = (checkInDateTime - now) / (1000 * 60 * 60);

  // If eligible, cancel directly or create request for approval
  if (hoursUntilCheckIn >= deadlineHours) {
    // Record request and update status to CANCELLED
    db.prepare(`
      INSERT INTO cancellation_requests (reservation_id, reason, status, reviewed_by, reviewed_at)
      VALUES (?, ?, 'APPROVED', 'auto_policy', CURRENT_TIMESTAMP)
    `).run(r.id, reason.trim());

    updateReservationStatus(r.id, 'CANCELLED', 'guest_lookup', `Cancelled by guest under policy (${reason.trim()})`);
    return res.json({ success: true, status: 'CANCELLED', message: 'Reservation has been successfully cancelled.' });
  } else {
    // Requires manual administrative review
    db.prepare(`
      INSERT INTO cancellation_requests (reservation_id, reason, status)
      VALUES (?, ?, 'PENDING')
    `).run(r.id, reason.trim());

    return res.json({
      success: true,
      status: 'PENDING_REVIEW',
      message: `Cancellation requested within ${deadlineHours}h policy window. It has been forwarded to resort management for review.`,
    });
  }
});

// 9. Payment Endpoints
app.post('/api/payments/initiate', (req, res) => {
  const { reservationId } = req.body;
  if (!reservationId) return res.status(400).json({ error: 'Reservation ID required' });

  const result = initiatePaymentOrder(Number(reservationId));
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result.order);
});

app.post('/api/payments/verify', (req, res) => {
  const { reservationId, orderId, paymentId, signature, isDemoSimulation } = req.body;
  const result = verifyAndConfirmPayment({
    reservationId: Number(reservationId),
    orderId,
    paymentId,
    signature,
    isDemoSimulation: Boolean(isDemoSimulation),
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
});

// 10. Guest Enquiry
app.post('/api/enquiries', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  db.prepare(`
    INSERT INTO guest_enquiries (name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), email.trim(), phone?.trim() || '', subject?.trim() || 'General Enquiry', message.trim());

  res.json({ success: true, message: 'Your enquiry has been received. Our concierge will be in touch shortly.' });
});

// ==========================================
// ADMINISTRATIVE APIS
// ==========================================

// 1. Admin Login & Session
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const result = verifyAdminCredentials(username, password);

  if (result.error || !result.user) {
    return res.status(401).json({ error: result.error || 'Authentication failed' });
  }

  const token = createAdminSession(result.user.id);
  res.json({
    token,
    user: result.user,
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  destroyAdminSession(token);
  res.json({ success: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ user: (req as any).admin });
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = (req as any).admin.id;
  const result = updateAdminPassword(adminId, currentPassword, newPassword);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Password updated successfully.' });
});

// 2. Dashboard KPIs
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  cleanupExpiredHolds();
  const today = new Date().toISOString().split('T')[0];

  // Today's arrivals
  const arrivalsCount = (db.prepare(`
    SELECT COUNT(*) as count FROM reservations
    WHERE check_in_date = ? AND status IN ('CONFIRMED', 'PENDING')
  `).get(today) as any).count;

  // Today's departures
  const departuresCount = (db.prepare(`
    SELECT COUNT(*) as count FROM reservations
    WHERE check_out_date = ? AND status = 'CONFIRMED'
  `).get(today) as any).count;

  // Total physical rooms
  const totalRooms = (db.prepare(`
    SELECT COUNT(*) as count FROM physical_rooms WHERE status = 'active'
  `).get() as any).count;

  // Currently occupied rooms today
  const occupiedRooms = (db.prepare(`
    SELECT COUNT(DISTINCT rr.physical_room_id) as count
    FROM reservation_rooms rr
    JOIN reservations r ON r.id = rr.reservation_id
    WHERE r.status = 'CONFIRMED'
      AND r.check_in_date <= ? AND r.check_out_date > ?
  `).get(today, today) as any).count;

  // Pending approval requests
  const pendingCount = (db.prepare(`
    SELECT COUNT(*) as count FROM reservations WHERE status = 'PENDING'
  `).get() as any).count;

  // Cancellation requests
  const cancellationRequestsCount = (db.prepare(`
    SELECT COUNT(*) as count FROM cancellation_requests WHERE status = 'PENDING'
  `).get() as any).count;

  // Recorded revenue from confirmed bookings (distinguishing demo and paid)
  const revenueStats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN is_demo = 0 THEN p.amount ELSE 0 END), 0) as liveRevenue,
      COALESCE(SUM(CASE WHEN is_demo = 1 THEN p.amount ELSE 0 END), 0) as demoRevenue,
      COUNT(p.id) as paymentTransactions
    FROM payments p
    WHERE p.status = 'SUCCESS'
  `).get() as any;

  // Recent 6 bookings
  const recentBookings = db.prepare(`
    SELECT r.*, rt.name as roomTypeName
    FROM reservations r
    JOIN room_types rt ON rt.id = r.room_type_id
    ORDER BY r.id DESC LIMIT 6
  `).all() as any[];

  res.json({
    kpis: {
      todayArrivals: arrivalsCount,
      todayDepartures: departuresCount,
      totalRooms,
      occupiedRooms,
      occupancyPercent: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      pendingRequests: pendingCount,
      cancellationRequests: cancellationRequestsCount,
      liveRevenue: revenueStats?.liveRevenue || 0,
      demoRevenue: revenueStats?.demoRevenue || 0,
    },
    recentBookings: recentBookings.map((r) => ({
      ...r,
      priceSnapshot: JSON.parse(r.price_snapshot),
    })),
  });
});

// 3. Bookings Management
app.get('/api/admin/bookings', requireAdmin, (req, res) => {
  cleanupExpiredHolds();
  const { status, search, from, to } = req.query as {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
  };

  let query = `
    SELECT r.*, rt.name as roomTypeName
    FROM reservations r
    JOIN room_types rt ON rt.id = r.room_type_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'ALL') {
    query += ' AND r.status = ?';
    params.push(status);
  }

  if (search && search.trim()) {
    query += ' AND (r.booking_reference LIKE ? OR r.guest_name LIKE ? OR r.guest_phone LIKE ? OR r.guest_email LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (from) {
    query += ' AND r.check_in_date >= ?';
    params.push(from);
  }

  if (to) {
    query += ' AND r.check_out_date <= ?';
    params.push(to);
  }

  query += ' ORDER BY r.id DESC';

  const rows = db.prepare(query).all(...params) as any[];

  const bookings = rows.map((r) => {
    const assignedRooms = db.prepare(`
      SELECT pr.room_number FROM reservation_rooms rr
      JOIN physical_rooms pr ON pr.id = rr.physical_room_id
      WHERE rr.reservation_id = ?
    `).all(r.id) as Array<{ room_number: string }>;

    return {
      ...r,
      priceSnapshot: JSON.parse(r.price_snapshot),
      assignedRooms: assignedRooms.map((x) => x.room_number),
    };
  });

  res.json(bookings);
});

// Update booking status
app.patch('/api/admin/bookings/:id/status', requireAdmin, (req, res) => {
  const { status, notes } = req.body;
  const admin = (req as any).admin;
  const result = updateReservationStatus(Number(req.params.id), status, admin.username, notes);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: `Status updated to ${status}.` });
});

// Process Refund
app.post('/api/admin/bookings/:id/refund', requireAdmin, (req, res) => {
  const { reason } = req.body;
  const admin = (req as any).admin;
  const result = processRefund(Number(req.params.id), admin.username, reason || 'Administrative refund request');

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Refund successfully processed.' });
});

// Export CSV
app.get('/api/admin/reports/csv', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT r.booking_reference, r.guest_name, r.guest_email, r.guest_phone,
           r.check_in_date, r.check_out_date, r.status, r.is_demo,
           rt.name as room_type, r.created_at, r.price_snapshot
    FROM reservations r
    JOIN room_types rt ON rt.id = r.room_type_id
    ORDER BY r.id DESC
  `).all() as any[];

  let csv = 'Booking Reference,Guest Name,Email,Phone,Check In,Check Out,Room Type,Status,Total Amount (INR),Demo Booking,Created At\n';

  for (const r of rows) {
    const snap = JSON.parse(r.price_snapshot || '{}');
    const total = snap.finalTotal || 0;
    csv += `"${r.booking_reference}","${r.guest_name}","${r.guest_email}","${r.guest_phone}","${r.check_in_date}","${r.check_out_date}","${r.room_type}","${r.status}",${total},${r.is_demo ? 'Yes' : 'No'},"${r.created_at}"\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="the_destination_resort_bookings.csv"');
  res.send(csv);
});

// 4. Room Types & Physical Inventory
app.get('/api/admin/inventory', requireAdmin, (req, res) => {
  const roomTypes = db.prepare('SELECT * FROM room_types ORDER BY base_nightly_rate ASC').all() as any[];
  const physicalRooms = db.prepare(`
    SELECT pr.*, rt.name as roomTypeName
    FROM physical_rooms pr
    JOIN room_types rt ON rt.id = pr.room_type_id
    ORDER BY pr.floor ASC, pr.room_number ASC
  `).all() as any[];

  const blocks = db.prepare(`
    SELECT rb.*, pr.room_number
    FROM room_blocks rb
    JOIN physical_rooms pr ON pr.id = rb.physical_room_id
    ORDER BY rb.start_date ASC
  `).all() as any[];

  res.json({
    roomTypes: roomTypes.map((t) => ({
      ...t,
      amenities: JSON.parse(t.amenities || '[]'),
      images: JSON.parse(t.images || '[]'),
      published: Boolean(t.published),
    })),
    physicalRooms,
    blocks,
  });
});

app.post('/api/admin/room-types', requireAdmin, (req, res) => {
  const {
    id, name, shortDesc, description, maxAdults, maxChildren, maxOccupancy,
    bedConfig, roomSizeSqft, amenities, images, published, baseNightlyRate,
    weekendRate, extraGuestCharge,
  } = req.body;

  if (!id || !name || !baseNightlyRate) {
    return res.status(400).json({ error: 'ID, name, and base rate are required.' });
  }

  const existing = db.prepare('SELECT id FROM room_types WHERE id = ?').get(id);
  if (existing) {
    db.prepare(`
      UPDATE room_types
      SET name = ?, short_desc = ?, description = ?, max_adults = ?, max_children = ?,
          max_occupancy = ?, bed_config = ?, room_size_sqft = ?, amenities = ?,
          images = ?, published = ?, base_nightly_rate = ?, weekend_rate = ?,
          extra_guest_charge = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, shortDesc, description, maxAdults, maxChildren, maxOccupancy,
      bedConfig, roomSizeSqft, JSON.stringify(amenities || []), JSON.stringify(images || []),
      published ? 1 : 0, baseNightlyRate, weekendRate, extraGuestCharge, id
    );
  } else {
    db.prepare(`
      INSERT INTO room_types (
        id, name, short_desc, description, max_adults, max_children, max_occupancy,
        bed_config, room_size_sqft, amenities, images, published, base_nightly_rate,
        weekend_rate, extra_guest_charge
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, shortDesc, description, maxAdults, maxChildren, maxOccupancy,
      bedConfig, roomSizeSqft, JSON.stringify(amenities || []), JSON.stringify(images || []),
      published ? 1 : 0, baseNightlyRate, weekendRate, extraGuestCharge
    );
  }

  res.json({ success: true });
});

app.post('/api/admin/physical-rooms', requireAdmin, (req, res) => {
  const { id, roomTypeId, roomNumber, floor, status, notes } = req.body;
  if (!id || !roomTypeId || !roomNumber) {
    return res.status(400).json({ error: 'Room ID, type, and room number are required.' });
  }

  const existing = db.prepare('SELECT id FROM physical_rooms WHERE id = ?').get(id);
  if (existing) {
    db.prepare(`
      UPDATE physical_rooms
      SET room_type_id = ?, room_number = ?, floor = ?, status = ?, notes = ?
      WHERE id = ?
    `).run(roomTypeId, roomNumber, floor || 1, status || 'active', notes || '', id);
  } else {
    db.prepare(`
      INSERT INTO physical_rooms (id, room_type_id, room_number, floor, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, roomTypeId, roomNumber, floor || 1, status || 'active', notes || '');
  }

  res.json({ success: true });
});

app.post('/api/admin/room-blocks', requireAdmin, (req, res) => {
  const { physicalRoomId, startDate, endDate, reason } = req.body;
  if (!physicalRoomId || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'All fields required for room block.' });
  }

  db.prepare(`
    INSERT INTO room_blocks (physical_room_id, start_date, end_date, reason)
    VALUES (?, ?, ?, ?)
  `).run(physicalRoomId, startDate, endDate, reason.trim());

  res.json({ success: true });
});

app.delete('/api/admin/room-blocks/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM room_blocks WHERE id = ?').run(Number(req.params.id));
  res.json({ success: true });
});

// Update Settings
app.put('/api/settings', requireAdmin, (req, res) => {
  const {
    resortName, address, phone, email, currency, taxPercent, serviceFeePercent,
    checkInTime, checkOutTime, minStayNights, maxStayNights, cancellationHoursPrior,
    refundPercentage, isDemoMode
  } = req.body;

  db.prepare(`
    UPDATE site_settings
    SET resort_name = ?, address = ?, phone = ?, email = ?, currency = ?,
        tax_percent = ?, service_fee_percent = ?, check_in_time = ?,
        check_out_time = ?, min_stay_nights = ?, max_stay_nights = ?,
        cancellation_hours_prior = ?, refund_percentage = ?, is_demo_mode = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    resortName, address, phone, email, currency || 'INR', Number(taxPercent),
    Number(serviceFeePercent), checkInTime, checkOutTime, Number(minStayNights),
    Number(maxStayNights), Number(cancellationHoursPrior), Number(refundPercentage),
    isDemoMode ? 1 : 0
  );

  res.json({ success: true });
});

// 5. Enquiries & Guest Messages
app.get('/api/admin/enquiries', requireAdmin, (req, res) => {
  const enquiries = db.prepare('SELECT * FROM guest_enquiries ORDER BY id DESC').all() as any[];
  res.json(enquiries);
});

app.patch('/api/admin/enquiries/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE guest_enquiries SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  res.json({ success: true });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luxury Hospitality Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
