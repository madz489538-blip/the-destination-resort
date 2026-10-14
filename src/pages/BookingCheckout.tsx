import React, { useState, useEffect } from 'react';
import { RoomType, AddonItem, PriceBreakdown } from '../types/resort.js';
import { ResortVisual } from '../components/ResortVisual.js';
import {
  Calendar,
  Users,
  Check,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Lock,
} from 'lucide-react';

interface BookingCheckoutProps {
  searchData: {
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    roomsCount: number;
  };
  selectedRoom: RoomType;
  onBookingComplete: (reservation: any) => void;
  onBackToSearch: () => void;
}

export const BookingCheckout: React.FC<BookingCheckoutProps> = ({
  searchData,
  selectedRoom,
  onBookingComplete,
  onBackToSearch,
}) => {
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('+91 ');
  const [specialRequests, setSpecialRequests] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<'demo_instant' | 'razorpay_test'>('demo_instant');

  // Server Price Calculation
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load available add-ons
  useEffect(() => {
    fetch('/api/addons')
      .then((res) => res.json())
      .then((data) => setAddons(data))
      .catch((err) => console.error('Failed to load add-ons:', err));
  }, []);

  // Recalculate price whenever add-ons change
  useEffect(() => {
    setCalculatingPrice(true);
    const addonsPayload = Object.entries(selectedAddons)
      .filter(([_, qty]) => qty > 0)
      .map(([id, quantity]) => ({ id, quantity }));

    fetch('/api/pricing/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomTypeId: selectedRoom.id,
        checkInDate: searchData.checkInDate,
        checkOutDate: searchData.checkOutDate,
        roomsCount: searchData.roomsCount,
        adults: searchData.adults,
        children: searchData.children,
        selectedAddons: addonsPayload,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setPriceBreakdown(data);
        }
      })
      .catch((err) => console.error('Pricing calc error:', err))
      .finally(() => setCalculatingPrice(false));
  }, [selectedAddons, selectedRoom, searchData]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const current = prev[id] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      } else {
        return { ...prev, [id]: 1 };
      }
    });
  };

  const updateAddonQty = (id: string, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[id] || 0;
      const nextVal = Math.max(1, current + delta);
      return { ...prev, [id]: nextVal };
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      setErrorMsg('Please review and accept the booking terms and demonstration disclaimer.');
      return;
    }

    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMsg('Please complete all required guest contact fields.');
      return;
    }

    setSubmitting(true);

    try {
      const addonsPayload = Object.entries(selectedAddons)
        .filter(([_, qty]) => qty > 0)
        .map(([id, quantity]) => ({ id, quantity }));

      // 1. Create temporary hold on backend
      const holdRes = await fetch('/api/reservations/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: selectedRoom.id,
          checkInDate: searchData.checkInDate,
          checkOutDate: searchData.checkOutDate,
          roomsCount: searchData.roomsCount,
          adults: searchData.adults,
          children: searchData.children,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
          selectedAddons: addonsPayload,
          paymentMethod: paymentChoice,
          isDemo: true,
        }),
      });

      const holdData = await holdRes.json();
      if (!holdRes.ok) {
        setErrorMsg(holdData.error || 'Failed to create reservation hold.');
        setSubmitting(false);
        return;
      }

      const reservation = holdData;

      // 2. Initiate payment order
      const initRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation.id }),
      });
      const initData = await initRes.json();

      // 3. Confirm payment with simulated verification
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          orderId: initData.orderId,
          paymentId: `pay_demo_${Date.now()}`,
          signature: 'simulated_demo_hash_tdr',
          isDemoSimulation: true,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setErrorMsg(verifyData.error || 'Payment verification failed.');
        setSubmitting(false);
        return;
      }

      // Fetch confirmed reservation details
      const lookupRes = await fetch(
        `/api/reservations/lookup?reference=${reservation.booking_reference}&contact=${encodeURIComponent(guestEmail)}`
      );
      const confirmedRes = await lookupRes.json();

      onBookingComplete(confirmedRes);
    } catch (err: any) {
      setErrorMsg('Error processing booking: ' + err.message);
      setSubmitting(false);
    }
  };

  const getVisualType = (id: string): 'cottage' | 'suite' | 'villa' | 'serene' => {
    if (id.includes('cottage')) return 'cottage';
    if (id.includes('suite')) return 'suite';
    if (id.includes('villa')) return 'villa';
    return 'serene';
  };

  return (
    <div className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Breadcrumb / Step Indicator */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200 dark:border-stone-800 text-xs">
        <button
          type="button"
          onClick={onBackToSearch}
          className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          ← Back to Rooms
        </button>
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <span className="text-stone-900 dark:text-white font-semibold">Checkout Flow</span>
          <span>·</span>
          <span>Guest Details & Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Form & Add-ons (7 cols) */}
        <div className="lg:col-span-7 space-y-8 min-w-0">
          {/* Selected Room Header */}
          <div className="bg-white dark:bg-[#161918] p-4 sm:p-6 rounded border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-full sm:w-44 h-36 sm:h-32 shrink-0 rounded overflow-hidden">
              <ResortVisual type={getVisualType(selectedRoom.id)} className="w-full h-full" alt={selectedRoom.name} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#9E7D42] dark:text-[#C5A880] font-semibold">
                Selected Residence
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-[#FAF7F2] mt-0.5 truncate">
                {selectedRoom.name}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                {searchData.roomsCount} Room(s) · {searchData.checkInDate} to {searchData.checkOutDate} (
                {priceBreakdown?.nights || 1} nights)
              </p>
              <div className="text-xs text-stone-500 mt-1.5">
                Occupancy: {searchData.adults} Adults{searchData.children > 0 ? `, ${searchData.children} Children` : ''}
              </div>
            </div>
          </div>

          {/* Optional Add-ons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl text-stone-900 dark:text-[#FAF7F2]">
                Enhance Your Stay (Optional Add-ons)
              </h3>
              <span className="text-[11px] text-stone-400">Server verified</span>
            </div>

            <div className="space-y-2.5">
              {addons.map((item) => {
                const isSelected = Boolean(selectedAddons[item.id]);
                const qty = selectedAddons[item.id] || 1;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 rounded border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#9E7D42] dark:border-[#C5A880] bg-amber-50/30 dark:bg-amber-950/20'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161918]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAddon(item.id)}
                        className="mt-1 rounded text-[#9E7D42] focus:ring-[#9E7D42] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-[#FAF7F2]">
                          {item.name}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-light mt-0.5">
                          {item.description}
                        </p>
                        <div className="text-[11px] text-[#9E7D42] dark:text-[#C5A880] mt-1 font-semibold">
                          ₹{item.price.toLocaleString('en-IN')} (
                          {item.pricingType.replace('_', ' ')})
                        </div>
                      </div>
                    </div>

                    {isSelected && item.pricingType !== 'per_guest' && (
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-xs text-stone-500">Qty:</span>
                        <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-900">
                          <button
                            type="button"
                            onClick={() => updateAddonQty(item.id, -1)}
                            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
                          >
                            <Minus className="w-3 h-3 text-stone-700 dark:text-stone-300" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateAddonQty(item.id, 1)}
                            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
                          >
                            <Plus className="w-3 h-3 text-stone-700 dark:text-stone-300" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guest Information Form */}
          <form id="checkoutForm" onSubmit={handleSubmitBooking} className="space-y-5">
            <h3 className="font-serif text-lg sm:text-xl text-stone-900 dark:text-[#FAF7F2] pb-2 border-b border-stone-200 dark:border-stone-800">
              Guest Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Full Name (as per Govt ID) *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Priyam Barua"
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#161918] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="priyam@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#161918] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#161918] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                  Special Requests / Arrival Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g., Estimated arrival time, dietary preferences, quiet room request."
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#161918] border border-stone-300 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-serif text-lg sm:text-xl text-stone-900 dark:text-[#FAF7F2]">
                Payment Option
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 ${
                    paymentChoice === 'demo_instant'
                      ? 'border-[#9E7D42] dark:border-[#C5A880] bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161918]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    value="demo_instant"
                    checked={paymentChoice === 'demo_instant'}
                    onChange={() => setPaymentChoice('demo_instant')}
                    className="mt-1 text-[#9E7D42]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                      Demo Instant Guarantee
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Verifies server availability and creates a confirmed demo booking voucher immediately.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 ${
                    paymentChoice === 'razorpay_test'
                      ? 'border-[#9E7D42] dark:border-[#C5A880] bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161918]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentOption"
                    value="razorpay_test"
                    checked={paymentChoice === 'razorpay_test'}
                    onChange={() => setPaymentChoice('razorpay_test')}
                    className="mt-1 text-[#9E7D42]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                      Razorpay Architecture Test Mode
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Uses server-side order generation and HMAC SHA256 signature verification pipeline.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Terms and Policies */}
            <div className="p-3.5 sm:p-4 rounded bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-[#9E7D42] focus:ring-[#9E7D42] shrink-0"
                  required
                />
                <span className="leading-relaxed text-[11px] sm:text-xs">
                  I understand this is an <strong>Unofficial Concept Demonstration</strong> for The Destination Resort. I agree to the Check-in (14:00) and Check-out (11:00) policies, the 48-hour cancellation policy, and understand that sample inventory and prices are illustrative.
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Immutable Price Breakdown (5 cols) */}
        <div className="lg:col-span-5 min-w-0">
          <div className="lg:sticky lg:top-24 bg-white dark:bg-[#161918] p-5 sm:p-6 rounded border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
            <h3 className="font-serif text-lg sm:text-xl text-stone-900 dark:text-[#FAF7F2] pb-2.5 border-b border-stone-200 dark:border-stone-800">
              Price Breakdown (INR)
            </h3>

            {calculatingPrice || !priceBreakdown ? (
              <div className="py-8 text-center text-xs text-stone-400">
                Updating server pricing...
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>
                    Accommodation ({priceBreakdown.nights}n × {searchData.roomsCount} rm)
                  </span>
                  <span className="tabular-nums font-semibold text-stone-900 dark:text-white">
                    ₹{priceBreakdown.roomSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {priceBreakdown.weekendSurcharge > 0 && (
                  <div className="flex justify-between text-stone-600 dark:text-stone-300">
                    <span>Weekend Adjustment</span>
                    <span className="tabular-nums font-semibold text-stone-900 dark:text-white">
                      +₹{priceBreakdown.weekendSurcharge.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {priceBreakdown.extraGuestCharges > 0 && (
                  <div className="flex justify-between text-stone-600 dark:text-stone-300">
                    <span>Additional Guest Charges</span>
                    <span className="tabular-nums font-semibold text-stone-900 dark:text-white">
                      +₹{priceBreakdown.extraGuestCharges.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {priceBreakdown.addonsList.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">
                      Selected Add-ons
                    </span>
                    {priceBreakdown.addonsList.map((a) => (
                      <div key={a.id} className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                        <span>
                          {a.name} (×{a.quantity})
                        </span>
                        <span className="tabular-nums">₹{a.total.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1">
                  <div className="flex justify-between text-stone-500">
                    <span>GST ({priceBreakdown.taxPercent}%)</span>
                    <span className="tabular-nums">₹{priceBreakdown.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Resort Service Fee</span>
                    <span className="tabular-nums">₹{priceBreakdown.serviceFee.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-stone-500 block font-semibold">
                      Total Payable (Demo)
                    </span>
                    <span className="text-[10px] text-stone-400 font-light">All taxes included</span>
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-[#FAF7F2] tabular-nums">
                    ₹{priceBreakdown.finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              form="checkoutForm"
              disabled={submitting || calculatingPrice}
              className="w-full py-3.5 px-4 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>

            <div className="text-[10px] sm:text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 font-light">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9E7D42] dark:text-[#C5A880]" />
              <span>Concurrently protected against double-booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
