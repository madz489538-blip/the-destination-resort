import React, { useState } from 'react';
import { ScrollReveal } from '../components/ScrollReveal.js';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Compass } from 'lucide-react';

interface ContactProps {
  onNavigate: (path: string) => void;
}

export const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit enquiry.');
      } else {
        setSuccessMsg(data.message || 'Your enquiry has been received. Our concierge will be in touch shortly.');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }
    } catch (err: any) {
      setErrorMsg('Failed to send message: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      {/* Header */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
            Guest Concierge & Location
          </span>
          <h1 className="clamp-section-title font-serif text-stone-900 dark:text-[#FAF7F2] mt-2 mb-4">
            Connect With The Destination
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base font-light leading-relaxed">
            Whether planning a private escape, wedding celebration, or seeking custom travel arrangements across Assam, our concierge is at your service.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
        {/* Contact Info & Verified Location (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal variant="fade-up" delay={80} duration={600}>
            <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded p-6 sm:p-8 space-y-6 card-luxury shadow-xs">
              <h3 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Resort Office & Desk
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#9E7D42] dark:text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 block">Location</span>
                    <address className="not-italic text-stone-600 dark:text-stone-400 leading-relaxed mt-0.5">
                      The Destination Resort<br />
                      NH715, Bhojkhowa, Kachari Pam,<br />
                      Tezpur, Assam 784027, India
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#9E7D42] dark:text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 block">Telephone & WhatsApp</span>
                    <a href="tel:+918638473551" className="text-stone-600 dark:text-stone-400 hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors">
                      +91 86384 73551
                    </a>
                    <span className="text-[11px] text-stone-400 block mt-0.5">Available 07:00 – 22:00 IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#9E7D42] dark:text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 block">Email Inquiries</span>
                    <a href="mailto:reservations@destinationresort.in" className="text-stone-600 dark:text-stone-400 hover:text-[#9E7D42] dark:hover:text-[#C5A880] transition-colors">
                      reservations@destinationresort.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#9E7D42] dark:text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 block">Standard Hours</span>
                    <span className="text-stone-600 dark:text-stone-400 block">Check-in: 14:00 onwards</span>
                    <span className="text-stone-600 dark:text-stone-400 block">Check-out: 11:00</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Travel & Accessibility Guide */}
          <ScrollReveal variant="fade-up" delay={160} duration={600}>
            <div className="p-6 rounded bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs space-y-3 card-luxury">
              <div className="flex items-center gap-2 text-stone-900 dark:text-white font-semibold">
                <Compass className="w-4 h-4 text-[#9E7D42] dark:text-[#C5A880]" />
                <span>How to Reach Us</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                • <strong>Tezpur Airport (Salonibari):</strong> ~18 km (approx. 25–30 mins drive via NH715).
              </p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                • <strong>Guwahati Airport (GAU):</strong> ~175 km (approx. 3.5 hrs scenic drive via NH715 & NH27). Private transfers can be booked during checkout.
              </p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                • <strong>Tezpur / Dekargaon Railway Station:</strong> ~12 km.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Guest Enquiry Form (7 cols) */}
        <ScrollReveal variant="fade-up" delay={120} duration={650} className="lg:col-span-7">
          <div className="bg-white dark:bg-[#151918] border border-stone-200 dark:border-stone-800 rounded p-6 sm:p-10 shadow-sm card-luxury h-full">
            <h3 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2] mb-2">
              Send an Enquiry
            </h3>
            <p className="text-xs text-stone-500 mb-8 font-light">
              Fill in your contact information and requirement. Our reservations team will respond within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1 font-medium">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Goswami"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1 font-medium">
                    Mobile / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1 font-medium">
                    Enquiry Nature
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="General Enquiry">General Stay Enquiry</option>
                    <option value="Wedding / Celebration">Weddings & Private Celebrations</option>
                    <option value="Corporate Retreat">Corporate Retreat</option>
                    <option value="Dining Reservation">Private Dining Reservation</option>
                    <option value="Tour / Safari Planning">Kaziranga / Nameri Safari</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1 font-medium">
                  Message / Dates / Requirements *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Let us know your tentative travel dates, number of guests, or special arrangement requests..."
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded btn-luxury disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sending...' : 'Transmit Enquiry'}</span>
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
