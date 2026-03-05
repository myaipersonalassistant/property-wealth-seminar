import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { getCurrentAdmin, logoutAdmin } from '@/lib/admin-auth';
import { fetchLeads, sendLeadEmails, fetchLeadCampaigns } from '@/lib/api';

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

const AdminLeads: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<unknown>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendSubject, setSendSubject] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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
