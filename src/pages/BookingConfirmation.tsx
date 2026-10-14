import React from 'react';
import { Reservation } from '../types/resort.js';
import { CheckCircle2, Printer, MapPin, Phone, Mail, Calendar, ShieldCheck, Download, ArrowRight } from 'lucide-react';

interface BookingConfirmationProps {
  reservation: Reservation;
  onNavigate: (path: string) => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ reservation, onNavigate }) => {
  const price = reservation.priceSnapshot;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Success Banner */}
      <div className="text-center space-y-2.5 mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold block">
          Reservation Confirmed
        </span>
        <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2]">
          We Look Forward to Welcoming You
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light max-w-md mx-auto">
          Your reservation has been recorded in the resort booking engine. A copy of this confirmation voucher can be printed or retrieved anytime.
        </p>
      </div>

      {/* Printable Confirmation Card */}
      <div id="voucherCard" className="bg-white dark:bg-[#161918] rounded border border-stone-200 dark:border-stone-800 shadow-md p-5 sm:p-8 space-y-6 w-full min-w-0">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="font-serif text-lg sm:text-2xl tracking-wider text-stone-900 dark:text-[#FAF7F2]">
              THE DESTINATION RESORT
            </h2>
            <p className="text-xs text-stone-500 font-light">
              NH715, Bhojkhowa, Kachari Pam, Tezpur, Assam 784027
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
              Booking Reference
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#9E7D42] dark:text-[#C5A880] tracking-wider select-all break-all">
              {reservation.bookingReference}
            </span>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              ● Status: {reservation.status}
            </div>
          </div>
        </div>

        {/* Guest & Stay Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-xs">
          <div>
            <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">Guest Name</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block">{reservation.guestName}</span>
            <span className="text-stone-500 block text-[11px] mt-0.5">{reservation.guestPhone}</span>
            <span className="text-stone-500 block text-[11px] truncate">{reservation.guestEmail}</span>
          </div>

          <div>
            <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">Residence</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block">
              {reservation.roomTypeName || reservation.roomTypeId}
            </span>
            <span className="text-stone-500 block text-[11px] mt-0.5">
              {reservation.roomsCount} Room(s)
              {reservation.assignedRooms && reservation.assignedRooms.length > 0
                ? ` (${reservation.assignedRooms.join(', ')})`
                : ''}
            </span>
          </div>

          <div>
            <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">Check-In / Out</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block">
              {reservation.checkInDate}
            </span>
            <span className="text-stone-500 block text-[11px]">
              Check-in from 14:00 onwards
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm mt-1 block">
              {reservation.checkOutDate}
            </span>
            <span className="text-stone-500 block text-[11px]">
              Check-out by 11:00
            </span>
          </div>

          <div>
            <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">Occupancy</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block">
              {reservation.adults} Adults{reservation.children > 0 ? `, ${reservation.children} Children` : ''}
            </span>
            <span className="text-stone-500 block text-[11px] mt-0.5">
              Duration: {price?.nights || 1} Nights
            </span>
          </div>
        </div>

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="p-3.5 rounded bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300 block mb-0.5">
              Guest Special Requests:
            </span>
            <p className="text-stone-600 dark:text-stone-400 font-light">
              "{reservation.specialRequests}" (Note: Subject to availability upon arrival)
            </p>
          </div>
        )}

        {/* Itemized Snapshot */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
          <h3 className="font-serif text-base sm:text-lg text-stone-900 dark:text-[#FAF7F2] mb-3">
            Payment & Snapshot Breakdown
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-stone-600 dark:text-stone-300">
              <span>Room Subtotal ({price?.nights}n × {reservation.roomsCount} rm)</span>
              <span className="tabular-nums font-medium">₹{price?.roomSubtotal?.toLocaleString('en-IN')}</span>
            </div>

            {price?.weekendSurcharge ? (
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Weekend Surcharge</span>
                <span className="tabular-nums font-medium">+₹{price.weekendSurcharge.toLocaleString('en-IN')}</span>
              </div>
            ) : null}

            {price?.extraGuestCharges ? (
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Extra Guest Charges</span>
                <span className="tabular-nums font-medium">+₹{price.extraGuestCharges.toLocaleString('en-IN')}</span>
              </div>
            ) : null}

            {price?.addonsList && price.addonsList.length > 0 && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-1">
                {price.addonsList.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between text-stone-500 text-[11px]">
                    <span>Addon: {a.name} (Qty {a.quantity})</span>
                    <span className="tabular-nums">₹{a.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <span>GST ({price?.taxPercent || 12}%)</span>
              <span className="tabular-nums">₹{price?.taxAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Service Fee</span>
              <span className="tabular-nums">₹{price?.serviceFee?.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline font-medium">
              <span className="text-stone-900 dark:text-white font-serif text-base">Total Amount</span>
              <span className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2] tabular-nums font-semibold">
                ₹{price?.finalTotal?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation and Policy Terms */}
        <div className="p-3.5 rounded bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 space-y-1 leading-relaxed">
          <p className="font-semibold text-stone-700 dark:text-stone-300">
            Resort Check-In & Cancellation Terms:
          </p>
          <p>
            • Free cancellation is supported up to 48 hours prior to check-in (14:00 local time). Within 48 hours, cancellations are subject to administrative review.
          </p>
          <p>
            • Government-issued Photo ID (Aadhaar, Passport, Voter ID, or Driving License) is mandatory for all adult guests at check-in.
          </p>
        </div>

        {/* Resort Location & Contact */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs text-stone-500">
          <div>
            <span className="font-semibold text-stone-700 dark:text-stone-300 block">The Destination Resort</span>
            <span>NH715, Bhojkhowa, Kachari Pam, Tezpur, Assam 784027</span>
          </div>
          <div>
            <span className="block font-medium">Concierge: +91 86384 73551</span>
            <span>reservations@destinationresort.in</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 text-xs uppercase tracking-widest font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded btn-luxury inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Voucher</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/booking-lookup')}
          className="w-full sm:w-auto px-6 py-3 text-xs uppercase tracking-widest font-semibold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-100 dark:hover:bg-stone-800 btn-luxury inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Manage Booking Online</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="w-full sm:w-auto px-6 py-3 text-xs uppercase tracking-widest font-semibold text-[#9E7D42] dark:text-[#C5A880] hover:underline text-center cursor-pointer"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};
