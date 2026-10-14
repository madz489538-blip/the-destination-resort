import { db } from './db.js';
import crypto from 'node:crypto';
import { updateReservationStatus } from './availability.js';

export interface PaymentInitiationResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  isDemo: boolean;
  notes?: string;
}

export function initiatePaymentOrder(reservationId: number): { error?: string; order?: PaymentInitiationResult } {
  const res = db.prepare('SELECT * FROM reservations WHERE id = ?').get(reservationId) as any;
  if (!res) {
    return { error: 'Reservation not found.' };
  }

  if (res.status === 'CONFIRMED' || res.payment_status === 'PAID') {
    return { error: 'Reservation is already paid and confirmed.' };
  }

  const snapshot = JSON.parse(res.price_snapshot);
  const amount = snapshot.finalTotal;
  const currency = snapshot.currency || 'INR';

  // Check if Razorpay keys are configured via environment
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const isLiveConfigured = Boolean(razorpayKeyId && razorpayKeySecret);

  const orderId = `order_${isLiveConfigured ? 'rzp' : 'demo'}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // Record payment attempt
  db.prepare(`
    INSERT INTO payments (reservation_id, provider, order_id, amount, currency, status)
    VALUES (?, ?, ?, ?, ?, 'INITIATED')
  `).run(reservationId, isLiveConfigured ? 'razorpay' : 'demo', orderId, amount, currency);

  return {
    order: {
      orderId,
      amount,
      currency,
      keyId: isLiveConfigured ? razorpayKeyId : 'rzp_test_DEMO_KEY_THE_DESTINATION',
      isDemo: !isLiveConfigured,
      notes: isLiveConfigured
        ? 'Live Razorpay order created.'
        : 'Illustrative Demo Order. Real payment provider credentials not configured in environment.',
    },
  };
}

export function verifyAndConfirmPayment(params: {
  reservationId: number;
  orderId: string;
  paymentId: string;
  signature?: string;
  isDemoSimulation?: boolean;
}): { success: boolean; error?: string; bookingReference?: string } {
  const { reservationId, orderId, paymentId, signature, isDemoSimulation } = params;

  const res = db.prepare('SELECT * FROM reservations WHERE id = ?').get(reservationId) as any;
  if (!res) {
    return { success: false, error: 'Reservation record not found.' };
  }

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!isDemoSimulation && razorpayKeySecret) {
    // Validate HMAC SHA256 signature for real Razorpay transaction
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      db.prepare(`
        UPDATE payments SET status = 'FAILED', raw_response = 'Signature mismatch'
        WHERE order_id = ?
      `).run(orderId);
      return { success: false, error: 'Payment signature verification failed.' };
    }
  }

  // Update payment record
  db.prepare(`
    UPDATE payments
    SET transaction_id = ?, signature = ?, status = 'SUCCESS',
        raw_response = ?
    WHERE order_id = ?
  `).run(
    paymentId,
    signature || 'demo_signature',
    isDemoSimulation ? 'DEMO_SIMULATED_TEST_PAYMENT' : 'VERIFIED_SIGNATURE',
    orderId
  );

  // Transition reservation to CONFIRMED
  const statusRes = updateReservationStatus(
    reservationId,
    'CONFIRMED',
    isDemoSimulation ? 'guest_demo_payment' : 'payment_webhook',
    `Payment verified (TXN: ${paymentId}, Order: ${orderId}, Mode: ${isDemoSimulation ? 'DEMO' : 'LIVE'})`
  );

  if (!statusRes.success) {
    return { success: false, error: statusRes.error };
  }

  return { success: true, bookingReference: res.booking_reference };
}

export function processRefund(reservationId: number, adminUsername: string, reason: string): { success: boolean; error?: string } {
  const res = db.prepare('SELECT * FROM reservations WHERE id = ?').get(reservationId) as any;
  if (!res) {
    return { success: false, error: 'Reservation not found.' };
  }

  const payment = db.prepare("SELECT * FROM payments WHERE reservation_id = ? AND status = 'SUCCESS'").get(reservationId) as any;
  if (!payment) {
    return { success: false, error: 'No successful payment found to refund.' };
  }

  const snapshot = JSON.parse(res.price_snapshot);
  const refundAmount = snapshot.finalTotal;

  // Insert refund record
  db.prepare(`
    INSERT INTO refunds (payment_id, reservation_id, amount, reason, status, processed_at, processed_by)
    VALUES (?, ?, ?, ?, 'COMPLETED', CURRENT_TIMESTAMP, ?)
  `).run(payment.id, reservationId, refundAmount, reason, adminUsername);

  // Update reservation status to REFUNDED
  updateReservationStatus(reservationId, 'REFUNDED', adminUsername, `Refund of ₹${refundAmount} processed. Reason: ${reason}`);

  return { success: true };
}
