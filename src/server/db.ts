import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'resort_data.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Configure WAL mode and foreign keys for durability and concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      resort_name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      tax_percent REAL NOT NULL DEFAULT 12.0,
      service_fee_percent REAL NOT NULL DEFAULT 2.5,
      check_in_time TEXT NOT NULL DEFAULT '14:00',
      check_out_time TEXT NOT NULL DEFAULT '11:00',
      min_stay_nights INTEGER NOT NULL DEFAULT 1,
      max_stay_nights INTEGER NOT NULL DEFAULT 30,
      cancellation_hours_prior INTEGER NOT NULL DEFAULT 48,
      refund_percentage REAL NOT NULL DEFAULT 85.0,
      is_demo_mode INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS room_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      short_desc TEXT NOT NULL,
      max_adults INTEGER NOT NULL,
      max_children INTEGER NOT NULL,
      max_occupancy INTEGER NOT NULL,
      bed_config TEXT NOT NULL,
      room_size_sqft INTEGER NOT NULL,
      amenities TEXT NOT NULL, -- JSON
      images TEXT NOT NULL, -- JSON
      published INTEGER NOT NULL DEFAULT 1,
      base_nightly_rate INTEGER NOT NULL,
      weekend_rate INTEGER,
      extra_guest_charge INTEGER NOT NULL DEFAULT 1200,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS physical_rooms (
      id TEXT PRIMARY KEY,
      room_type_id TEXT NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
      room_number TEXT UNIQUE NOT NULL,
      floor INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active', -- active, maintenance, inactive
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS room_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      physical_room_id TEXT NOT NULL REFERENCES physical_rooms(id) ON DELETE CASCADE,
      start_date TEXT NOT NULL, -- YYYY-MM-DD
      end_date TEXT NOT NULL,   -- YYYY-MM-DD
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      pricing_type TEXT NOT NULL, -- per_night, per_guest, per_stay
      category TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT UNIQUE NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      adults INTEGER NOT NULL,
      children INTEGER NOT NULL DEFAULT 0,
      rooms_count INTEGER NOT NULL DEFAULT 1,
      special_requests TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      is_demo INTEGER NOT NULL DEFAULT 1,
      room_type_id TEXT NOT NULL REFERENCES room_types(id),
      hold_expires_at TEXT,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'UNPAID',
      internal_notes TEXT,
      price_snapshot TEXT NOT NULL, -- JSON
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reservation_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      physical_room_id TEXT NOT NULL REFERENCES physical_rooms(id),
      nightly_rate INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      provider TEXT NOT NULL, -- demo, razorpay, pay_at_desk
      order_id TEXT,
      transaction_id TEXT,
      signature TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'INITIATED',
      raw_response TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
      reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      processed_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cancellation_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
      review_notes TEXT,
      reviewed_by TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS guest_enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      actor TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_res_dates ON reservations(check_in_date, check_out_date, status);
    CREATE INDEX IF NOT EXISTS idx_res_ref ON reservations(booking_reference);
    CREATE INDEX IF NOT EXISTS idx_blocks_dates ON room_blocks(physical_room_id, start_date, end_date);
  `);

  seedInitialData();
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function seedInitialData() {
  // 1. Settings
  const existingSettings = db.prepare('SELECT id FROM site_settings WHERE id = 1').get();
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO site_settings (
        id, resort_name, address, phone, email, currency, tax_percent,
        service_fee_percent, check_in_time, check_out_time, min_stay_nights,
        max_stay_nights, cancellation_hours_prior, refund_percentage, is_demo_mode
      ) VALUES (
        1, 'The Destination Resort',
        'NH715, Bhojkhowa, Kachari Pam, Tezpur, Assam 784027, India',
        '+91 86384 73551', 'reservations@destinationresort.in',
        'INR', 12.0, 2.5, '14:00', '11:00', 1, 30, 48, 85.0, 1
      )
    `).run();
  }

  // 2. Admin User
  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const salt = crypto.randomBytes(16).toString('hex');
    const password = process.env.ADMIN_PASSWORD || 'ResortAdmin2026!';
    const passwordHash = hashPassword(password, salt);

    db.prepare(`
      INSERT INTO admin_users (username, email, password_hash, salt, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', 'admin@destinationresort.in', passwordHash, salt, 'admin');
  }

  // 3. Room Types
  const roomTypesCount = (db.prepare('SELECT COUNT(*) as count FROM room_types').get() as { count: number }).count;
  if (roomTypesCount === 0) {
    const defaultTypes = [
      {
        id: 'deluxe-heritage-cottage',
        name: 'Deluxe Heritage Cottage',
        shortDesc: 'Artisanal wooden cottage amidst tea canopy with private garden sit-out.',
        description: 'Immerse yourself in authentic Assamese hospitality. Features high vaulted teak ceilings, private verandah with serene nature vistas, handcrafted local furnishings, and an open-sky rainforest shower.',
        maxAdults: 2,
        maxChildren: 1,
        maxOccupancy: 3,
        bedConfig: '1 King Bed or 2 Twin Beds',
        roomSizeSqft: 450,
        amenities: JSON.stringify(['Private Verandah', 'Garden View', 'Artisanal Tea Station', 'Rainforest Shower', 'Climate Control', 'High-Speed Wi-Fi', 'Safety Locker']),
        images: JSON.stringify(['cottage_1', 'cottage_2']),
        baseNightlyRate: 6500,
        weekendRate: 7200,
        extraGuestCharge: 1200,
      },
      {
        id: 'luxury-plantation-suite',
        name: 'Luxury Plantation Suite',
        shortDesc: 'Expansive private suite with panoramic views of organic tea plantations.',
        description: 'Designed for ultimate relaxation with spacious living salon, floor-to-ceiling windows overlooking lush green rows, deep soaking freestanding bathtub, and bespoke butler service upon request.',
        maxAdults: 3,
        maxChildren: 1,
        maxOccupancy: 4,
        bedConfig: '1 Super King Bed + Daybed',
        roomSizeSqft: 680,
        amenities: JSON.stringify(['Panoramic Tea Views', 'Freestanding Soaking Tub', 'Separate Living Area', 'Espresso Machine', 'Pillow Menu', 'Smart Television', 'Bathrobes & Slippers']),
        images: JSON.stringify(['suite_1', 'suite_2']),
        baseNightlyRate: 9800,
        weekendRate: 10800,
        extraGuestCharge: 1500,
      },
      {
        id: 'executive-brahmaputra-villa',
        name: 'Executive Brahmaputra Villa',
        shortDesc: 'Exclusive 2-bedroom presidential villa with private courtyard and plunge pool.',
        description: 'Our most prestigious residence, offering absolute privacy and refined luxury. Boasts dual master suites, private outdoor sundeck with temperature-regulated plunge pool, personal dining pavilion, and 24/7 dedicated attendant.',
        maxAdults: 4,
        maxChildren: 2,
        maxOccupancy: 6,
        bedConfig: '2 King Bedrooms',
        roomSizeSqft: 950,
        amenities: JSON.stringify(['Private Plunge Pool', 'Private Courtyard', 'Dual Master Bathrooms', 'Outdoor Sun Deck', 'Dedicated Butler Service', 'Complimentary Evening Canapés', 'Wine Cellarette']),
        images: JSON.stringify(['villa_1', 'villa_2']),
        baseNightlyRate: 14500,
        weekendRate: 16200,
        extraGuestCharge: 2000,
      },
      {
        id: 'boutique-serene-room',
        name: 'Boutique Serene Room',
        shortDesc: 'Charming, intimate retreat overlooking the tranquil water courtyard.',
        description: 'Perfect for couples or solo explorers looking for peace and quiet comfort. Features warm ivory textiles, handcrafted brass fittings, plush organic mattress, and quiet reading nook.',
        maxAdults: 2,
        maxChildren: 0,
        maxOccupancy: 2,
        bedConfig: '1 Queen Bed',
        roomSizeSqft: 360,
        amenities: JSON.stringify(['Courtyard View', 'Rain Shower', 'Organic Bath Amenities', 'High-Speed Wi-Fi', 'Workstation', 'Daily Fresh Flowers']),
        images: JSON.stringify(['serene_1', 'serene_2']),
        baseNightlyRate: 4800,
        weekendRate: 5400,
        extraGuestCharge: 1000,
      },
    ];

    const insertType = db.prepare(`
      INSERT INTO room_types (
        id, name, short_desc, description, max_adults, max_children, max_occupancy,
        bed_config, room_size_sqft, amenities, images, published, base_nightly_rate,
        weekend_rate, extra_guest_charge
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    for (const t of defaultTypes) {
      insertType.run(
        t.id, t.name, t.shortDesc, t.description, t.maxAdults, t.maxChildren,
        t.maxOccupancy, t.bedConfig, t.roomSizeSqft, t.amenities, t.images,
        t.baseNightlyRate, t.weekendRate, t.extraGuestCharge
      );
    }
  }

  // 4. Physical Rooms
  const physicalRoomsCount = (db.prepare('SELECT COUNT(*) as count FROM physical_rooms').get() as { count: number }).count;
  if (physicalRoomsCount === 0) {
    const rooms = [
      // Deluxe Heritage Cottage (4 rooms)
      { id: 'C101', roomTypeId: 'deluxe-heritage-cottage', roomNumber: 'Cottage 101', floor: 1 },
      { id: 'C102', roomTypeId: 'deluxe-heritage-cottage', roomNumber: 'Cottage 102', floor: 1 },
      { id: 'C103', roomTypeId: 'deluxe-heritage-cottage', roomNumber: 'Cottage 103', floor: 1 },
      { id: 'C104', roomTypeId: 'deluxe-heritage-cottage', roomNumber: 'Cottage 104', floor: 1 },

      // Luxury Plantation Suite (3 rooms)
      { id: 'S201', roomTypeId: 'luxury-plantation-suite', roomNumber: 'Suite 201', floor: 2 },
      { id: 'S202', roomTypeId: 'luxury-plantation-suite', roomNumber: 'Suite 202', floor: 2 },
      { id: 'S203', roomTypeId: 'luxury-plantation-suite', roomNumber: 'Suite 203', floor: 2 },

      // Executive Brahmaputra Villa (2 villas)
      { id: 'V301', roomTypeId: 'executive-brahmaputra-villa', roomNumber: 'Villa 301', floor: 1 },
      { id: 'V302', roomTypeId: 'executive-brahmaputra-villa', roomNumber: 'Villa 302', floor: 1 },

      // Boutique Serene Room (4 rooms)
      { id: 'B101', roomTypeId: 'boutique-serene-room', roomNumber: 'Room 101', floor: 1 },
      { id: 'B102', roomTypeId: 'boutique-serene-room', roomNumber: 'Room 102', floor: 1 },
      { id: 'B103', roomTypeId: 'boutique-serene-room', roomNumber: 'Room 201', floor: 2 },
      { id: 'B104', roomTypeId: 'boutique-serene-room', roomNumber: 'Room 202', floor: 2 },
    ];

    const insertRoom = db.prepare(`
      INSERT INTO physical_rooms (id, room_type_id, room_number, floor, status)
      VALUES (?, ?, ?, ?, 'active')
    `);

    for (const r of rooms) {
      insertRoom.run(r.id, r.roomTypeId, r.roomNumber, r.floor);
    }
  }

  // 5. Addons
  const addonsCount = (db.prepare('SELECT COUNT(*) as count FROM addons').get() as { count: number }).count;
  if (addonsCount === 0) {
    const defaultAddons = [
      {
        id: 'assamese-gourmet-breakfast',
        name: 'Gourmet Assamese Breakfast & High Tea',
        description: 'Daily spread of freshly made artisanal teas, organic seasonal fruits, pitha, and continental options.',
        price: 750,
        pricingType: 'per_guest',
        category: 'dining',
      },
      {
        id: 'kaziranga-guided-safari',
        name: 'Kaziranga / Nameri Private Chauffeured Excursion',
        description: 'Guided excursion with dedicated luxury 4x4 SUV, permits assistance, and packed gourmet picnic.',
        price: 4200,
        pricingType: 'per_stay',
        category: 'experience',
      },
      {
        id: 'candlelight-garden-dinner',
        name: 'Private Candlelight Four-Course Dinner',
        description: 'An intimate dining experience in the private gazebo with personalized chef service and ambient music.',
        price: 2800,
        pricingType: 'per_stay',
        category: 'dining',
      },
      {
        id: 'tezpur-airport-transfer',
        name: 'Private Tezpur Station / Airport Transfer',
        description: 'Seamless arrival and departure in a sanitized luxury sedan with chauffeur and mineral water.',
        price: 1500,
        pricingType: 'per_stay',
        category: 'transport',
      },
      {
        id: 'ayurvedic-herbal-therapy',
        name: 'Ayurvedic Botanical Spa Ritual (60 Min)',
        description: 'Revitalizing full-body massage using authentic botanical oils brewed with Assam herbs.',
        price: 2400,
        pricingType: 'per_guest',
        category: 'wellness',
      },
    ];

    const insertAddon = db.prepare(`
      INSERT INTO addons (id, name, description, price, pricing_type, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    for (const a of defaultAddons) {
      insertAddon.run(a.id, a.name, a.description, a.price, a.pricingType, a.category);
    }
  }

  // 6. Sample Initial Reservation for demonstration
  const resCount = (db.prepare('SELECT COUNT(*) as count FROM reservations').get() as { count: number }).count;
  if (resCount === 0) {
    const today = new Date();
    const in3Days = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];
    const in6Days = new Date(today.getTime() + 6 * 86400000).toISOString().split('T')[0];

    const samplePrice = {
      nights: 3,
      roomsCount: 1,
      baseRoomRate: 6500,
      roomSubtotal: 19500,
      weekendSurcharge: 700,
      extraGuestCharges: 0,
      addonsList: [{ id: 'assamese-gourmet-breakfast', name: 'Gourmet Assamese Breakfast & High Tea', unitPrice: 750, quantity: 2, total: 4500 }],
      addonsTotal: 4500,
      taxableAmount: 24700,
      taxPercent: 12.0,
      taxAmount: 2964,
      serviceFee: 617,
      discountAmount: 0,
      finalTotal: 28281,
      currency: 'INR',
    };

    const res = db.prepare(`
      INSERT INTO reservations (
        booking_reference, guest_name, guest_email, guest_phone,
        check_in_date, check_out_date, adults, children, rooms_count,
        special_requests, status, is_demo, room_type_id,
        payment_method, payment_status, internal_notes, price_snapshot
      ) VALUES (
        'TDR-2026-DEMO01', 'Ananya Sharma', 'ananya.sharma@example.com', '+91 98765 43210',
        ?, ?, 2, 0, 1,
        'Quiet cottage away from main pathway. Late check-in around 16:00.',
        'CONFIRMED', 1, 'deluxe-heritage-cottage',
        'demo', 'PAID', 'Sample confirmed demo booking for system demonstration.', ?
      )
    `).run(in3Days, in6Days, JSON.stringify(samplePrice));

    const resId = Number(res.lastInsertRowid);
    db.prepare(`
      INSERT INTO reservation_rooms (reservation_id, physical_room_id, nightly_rate)
      VALUES (?, 'C101', 6500)
    `).run(resId);
  }
}
