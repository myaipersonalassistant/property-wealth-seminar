import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Mail,
  LogOut,
  Home,
  RefreshCw,
  Download,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Lock,
  Send,
  Loader2,
  X,
  BarChart2,
  Eye,
  TrendingUp,
  Clock,
  FileUp,
  Sparkles,
} from 'lucide-react';
import { getCurrentAdmin, logoutAdmin } from '@/lib/admin-auth';
import { fetchLeads, sendLeadEmails, fetchLeadCampaigns, fetchAllOrders, type Order } from '@/lib/api';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

interface Lead {
  id: string;
  name: string;
  email: string;
  sources: string[];
  firstSeen: string;
  lastActivity: string;
}

interface Campaign {
  id: string;
  subject: string;
  recipient_count: number;
  sent_count: number;
  opened_count: number;
  bounced_count: number;
  open_rate: string;
  bounce_rate: string;
  sent_at: string;
}

const PENDING_REMINDER_TEMPLATE = {
  subject: "Your seat is still waiting — Build Wealth Through Property seminar",
  body: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;">
<p style="font-size:16px;line-height:1.6;color:#334155;">Hi there,</p>
<p style="font-size:16px;line-height:1.6;color:#334155;">You recently started reserving your spot at the <strong>Build Wealth Through Property</strong> seminar — and we wanted to make sure you didn't miss out.</p>
<p style="font-size:16px;line-height:1.6;color:#334155;">Sometimes the best intentions get interrupted. If you're still interested in learning how ordinary people build wealth through property (even without large savings), your seat is still available.</p>
<div style="background:#fef3c7;border-radius:12px;padding:20px;margin:24px 0;">
<p style="margin:0 0 8px 0;font-size:14px;color:#78350f;font-weight:600;">Event details</p>
<p style="margin:0;font-size:15px;color:#334155;line-height:1.6;"><strong>When:</strong> Saturday, 14 March 2026 — 2:00 PM to 5:00 PM</p>
<p style="margin:0;font-size:15px;color:#334155;line-height:1.6;"><strong>Where:</strong> Europa Hotel, Great Victoria Street, Belfast BT2 7AP</p>
<p style="margin:0;font-size:15px;color:#334155;line-height:1.6;"><strong>Price:</strong> £25 per ticket</p>
</div>
<p style="font-size:16px;line-height:1.6;color:#334155;">You'll hear from property investor Chris Ifonlaja and a panel of experts on mortgages, tax planning, legal responsibilities, and real investment experiences. Limited seats are available.</p>
<p style="font-size:16px;line-height:1.6;color:#334155;">Click below to complete your booking — it only takes a minute.</p>
<p style="margin:28px 0;">
<a href="{{BOOKING_URL}}" style="display:inline-block;background:#d97706;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">Complete your booking</a>
</p>
<p style="font-size:16px;line-height:1.6;color:#334155;">We'd love to see you there.</p>
<p style="font-size:16px;line-height:1.6;color:#334155;">Best regards,<br>The Build Wealth Through Property Team</p>
</div>`,
};

const AdminLeads: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [admin, setAdmin] = useState<unknown>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendSubject, setSendSubject] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const pendingEmails = pendingOrders
    .map((o) => (o.customer_email || '').trim().toLowerCase())
    .filter((e) => e && e.includes('@'));
  const pendingEmailsDeduped = [...new Set(pendingEmails)];

  useEffect(() => {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdmin(currentAdmin);
    loadLeads();
    loadCampaigns();
  }, [navigate]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading leads:', error);
      if (error instanceof Error && error.message === 'Unauthorized') {
        logoutAdmin();
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingOrders = async () => {
    try {
      setPendingLoading(true);
      const data = await fetchAllOrders();
      const orders = Array.isArray(data) ? data : [];
      const completedEmails = new Set(
        orders.filter((o: Order) => o.status === 'completed').map((o) => (o.customer_email || '').trim().toLowerCase()).filter(Boolean)
      );
      const pending = orders
        .filter((o: Order) => o.status === 'pending')
        .filter((o) => !completedEmails.has((o.customer_email || '').trim().toLowerCase()));
      setPendingOrders(pending);
    } catch (error) {
      console.error('Error loading pending orders:', error);
      if (error instanceof Error && error.message === 'Unauthorized') {
        logoutAdmin();
        navigate('/admin/login');
      }
    } finally {
      setPendingLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const data = await fetchLeadCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  };


  const toggleLead = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const selectAll = () => setSelectedEmails(new Set(leads.map((l) => l.email)));
  const deselectAll = () => setSelectedEmails(new Set());

  const openSendModal = () => {
    setSendSubject('');
    setSendBody('');
    setSendError(null);
    setShowSendModal(true);
  };

  const loadAllPendingAndOpenModal = async () => {
    try {
      setPendingLoading(true);
      const data = await fetchAllOrders();
      const orders = Array.isArray(data) ? data : [];
      const completedEmails = new Set(
        orders.filter((o: Order) => o.status === 'completed').map((o) => (o.customer_email || '').trim().toLowerCase()).filter(Boolean)
      );
      const pending = orders
        .filter((o: Order) => o.status === 'pending')
        .filter((o) => !completedEmails.has((o.customer_email || '').trim().toLowerCase()));
      setPendingOrders(pending);
      const emails = [...new Set(pending.map((o) => (o.customer_email || '').trim().toLowerCase()).filter((e) => e && e.includes('@')))];
      if (emails.length === 0) {
        setSendError('No pending orders found.');
        setShowSendModal(true);
        return;
      }
      setSelectedEmails(new Set(emails));
      setSendSubject(PENDING_REMINDER_TEMPLATE.subject);
      setSendBody(
        PENDING_REMINDER_TEMPLATE.body.replace(
          '{{BOOKING_URL}}',
          typeof window !== 'undefined' ? `${window.location.origin}/booking` : '/booking'
        )
      );
      setSendError(null);
      setShowSendModal(true);
    } catch (err) {
      console.error('Error loading pending:', err);
      setSendError('Failed to load pending orders.');
    } finally {
      setPendingLoading(false);
    }
  };

  const usePendingTemplate = () => {
    setSendSubject(PENDING_REMINDER_TEMPLATE.subject);
    setSendBody(
      PENDING_REMINDER_TEMPLATE.body.replace(
        '{{BOOKING_URL}}',
        typeof window !== 'undefined' ? `${window.location.origin}/booking` : '/booking'
      )
    );
  };

  const handleLoadFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setSendError('CSV must have a header row and at least one data row.');
        setShowSendModal(true);
        e.target.value = '';
        return;
      }
      const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
      const emailIdx = header.findIndex((h) => h === 'email' || h === 'e-mail' || h === 'customer_email');
      if (emailIdx < 0) {
        setSendError('CSV must contain an "Email" or "customer_email" column.');
        setShowSendModal(true);
        e.target.value = '';
        return;
      }
      const emails: string[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        const val = row[emailIdx];
        if (val && val.includes('@')) emails.push(val.toLowerCase());
      }
      const deduped = [...new Set(emails)];
      setSelectedEmails(new Set(deduped));
      setSendError(null);
      setShowSendModal(true);
      usePendingTemplate();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadPendingCSV = async () => {
    let orders = pendingOrders;
    if (orders.length === 0) {
      try {
        setPendingLoading(true);
        const data = await fetchAllOrders();
        const all = Array.isArray(data) ? data : [];
        const completedEmails = new Set(
          all.filter((o: Order) => o.status === 'completed').map((o) => (o.customer_email || '').trim().toLowerCase()).filter(Boolean)
        );
        orders = all
          .filter((o: Order) => o.status === 'pending')
          .filter((o) => !completedEmails.has((o.customer_email || '').trim().toLowerCase()));
        setPendingOrders(orders);
      } catch {
        setSendError('Failed to load pending orders for CSV.');
        setShowSendModal(true);
        return;
      } finally {
        setPendingLoading(false);
      }
    }
    const headers = ['Order Reference', 'Name', 'Email', 'Product', 'Amount', 'Status', 'Created'];
    const rows = orders.map((o) => [
      o.order_reference || '',
      (o.customer_name || '').replace(/,/g, ';'),
      o.customer_email || '',
      o.product_type || 'ticket',
      o.amount_total ? String(o.amount_total / 100) : '',
      o.status || 'pending',
      o.created_at ? new Date(o.created_at).toISOString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendEmails = async () => {
    const emails = selectedEmails.size > 0 ? Array.from(selectedEmails) : leads.map((l) => l.email);
    if (emails.length === 0) {
      setSendError('No recipients selected.');
      return;
    }
    if (!sendSubject.trim()) {
      setSendError('Please enter a subject.');
      return;
    }
    setSendError(null);
    setSending(true);
    try {
      await sendLeadEmails(emails, sendSubject.trim(), sendBody.trim());
      setShowSendModal(false);
      setSelectedEmails(new Set());
      loadCampaigns();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));
  const paginatedLeads = leads.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, leads.length);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Sources', 'First Seen', 'Last Activity'];
    const rows = leads.map((l) => [
      l.name,
      l.email,
      (l.sources || []).join('; '),
      l.firstSeen ? new Date(l.firstSeen).toLocaleString() : '',
      l.lastActivity ? new Date(l.lastActivity).toLocaleString() : '',
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatSources = (sources: string[]) => {
    const items = (sources || []).map((s) =>
      s === 'order' ? { label: 'Order', icon: BookOpen, color: 'bg-blue-100 text-blue-700' } : { label: 'Unlock', icon: Lock, color: 'bg-amber-100 text-amber-700' }
    );
    return items.map(({ label, icon: Icon, color }) => (
      <span key={label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/dashboard">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Leads</h1>
                  <p className="text-xs text-slate-500">
                    {admin && typeof admin === 'object' && 'username' in admin
                      ? `Welcome, ${(admin as { username: string }).username}`
                      : 'Admin'}
                  </p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Recovery */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Recovery
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Re-engage users who started checkout but didn&apos;t complete. Download CSV, load from file, or send a reminder email.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={loadPendingOrders}
                disabled={pendingLoading}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${pendingLoading ? 'animate-spin' : ''}`} />
                Load Pending
              </button>
              <button
                onClick={downloadPendingCSV}
                disabled={pendingLoading}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download Pending CSV {pendingOrders.length > 0 && `(${pendingOrders.length})`}
              </button>
              <button
                onClick={loadAllPendingAndOpenModal}
                disabled={pendingLoading}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {pendingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Load All Pending & Send Reminder
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleLoadFromCSV}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Load from CSV
              </button>
            </div>
          </div>
          {pendingOrders.length > 0 && (
            <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-sm text-amber-800">
                <strong>{pendingEmailsDeduped.length}</strong> unique email(s) from <strong>{pendingOrders.length}</strong> pending order(s) loaded.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <p className="text-slate-600 text-sm">
              Leads from <strong>Reasons Unlock</strong> (homepage form) and <strong>Orders</strong> (ticket/book purchases). Deduped by email.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={loadLeads}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={leads.length === 0}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
              {leads.length > 0 && (
                <>
                  <button
                    onClick={selectAll}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                  >
                    Select all
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                  >
                    Deselect
                  </button>
                </>
              )}
              <button
                onClick={openSendModal}
                disabled={leads.length === 0}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send Email {selectedEmails.size > 0 ? `(${selectedEmails.size})` : '(All)'}
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No leads yet</p>
              <p className="text-slate-500 text-sm mt-1">Leads appear from Reasons Unlock and Orders.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedEmails.has(l.email))}
                            onChange={(e) => {
                              const next = new Set(selectedEmails);
                              if (e.target.checked) {
                                paginatedLeads.forEach((l) => next.add(l.email));
                              } else {
                                paginatedLeads.forEach((l) => next.delete(l.email));
                              }
                              setSelectedEmails(next);
                            }}
                            className="rounded border-slate-300"
                          />
                          <span className="text-xs text-slate-500">
                            {selectedEmails.size > 0 ? `${selectedEmails.size} selected` : 'Page'}
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sources</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">First Seen</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(lead.email)}
                            onChange={() => toggleLead(lead.email)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{lead.name}</td>
                        <td className="px-6 py-4 text-slate-600">{lead.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {formatSources(lead.sources || [])}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {lead.firstSeen ? new Date(lead.firstSeen).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {lead.lastActivity ? new Date(lead.lastActivity).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {leads.length > pageSize && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{leads.length}</span> leads
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <span className="flex items-center gap-1">
                      {(() => {
                        const pages: number[] = [];
                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          const start = Math.max(2, currentPage - 1);
                          const end = Math.min(totalPages - 1, currentPage + 1);
                          if (start > 2) pages.push(-1);
                          for (let i = start; i <= end; i++) {
                            if (!pages.includes(i)) pages.push(i);
                          }
                          if (end < totalPages - 1) pages.push(-2);
                          if (totalPages > 1) pages.push(totalPages);
                        }
                        return pages.map((p) =>
                          p < 0 ? (
                            <span key={p} className="px-2 text-slate-400">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`min-w-[2rem] px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === p ? 'bg-amber-500 text-white' : 'text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        );
                      })()}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Campaigns & Metrics */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-500" />
              Email Campaigns & Metrics
            </h2>
            <button
              onClick={loadCampaigns}
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${campaignsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {campaignsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No campaigns yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Opened</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Open Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Bounce</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate">{c.subject}</td>
                      <td className="px-6 py-4 text-slate-600">{c.sent_count}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <Eye className="w-4 h-4" />
                          {c.opened_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <TrendingUp className="w-3 h-3" />
                          {c.open_rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.bounced_count} ({c.bounce_rate}%)</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {c.sent_at ? new Date(c.sent_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Send Email Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Send Email to Leads</h2>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Sending to:{' '}
                <strong>
                  {selectedEmails.size > 0
                    ? `${selectedEmails.size} selected lead${selectedEmails.size !== 1 ? 's' : ''}`
                    : `All ${leads.length} leads`}
                </strong>
              </p>
              {sendError && (
                <p className="text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg">{sendError}</p>
              )}
              <button
                type="button"
                onClick={usePendingTemplate}
                className="w-full py-2 px-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-amber-200"
              >
                <Sparkles className="w-4 h-4" />
                Use Pending Reminder Template
              </button>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message (HTML supported)</label>
                <textarea
                  value={sendBody}
                  onChange={(e) => setSendBody(e.target.value)}
                  placeholder="Your message..."
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-y"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSendEmails}
                  disabled={sending}
                  className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
