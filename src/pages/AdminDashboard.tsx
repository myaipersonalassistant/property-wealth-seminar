import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Ticket,
  BookOpen,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Package,
  LogOut,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Mail,
  Phone,
  Eye,
  X,
  Home,
  BarChart2
} from 'lucide-react';
import { getAllTicketPurchases, TicketPurchase, updateTicketPurchase } from '@/lib/firestore';
import { getCurrentAdmin, logoutAdmin } from '@/lib/admin-auth';
import { formatCurrency } from '@/lib/stripe';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [orders, setOrders] = useState<TicketPurchase[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<TicketPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'tickets' | 'books'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<TicketPurchase | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdmin(currentAdmin);
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTicketPurchases();
      // Sort by created_at descending (newest first)
      const sorted = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sorted);
      setFilteredOrders(sorted);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...orders];

    // Filter by type
    if (activeTab === 'tickets') {
      filtered = filtered.filter(o => o.product_type !== 'book');
    } else if (activeTab === 'books') {
      filtered = filtered.filter(o => o.product_type === 'book');
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_reference.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_email.toLowerCase().includes(query) ||
        (o.customer_phone && o.customer_phone.includes(query))
      );
    }

    setFilteredOrders(filtered);
  }, [orders, activeTab, statusFilter, searchQuery]);

  const handleStatusUpdate = async (orderRef: string, newStatus: 'pending' | 'completed' | 'failed') => {
    try {
      setIsUpdating(true);
      await updateTicketPurchase(orderRef, { status: newStatus });
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Calculate statistics
  const stats = {
    totalRevenue: orders.reduce((sum, o) => sum + (o.amount_total || 0), 0),
    totalTickets: orders.filter(o => o.product_type !== 'book').reduce((sum, o) => sum + o.quantity, 0),
    totalBooks: orders.filter(o => o.product_type === 'book').reduce((sum, o) => sum + o.quantity, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    ticketOrders: orders.filter(o => o.product_type !== 'book').length,
    bookOrders: orders.filter(o => o.product_type === 'book').length,
  };

  const exportToCSV = () => {
    const headers = ['Order Reference', 'Type', 'Customer Name', 'Email', 'Phone', 'Quantity', 'Amount', 'Status', 'Date'];
    const rows = filteredOrders.map(o => [
      o.order_reference,
      o.product_type === 'book' ? 'Book' : 'Ticket',
      o.customer_name,
      o.customer_email,
      o.customer_phone || '',
      o.quantity.toString(),
      `£${(o.amount_total / 100).toFixed(2)}`,
      o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
                  <p className="text-xs text-slate-500">Welcome back, {admin?.username}</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Site
              </Link>
              <Link
                to="/admin/metrics"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                Metrics
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue / 100, 'GBP')}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Ticket className="w-8 h-8 opacity-80" />
              <Users className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-green-100 text-sm mb-1">Tickets Sold</p>
            <p className="text-3xl font-bold">{stats.totalTickets}</p>
            <p className="text-green-100 text-xs mt-1">{stats.ticketOrders} orders</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 opacity-80" />
              <Package className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-purple-100 text-sm mb-1">Books Sold</p>
            <p className="text-3xl font-bold">{stats.totalBooks}</p>
            <p className="text-purple-100 text-xs mt-1">{stats.bookOrders} orders</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 opacity-80" />
              <Clock className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-amber-100 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <p className="text-amber-100 text-xs mt-1">
              {stats.completedOrders} completed, {stats.pendingOrders} pending
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tickets
              </button>
              <button
                onClick={() => setActiveTab('books')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'books'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Books
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-1 gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_reference} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-semibold text-slate-800">{order.order_reference}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">{order.customer_name}</div>
                        <div className="text-xs text-slate-500">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.product_type === 'book'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.product_type === 'book' ? (
                            <>
                              <BookOpen className="w-3 h-3" />
                              Book
                            </>
                          ) : (
                            <>
                              <Ticket className="w-3 h-3" />
                              Ticket
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                        {formatCurrency(order.amount_total / 100, 'GBP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'pending' && <Clock className="w-3 h-3" />}
                          {order.status === 'failed' && <XCircle className="w-3 h-3" />}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Reference */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border-2 border-amber-200">
                <p className="text-sm text-amber-700 font-semibold mb-1">Order Reference</p>
                <p className="font-mono text-xl font-bold text-amber-900">{selectedOrder.order_reference}</p>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-medium">Name:</span>
                      <span>{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Info (for books) */}
                {selectedOrder.product_type === 'book' && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-amber-600" />
                      Shipping Address
                    </h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      {selectedOrder.shipping_address && <p>{selectedOrder.shipping_address}</p>}
                      {selectedOrder.shipping_city && <p>{selectedOrder.shipping_city}</p>}
                      {selectedOrder.shipping_postcode && <p>{selectedOrder.shipping_postcode}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Order Details</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">
                      {selectedOrder.product_type === 'book' ? 'Book' : 'Ticket'} Quantity
                    </span>
                    <span className="font-semibold text-slate-800">{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Amount</span>
                    <span className="font-bold text-lg text-amber-600">
                      {formatCurrency(selectedOrder.amount_total / 100, 'GBP')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : selectedOrder.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Order Date</span>
                    <span className="text-slate-800">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Update Status</h3>
                <div className="flex gap-2">
                  {['pending', 'completed', 'failed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedOrder.order_reference, status as any)}
                      disabled={isUpdating || selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedOrder.status === status
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

