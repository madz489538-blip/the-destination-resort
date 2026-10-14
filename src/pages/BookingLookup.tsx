import React, { useState } from 'react';
import { Reservation } from '../types/resort.js';
import { Search, AlertCircle, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck, Printer } from 'lucide-react';

interface BookingLookupProps {
  onNavigate: (path: string, state?: any) => void;
}

export const BookingLookup: React.FC<BookingLookupProps> = ({ onNavigate }) => {
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any | null>(null);

  // Cancellation state
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCancellationMessage(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/reservations/lookup?reference=${encodeURIComponent(reference.trim())}&contact=${encodeURIComponent(contact.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'No matching reservation found.');
        setReservation(null);
      } else {
        setReservation(data);
      }
    } catch (err: any) {
      setErrorMsg('Failed to query reservation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellationReason.trim()) return;

    setCancelling(true);
    try {
      const res = await fetch('/api/reservations/cancel-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: reservation.bookingReference,
          contact: contact.trim(),
          reason: cancellationReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit cancellation.');
      } else {
        setCancellationMessage(data.message);
        setShowCancelModal(false);

        // Refresh reservation details
        const refreshRes = await fetch(
          `/api/reservations/lookup?reference=${encodeURIComponent(reference.trim())}&contact=${encodeURIComponent(contact.trim())}`
        );
        const updated = await refreshRes.json();
        setReservation(updated);
      }
    } catch (err: any) {
      setErrorMsg('Failed to submit cancellation request.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="text-emerald-700 dark:text-emerald-400 font-semibold">● Confirmed</span>;
      case 'CANCELLED':
        return <span className="text-stone-500 font-semibold">● Cancelled</span>;
      case 'PAYMENT_PENDING':
      case 'PENDING':
        return <span className="text-amber-600 dark:text-amber-400 font-semibold">● Pending Approval</span>;
      case 'REFUND_PENDING':
        return <span className="text-blue-600 dark:text-blue-400 font-semibold">● Refund In Review</span>;
      case 'REFUNDED':
        return <span className="text-indigo-600 dark:text-indigo-400 font-semibold">● Refunded</span>;
      default:
        return <span className="text-stone-500 font-semibold">● {status}</span>;
    }
  };

  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
          Guest Portal
        </span>
        <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-1 mb-2">
          Manage Your Reservation
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-light">
          Enter your unique booking reference along with your registered email or phone number to retrieve your stay details.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white dark:bg-[#161918] p-5 sm:p-7 rounded border border-stone-200 dark:border-stone-800 shadow-sm mb-8 w-full min-w-0">
        <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
              Booking Reference *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="e.g. TDR-2026-DEMO01"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-white uppercase font-mono"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
              Email or Phone Number *
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="ananya.sharma@example.com"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-white"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Finding...' : 'Look Up'}
            </button>
          </div>
        </form>

        <div className="mt-2.5 text-[11px] text-stone-500">
          Tip: For demonstration, try reference <span className="font-mono text-stone-800 dark:text-stone-200 font-semibold">TDR-2026-DEMO01</span> with email <span className="font-mono text-stone-800 dark:text-stone-200 font-semibold">ananya.sharma@example.com</span>
        </div>
      </div>

      {/* Errors or Notices */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {cancellationMessage && (
        <div className="mb-6 p-3.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{cancellationMessage}</span>
        </div>
      )}

      {/* Reservation Details Result */}
      {reservation && (
        <div className="bg-white dark:bg-[#161918] rounded border border-stone-200 dark:border-stone-800 shadow-sm p-5 sm:p-7 space-y-6 w-full min-w-0 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                Booking Reference
              </span>
              <span className="font-mono text-lg sm:text-xl font-bold text-[#9E7D42] dark:text-[#C5A880] break-all">
                {reservation.bookingReference}
              </span>
              <div className="text-xs mt-0.5">{getStatusBadge(reservation.status)}</div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">
                Total Amount
              </span>
              <span className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-white tabular-nums font-semibold">
                ₹{reservation.priceSnapshot?.finalTotal?.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-stone-500 block">
                Payment: {reservation.paymentStatus || 'UNPAID'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">Guest</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">{reservation.guestName}</span>
              <span className="text-stone-500 block">{reservation.guestPhone}</span>
              <span className="text-stone-500 block truncate">{reservation.guestEmail}</span>
            </div>

            <div>
              <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">Residence</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">{reservation.roomTypeName}</span>
              <span className="text-stone-500 block mt-0.5">
                {reservation.roomsCount} Room(s) · {reservation.adults} Adults
                {reservation.children > 0 ? `, ${reservation.children} Children` : ''}
              </span>
              {reservation.assignedRooms && reservation.assignedRooms.length > 0 && (
                <span className="text-[#9E7D42] dark:text-[#C5A880] block mt-0.5 font-mono">
                  Allocated: {reservation.assignedRooms.join(', ')}
                </span>
              )}
            </div>

            <div>
              <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">Dates</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                {reservation.checkInDate} to {reservation.checkOutDate}
              </span>
              <span className="text-stone-500 block mt-0.5">
                Duration: {reservation.priceSnapshot?.nights} Nights
              </span>
            </div>
          </div>

          {/* Cancellation Request status if active */}
          {reservation.cancellationRequest && (
            <div className="p-3.5 rounded bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="font-semibold text-stone-800 dark:text-stone-200 block mb-0.5">
                Active Cancellation Request:
              </span>
              <p className="text-stone-600 dark:text-stone-400">
                Status: <strong>{reservation.cancellationRequest.status}</strong> · Reason:{' '}
                "{reservation.cancellationRequest.reason}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Summary</span>
            </button>

            {reservation.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-rose-600 hover:text-rose-700 border border-rose-300 dark:border-rose-900 rounded btn-luxury cursor-pointer"
              >
                Request Cancellation
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#161918] border border-stone-200 dark:border-stone-800 max-w-md w-full rounded p-5 sm:p-7 space-y-5">
            <div>
              <h3 className="font-serif text-xl text-stone-900 dark:text-[#FAF7F2]">
                Request Cancellation
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Ref: {reservation.bookingReference} · Check-In: {reservation.checkInDate}
              </p>
            </div>

            <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
              Cancellations made 48+ hours prior to check-in (14:00) are processed immediately under our standard policy. Within 48 hours, requests require administrative review by the resort concierge.
            </div>

            <form onSubmit={handleCancelRequest} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Reason for Cancellation *
                </label>
                <textarea
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please describe why you are requesting to cancel..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3.5 py-2 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
                >
                  {cancelling ? 'Submitting...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
