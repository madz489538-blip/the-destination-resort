import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Bed,
  CreditCard,
  Settings,
  LogOut,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Mail,
  ShieldCheck,
  Building,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle.js';

interface AdminPortalProps {
  onNavigateHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateHome }) => {
  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('tdr_admin_token');
  });
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('ResortAdmin2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Navigation
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'inventory' | 'pricing' | 'enquiries' | 'settings'
  >('overview');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any | null>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Filters for bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingSearch, setBookingSearch] = useState('');

  // Password change state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Maintenance block form
  const [blockRoomId, setBlockRoomId] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Scheduled Maintenance');

  // Verify auth on mount
  useEffect(() => {
    if (authToken) {
      fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Invalid session');
          return res.json();
        })
        .then((data) => {
          setCurrentUser(data.user);
          loadAllAdminData(authToken);
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [authToken]);

  const loadAllAdminData = async (token: string) => {
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, bookRes, invRes, enqRes, setRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers }),
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/inventory', { headers }),
        fetch('/api/admin/enquiries', { headers }),
        fetch('/api/settings'),
      ]);

      if (dashRes.ok) setDashboardData(await dashRes.json());
      if (bookRes.ok) setBookings(await bookRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (enqRes.ok) setEnquiries(await enqRes.json());
      if (setRes.ok) setSiteSettings(await setRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed.');
      } else {
        localStorage.setItem('tdr_admin_token', data.token);
        setAuthToken(data.token);
        setCurrentUser(data.user);
        loadAllAdminData(data.token);
      }
    } catch (err: any) {
      setLoginError('Network error connecting to management authentication.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (authToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem('tdr_admin_token');
    setAuthToken(null);
    setCurrentUser(null);
  };

  const handleUpdateBookingStatus = async (id: number, status: string, notes?: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        loadAllAdminData(authToken);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleProcessRefund = async (id: number) => {
    if (!authToken) return;
    const reason = prompt('Please enter administrative reason for this refund:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/bookings/${id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        alert('Refund recorded and marked COMPLETED.');
        loadAllAdminData(authToken);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to refund booking');
      }
    } catch (err: any) {
      alert('Error processing refund: ' + err.message);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !blockRoomId || !blockStart || !blockEnd) return;

    try {
      const res = await fetch('/api/admin/room-blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          physicalRoomId: blockRoomId,
          startDate: blockStart,
          endDate: blockEnd,
          reason: blockReason,
        }),
      });

      if (res.ok) {
        loadAllAdminData(authToken);
        setBlockStart('');
        setBlockEnd('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add room maintenance block');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleRemoveBlock = async (blockId: number) => {
    if (!authToken) return;
    try {
      await fetch(`/api/admin/room-blocks/${blockId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      loadAllAdminData(authToken);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !siteSettings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(siteSettings),
      });

      if (res.ok) {
        alert('Resort settings and policies successfully updated.');
        loadAllAdminData(authToken);
      }
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!authToken) return;

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword: currPass, newPassword: newPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassMsg({ type: 'error', text: data.error || 'Failed to update password.' });
      } else {
        setPassMsg({ type: 'success', text: 'Password successfully updated!' });
        setCurrPass('');
        setNewPass('');
      }
    } catch (err: any) {
      setPassMsg({ type: 'error', text: 'Network error updating credentials.' });
    }
  };

  const handleExportCSV = () => {
    if (!authToken) return;
    window.open(`/api/admin/reports/csv?token=${encodeURIComponent(authToken)}`, '_blank');
  };

  // If not logged in, render Admin Login screen
  if (!authToken || !currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-md w-full bg-white dark:bg-[#161619] border border-stone-200 dark:border-stone-800 rounded p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9E7D42] dark:text-[#C5A880] font-semibold">
              The Destination Resort
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-[#FAF7F2]">
              Management Portal
            </h1>
            <p className="text-xs text-stone-500 font-light">
              Restricted access for authorized resort administrators.
            </p>
          </div>

          <div className="p-3.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200">
            <p className="font-medium">Demonstration Credentials:</p>
            <p className="text-[11px] mt-0.5">
              Username: <code className="font-mono font-bold">admin</code>
              <br />
              Password: <code className="font-mono font-bold">ResortAdmin2026!</code>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1 font-medium">
                Admin Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1 font-medium">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                required
              />
            </div>

            {loginError && (
              <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded hover:opacity-90 disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Management'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            >
              ← Return to Resort Guest Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Bookings for the Bookings Tab
  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const refMatch = b.booking_reference?.toLowerCase().includes(q);
      const nameMatch = b.guest_name?.toLowerCase().includes(q);
      const phoneMatch = b.guest_phone?.toLowerCase().includes(q);
      if (!refMatch && !nameMatch && !phoneMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0D100F] text-stone-800 dark:text-stone-200 transition-colors w-full max-w-full overflow-hidden">
      {/* Admin Top Bar */}
      <header className="bg-white dark:bg-[#151918] border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
            <span className="font-serif text-sm sm:text-lg tracking-wider text-stone-900 dark:text-[#FAF7F2] truncate">
              THE DESTINATION RESORT
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 uppercase tracking-wider font-semibold shrink-0">
              Admin
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs min-w-0">
            <span className="text-stone-500 text-[11px] truncate">
              User: <strong className="text-stone-800 dark:text-stone-200">{currentUser.username}</strong>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => loadAllAdminData(authToken)}
                className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-900 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white dark:bg-[#151918] border-b border-stone-200 dark:border-stone-800 px-2 sm:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex gap-1 sm:gap-3 overflow-x-auto min-w-0 max-w-full pb-1 scrollbar-none">
          {[
            { key: 'overview', label: 'Dashboard KPIs', icon: TrendingUp },
            { key: 'bookings', label: 'Bookings & Holds', icon: Calendar },
            { key: 'inventory', label: 'Rooms & Physical Inventory', icon: Bed },
            { key: 'pricing', label: 'Tariffs & Site Policies', icon: DollarSign },
            { key: 'enquiries', label: 'Guest Messages', icon: Mail },
            { key: 'settings', label: 'Security & Account', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3.5 px-3 text-xs uppercase tracking-wider font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#9E7D42] dark:border-[#C5A880] text-[#9E7D42] dark:text-[#C5A880]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-[#161619] p-5 rounded border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">
                  Today's Arrivals
                </span>
                <span className="font-serif text-3xl font-semibold text-stone-900 dark:text-white tabular-nums mt-1 block">
                  {dashboardData?.kpis?.todayArrivals ?? 0}
                </span>
                <span className="text-[11px] text-stone-500 mt-1 block">Scheduled check-ins</span>
              </div>

              <div className="bg-white dark:bg-[#161619] p-5 rounded border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">
                  Today's Departures
                </span>
                <span className="font-serif text-3xl font-semibold text-stone-900 dark:text-white tabular-nums mt-1 block">
                  {dashboardData?.kpis?.todayDepartures ?? 0}
                </span>
                <span className="text-[11px] text-stone-500 mt-1 block">Scheduled check-outs</span>
              </div>

              <div className="bg-white dark:bg-[#161619] p-5 rounded border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">
                  Current Occupancy
                </span>
                <span className="font-serif text-3xl font-semibold text-stone-900 dark:text-white tabular-nums mt-1 block">
                  {dashboardData?.kpis?.occupancyPercent ?? 0}%
                </span>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  {dashboardData?.kpis?.occupiedRooms ?? 0} of {dashboardData?.kpis?.totalRooms ?? 13} physical rooms occupied
                </span>
              </div>

              <div className="bg-white dark:bg-[#161619] p-5 rounded border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">
                  Recorded Revenue
                </span>
                <span className="font-serif text-2xl font-semibold text-stone-900 dark:text-white tabular-nums mt-1 block">
                  ₹{(dashboardData?.kpis?.demoRevenue ?? 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
                  Demonstration Recorded Revenue
                </span>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white dark:bg-[#161619] p-6 rounded border border-stone-200 dark:border-stone-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2]">
                    Recent Reservation Activity
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs uppercase tracking-wider text-[#9E7D42] dark:text-[#C5A880] hover:underline"
                  >
                    View All Bookings →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Reference</th>
                        <th className="py-2.5">Guest</th>
                        <th className="py-2.5">Dates</th>
                        <th className="py-2.5">Room</th>
                        <th className="py-2.5">Amount</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {dashboardData?.recentBookings?.map((r: any) => (
                        <tr key={r.id}>
                          <td className="py-3 font-mono font-medium text-stone-900 dark:text-stone-100">
                            {r.booking_reference}
                          </td>
                          <td className="py-3 text-stone-700 dark:text-stone-300">{r.guest_name}</td>
                          <td className="py-3 text-stone-500">
                            {r.check_in_date} to {r.check_out_date}
                          </td>
                          <td className="py-3 text-stone-500">{r.roomTypeName}</td>
                          <td className="py-3 tabular-nums font-medium text-stone-800 dark:text-stone-200">
                            ₹{r.priceSnapshot?.finalTotal?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                r.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : r.status === 'CANCELLED'
                                  ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status breakdown card */}
              <div className="bg-white dark:bg-[#161619] p-6 rounded border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2]">
                  Resort Operational Status
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-2.5 rounded bg-stone-50 dark:bg-stone-900">
                    <span className="text-stone-500">Active Room Categories</span>
                    <span className="font-semibold">{inventory?.roomTypes?.length || 4} Categories</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-stone-50 dark:bg-stone-900">
                    <span className="text-stone-500">Total Physical Rooms</span>
                    <span className="font-semibold">{inventory?.physicalRooms?.length || 13} Rooms</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-stone-50 dark:bg-stone-900">
                    <span className="text-stone-500">Active Maintenance Blocks</span>
                    <span className="font-semibold">{inventory?.blocks?.length || 0} Blocked</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-stone-50 dark:bg-stone-900">
                    <span className="text-stone-500">Unanswered Inquiries</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {enquiries.filter((e) => e.status === 'NEW').length} New
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full py-2.5 text-xs uppercase tracking-wider font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Full Bookings CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                  Booking Records & Lifecycle Management
                </h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Confirm, cancel, review refunds, and inspect immutable price snapshots for all reservations.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 rounded flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white dark:bg-[#161619] p-4 rounded border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by reference, name, phone..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-stone-400">Status:</span>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 py-1.5 px-3 rounded text-stone-800 dark:text-stone-200"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white dark:bg-[#161619] rounded border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Reference</th>
                      <th className="p-3.5">Guest & Contact</th>
                      <th className="p-3.5">Check-In / Out</th>
                      <th className="p-3.5">Residence & Assigned</th>
                      <th className="p-3.5">Total (INR)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-stone-900 dark:text-white block">
                            {b.booking_reference}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {b.is_demo ? 'DEMO BOOKING' : 'LIVE'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                            {b.guest_name}
                          </span>
                          <span className="text-stone-500 block text-[11px]">{b.guest_phone}</span>
                          <span className="text-stone-400 block text-[10px]">{b.guest_email}</span>
                        </td>
                        <td className="p-3.5 text-stone-600 dark:text-stone-300">
                          <span className="block font-medium">{b.check_in_date}</span>
                          <span className="text-stone-400 text-[11px] block">to {b.check_out_date}</span>
                        </td>
                        <td className="p-3.5 text-stone-600 dark:text-stone-300">
                          <span className="block font-medium">{b.roomTypeName}</span>
                          <span className="text-stone-400 text-[11px] block">
                            {b.rooms_count} Room · {b.adults} Adults
                          </span>
                          {b.assignedRooms && b.assignedRooms.length > 0 && (
                            <span className="text-[#9E7D42] dark:text-[#C5A880] text-[10px] block font-mono">
                              Rooms: {b.assignedRooms.join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 tabular-nums font-semibold text-stone-900 dark:text-white">
                          ₹{b.priceSnapshot?.finalTotal?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : b.status === 'CANCELLED'
                                ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                : b.status === 'REFUNDED'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          {b.status === 'PAYMENT_PENDING' || b.status === 'PENDING' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED', 'Confirmed by administrator')}
                              className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              Confirm
                            </button>
                          ) : null}

                          {b.status === 'CONFIRMED' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED', 'Cancelled by administrator')}
                              className="px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 border border-rose-200 dark:border-rose-900 rounded"
                            >
                              Cancel
                            </button>
                          ) : null}

                          {b.status === 'CANCELLED' ? (
                            <button
                              type="button"
                              onClick={() => handleProcessRefund(b.id)}
                              className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              Process Refund
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: PHYSICAL INVENTORY & ROOMS */}
        {/* ==================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Room Types & Physical Units
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Manage room capacities, base tariffs, and individual physical room units (C101, S201, V301, etc.).
              </p>
            </div>

            {/* Room Types Catalogue Table */}
            <div className="bg-white dark:bg-[#161619] p-6 rounded border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2]">
                Configured Room Categories
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Category Name</th>
                      <th className="py-2.5">Max Occupancy</th>
                      <th className="py-2.5">Bed Config</th>
                      <th className="py-2.5">Base Rate (INR)</th>
                      <th className="py-2.5">Weekend Rate</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {inventory?.roomTypes?.map((rt: any) => (
                      <tr key={rt.id}>
                        <td className="py-3 font-semibold text-stone-900 dark:text-stone-100">{rt.name}</td>
                        <td className="py-3 text-stone-500">Max {rt.max_occupancy} (Adults: {rt.max_adults})</td>
                        <td className="py-3 text-stone-500">{rt.bed_config}</td>
                        <td className="py-3 font-medium text-stone-900 dark:text-white tabular-nums">
                          ₹{rt.base_nightly_rate?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-stone-500 tabular-nums">
                          ₹{rt.weekend_rate ? rt.weekend_rate?.toLocaleString('en-IN') : rt.base_nightly_rate}
                        </td>
                        <td className="py-3">
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">● Published</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Physical Rooms & Blocks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Physical units */}
              <div className="bg-white dark:bg-[#161619] p-6 rounded border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2]">
                  Physical Rooms ({inventory?.physicalRooms?.length || 0})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {inventory?.physicalRooms?.map((pr: any) => (
                    <div
                      key={pr.id}
                      className="p-3 rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs"
                    >
                      <span className="font-mono font-bold text-stone-900 dark:text-white block">
                        {pr.room_number}
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate">{pr.roomTypeName}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">
                        ● {pr.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Blocks form & list */}
              <div className="bg-white dark:bg-[#161619] p-6 rounded border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2]">
                  Add Maintenance Inventory Block
                </h3>
                <form onSubmit={handleAddBlock} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-400 mb-1">Select Physical Room</label>
                    <select
                      value={blockRoomId}
                      onChange={(e) => setBlockRoomId(e.target.value)}
                      className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-800 dark:text-stone-200"
                      required
                    >
                      <option value="">Select a room...</option>
                      {inventory?.physicalRooms?.map((pr: any) => (
                        <option key={pr.id} value={pr.id}>
                          {pr.room_number} ({pr.roomTypeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={blockStart}
                        onChange={(e) => setBlockStart(e.target.value)}
                        className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-800 dark:text-stone-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={blockEnd}
                        min={blockStart}
                        onChange={(e) => setBlockEnd(e.target.value)}
                        className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-800 dark:text-stone-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Reason</label>
                    <input
                      type="text"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="e.g. Deep cleaning, teak polish, plumbing"
                      className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-800 dark:text-stone-200"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 text-xs uppercase tracking-wider font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded hover:opacity-90"
                  >
                    Lock Room for Maintenance
                  </button>
                </form>

                {inventory?.blocks && inventory.blocks.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">
                      Active Room Blocks
                    </span>
                    {inventory.blocks.map((b: any) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-2 rounded bg-stone-50 dark:bg-stone-900 text-xs"
                      >
                        <div>
                          <span className="font-semibold block">{b.room_number}</span>
                          <span className="text-stone-400 text-[10px]">
                            {b.start_date} to {b.end_date} · {b.reason}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlock(b.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: PRICING & POLICIES */}
        {/* ==================================================== */}
        {activeTab === 'pricing' && siteSettings && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Tariff Rules & Site Policies
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Configure GST percentage, check-in and check-out timings, and cancellation rules.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#161619] p-6 sm:p-8 rounded border border-stone-200 dark:border-stone-800 shadow-xs space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Resort Name</label>
                  <input
                    type="text"
                    value={siteSettings.resortName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, resortName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Currency</label>
                  <input
                    type="text"
                    value={siteSettings.currency}
                    disabled
                    className="w-full p-2.5 bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded text-stone-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Applicable GST Tax (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={siteSettings.taxPercent}
                    onChange={(e) => setSiteSettings({ ...siteSettings, taxPercent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Service Fee (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={siteSettings.serviceFeePercent}
                    onChange={(e) => setSiteSettings({ ...siteSettings, serviceFeePercent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Standard Check-In Time</label>
                  <input
                    type="text"
                    value={siteSettings.checkInTime}
                    onChange={(e) => setSiteSettings({ ...siteSettings, checkInTime: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Standard Check-Out Time</label>
                  <input
                    type="text"
                    value={siteSettings.checkOutTime}
                    onChange={(e) => setSiteSettings({ ...siteSettings, checkOutTime: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Free Cancellation Prior Window (Hours)</label>
                  <input
                    type="number"
                    value={siteSettings.cancellationHoursPrior}
                    onChange={(e) => setSiteSettings({ ...siteSettings, cancellationHoursPrior: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Refund Percentage on Cancellation (%)</label>
                  <input
                    type="number"
                    value={siteSettings.refundPercentage}
                    onChange={(e) => setSiteSettings({ ...siteSettings, refundPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Resort Contact Telephone</label>
                <input
                  type="text"
                  value={siteSettings.phone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Physical Address</label>
                <input
                  type="text"
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 text-xs uppercase tracking-widest font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded hover:opacity-90"
              >
                Save Updated Policies
              </button>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: GUEST ENQUIRIES */}
        {/* ==================================================== */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Guest Concierge Inquiries ({enquiries.length})
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Messages submitted via the contact form and dining reservation requests.
              </p>
            </div>

            <div className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="bg-white dark:bg-[#161619] p-6 rounded border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 dark:text-white text-sm">
                        {enq.name}
                      </span>
                      <span className="text-stone-400 text-xs">({enq.email} · {enq.phone})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          enq.status === 'NEW'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Subject: {enq.subject}
                    </p>

                    <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                      "{enq.message}"
                    </p>

                    <span className="text-[10px] text-stone-400 block">
                      Received: {enq.created_at}
                    </span>
                  </div>

                  <div className="self-end sm:self-center shrink-0">
                    {enq.status === 'NEW' && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!authToken) return;
                          await fetch(`/api/admin/enquiries/${enq.id}/status`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${authToken}`,
                            },
                            body: JSON.stringify({ status: 'RESPONDED' }),
                          });
                          loadAllAdminData(authToken);
                        }}
                        className="px-3 py-1.5 text-xs bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 rounded hover:opacity-90"
                      >
                        Mark Responded
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: SECURITY & CREDENTIALS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-md space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 dark:text-[#FAF7F2]">
                Admin Credentials & Security
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Update the password for your administrator account.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="bg-white dark:bg-[#161619] p-6 rounded border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Current Password</label>
                <input
                  type="password"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">New Password (min 8 characters)</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  required
                />
              </div>

              {passMsg && (
                <div
                  className={`p-2.5 rounded text-xs ${
                    passMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
                >
                  {passMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 text-xs uppercase tracking-wider font-semibold bg-[#9E7D42] text-white dark:bg-[#C5A880] dark:text-stone-950 rounded hover:opacity-90"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
