import React, { useState } from 'react';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface PoliciesProps {
  onNavigate: (path: string) => void;
}

export const Policies: React.FC<PoliciesProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cancellation'>('cancellation');

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Title */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Transparency & Governance
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-1 mb-3">
            Resort Policies & Terms
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-light">
            Review our guest terms, cancellation rules, privacy commitments, and demonstration disclaimers.
          </p>
        </div>
      </ScrollReveal>

      {/* Mandatory Notice */}
      <ScrollReveal variant="fade-in" duration={450} delay={100}>
        <div className="mb-8 p-4 rounded bg-stone-100 dark:bg-[#151918] border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              Concept Demonstration Policy Template
            </p>
            <p className="text-[11px] leading-relaxed mt-0.5">
              The policies below represent standard international hospitality terms configured for this digital concept. The management of The Destination Resort must review, amend, and legally approve all terms, cancellation deadlines, and refund schedules prior to enabling commercial transactions.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Tabs */}
      <ScrollReveal variant="fade-up" duration={450} delay={150}>
        <div className="flex border-b border-stone-200 dark:border-stone-800 mb-8 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('cancellation')}
            className={`py-3 px-5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === 'cancellation'
                ? 'border-[#9E7D42] dark:border-[#C5A880] text-stone-900 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            Cancellation & Refund Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#9E7D42] dark:border-[#C5A880] text-stone-900 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            Booking Terms & House Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#9E7D42] dark:border-[#C5A880] text-stone-900 dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            Privacy & Data Protection
          </button>
        </div>
      </ScrollReveal>

      {/* Tab Content */}
      <ScrollReveal variant="fade-up" duration={500} delay={200}>
        <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded p-6 sm:p-10 shadow-sm text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-6 leading-relaxed card-luxury">
          {activeTab === 'cancellation' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Cancellation & Refund Policy
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>1. Standard Cancellation Window:</strong> Guests may cancel their confirmed reservation free of charge up to <strong>48 hours prior</strong> to the scheduled check-in time (14:00 IST on the arrival date).
                </p>
                <p>
                  <strong>2. Refund Eligibility:</strong> Cancellations completed within the eligible 48-hour window receive an <strong>85% refund</strong> of the total booking value (reflecting transaction processing and administrative costs).
                </p>
                <p>
                  <strong>3. Short-Notice Cancellations (Within 48 Hours):</strong> Cancellations requested less than 48 hours before check-in cannot be auto-processed online and require manual review by resort management.
                </p>
                <p>
                  <strong>4. No-Show Policy:</strong> Guests who fail to arrive on the confirmed check-in date without prior notification will forfeit the entire reservation value, and room holds will be released the following morning.
                </p>
                <p>
                  <strong>5. Refund Processing Time:</strong> Approved refunds are credited back to the original method of payment within 5 to 7 business days following administrative authorization.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Booking Terms & House Rules
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>1. Check-In & Check-Out Timings:</strong> Check-in is available from <strong>14:00 IST</strong> onwards. Check-out must be completed by <strong>11:00 IST</strong> to allow for sanitization and room turnaround. Late check-out is subject to availability and prior confirmation.
                </p>
                <p>
                  <strong>2. Identification Mandate:</strong> In accordance with Indian regulations, every adult guest must present valid government photo identification (Aadhaar Card, Passport, Voter Card, or Driving License) upon arrival. PAN cards are not accepted as valid identity proof.
                </p>
                <p>
                  <strong>3. Occupancy Limits:</strong> Room occupancies are enforced strictly according to room specifications (Deluxe Cottage: 3 guests; Luxury Suite: 4 guests; Executive Villa: 6 guests). Extra bedding charges apply as detailed in the rate breakdown.
                </p>
                <p>
                  <strong>4. Smoking & Quiet Hours:</strong> All suites, cottages, and indoor public zones are 100% non-smoking. Quiet hours on garden lawns and residential corridors begin at 22:30 IST.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Privacy & Data Protection
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>1. Data Collection:</strong> We collect only information strictly necessary to process your reservation, including guest name, contact telephone, email address, and stay preferences.
                </p>
                <p>
                  <strong>2. No Commercial Resale:</strong> Guest contact information is never sold, leased, or distributed to third-party marketing companies.
                </p>
                <p>
                  <strong>3. Financial Data Security:</strong> Payment information is processed via certified, PCI-DSS compliant payment gateways (e.g. Razorpay). The Destination Resort website does not store or process complete credit card numbers or CVV codes.
                </p>
                <p>
                  <strong>4. Data Subject Rights:</strong> Guests may contact our data concierge at <a href="mailto:reservations@destinationresort.in" className="text-[#9E7D42] dark:text-[#C5A880] underline">reservations@destinationresort.in</a> to review, update, or request deletion of stored reservation profiles.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
};
