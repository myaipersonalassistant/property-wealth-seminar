import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Clock,
  Eye,
  Globe,
  Home,
  LogOut,
  MapPin,
  PieChart as PieChartIcon,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getCurrentAdmin, logoutAdmin } from '@/lib/admin-auth';
import {
  EventData,
  PageViewData,
  VisitorData,
  getAllVisitors,
  getEvents,
  getPageViews,
} from '@/lib/analytics';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TimeRange = '7d' | '30d' | 'all';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#f97316'];

const AdminMetrics: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdmin(currentAdmin);
    loadAnalytics(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const loadAnalytics = async (range: TimeRange) => {
    try {
      setIsLoading(true);

      let startDate: Date | undefined;
      const endDate = new Date();

      if (range === '7d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (range === '30d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }

      const [viewsData, visitorsData, eventsData] = await Promise.all([
        getPageViews(startDate, endDate),
        getAllVisitors(),
        getEvents(startDate, endDate),
      ]);

      setPageViews(viewsData);
      setVisitors(visitorsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    loadAnalytics(range);
  };

  // Derived metrics
  const metrics = useMemo(() => {
    if (!pageViews.length && !visitors.length && !events.length) {
      return {
        totalPageViews: 0,
        totalVisitors: 0,
        returningVisitors: 0,
        avgPagesPerVisitor: 0,
        topPage: null as string | null,
        busiestHour: null as number | null,
        totalCtaClicks: 0,
      };
    }

    const uniqueVisitorIds = new Set(pageViews.map((v) => v.visitor_id));
    const totalVisitors = uniqueVisitorIds.size || visitors.length;

    const returningVisitors =
      visitors.filter((v) => (v.visit_count || 0) > 1).length ||
      Array.from(uniqueVisitorIds).filter((id) => {
        const visitor = visitors.find((v) => v.visitor_id === id);
        return (visitor?.visit_count || 0) > 1;
      }).length;

    const totalPageViews = pageViews.length;
    const avgPagesPerVisitor =
      totalVisitors > 0 ? +(totalPageViews / totalVisitors).toFixed(1) : 0;

    // Top page by views
    const viewsByPath: Record<string, number> = {};
    pageViews.forEach((v) => {
      viewsByPath[v.page_path] = (viewsByPath[v.page_path] || 0) + 1;
    });
    const topPageEntry = Object.entries(viewsByPath).sort((a, b) => b[1] - a[1])[0];
    const topPage = topPageEntry ? `${topPageEntry[0]} (${topPageEntry[1]} views)` : null;

    // Busiest hour
    const viewsByHour: Record<number, number> = {};
    pageViews.forEach((v) => {
      const hour = v.hour ?? new Date(v.timestamp?.toDate?.() ?? v.timestamp).getHours();
      viewsByHour[hour] = (viewsByHour[hour] || 0) + 1;
    });
    const busiestHourEntry = Object.entries(viewsByHour).sort(
      (a, b) => (b[1] as number) - (a[1] as number),
    )[0];
    const busiestHour = busiestHourEntry ? Number(busiestHourEntry[0]) : null;

    // CTA click events (based on naming convention)
    const totalCtaClicks = events.filter((e) =>
      ['book_cta_click', 'book_page_cta_click', 'home_book_cta_click'].includes(e.event_name),
    ).length;

    // Location metrics
    const viewsByCountry: Record<string, number> = {};
    const viewsByCity: Record<string, number> = {};
    pageViews.forEach((v) => {
      if (v.country) {
        viewsByCountry[v.country] = (viewsByCountry[v.country] || 0) + 1;
      }
      if (v.city) {
        const cityKey = v.country ? `${v.city}, ${v.country}` : v.city;
        viewsByCity[cityKey] = (viewsByCity[cityKey] || 0) + 1;
      }
    });
    
    const topCountryEntry = Object.entries(viewsByCountry).sort((a, b) => b[1] - a[1])[0];
    const topCountry = topCountryEntry ? `${topCountryEntry[0]} (${topCountryEntry[1]} views)` : null;
    
    const topCityEntry = Object.entries(viewsByCity).sort((a, b) => b[1] - a[1])[0];
    const topCity = topCityEntry ? topCityEntry[0] : null;

    return {
      totalPageViews,
      totalVisitors,
      returningVisitors,
      avgPagesPerVisitor,
      topPage,
      busiestHour,
      totalCtaClicks,
      topCountry,
      topCity,
      viewsByCountry,
      viewsByCity,
    };
  }, [events, pageViews, visitors]);

  // Daily views for chart
  const dailyViewsData = useMemo(() => {
    if (!pageViews.length) return [];

    const counts: Record<string, number> = {};
    pageViews.forEach((v) => {
      const d = v.timestamp?.toDate ? v.timestamp.toDate() : new Date(v.timestamp);
      const key = d.toISOString().split('T')[0];
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, count]) => ({
        date,
        views: count,
      }));

    return sorted;
  }, [pageViews]);

  // Page distribution for pie chart
  const pageDistributionData = useMemo(() => {
    if (!pageViews.length) return [];
    const counts: Record<string, number> = {};
    pageViews.forEach((v) => {
      const label = v.page_name || v.page_path || 'Unknown';
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [pageViews]);

  // Event counts
  const eventCountsData = useMemo(() => {
    if (!events.length) return [];
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.event_name] = (counts[e.event_name] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [events]);

  // Location distribution data
  const locationData = useMemo(() => {
    if (!pageViews.length) return [];
    const countryCounts: Record<string, number> = {};
    pageViews.forEach((v) => {
      const country = v.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    return Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
  }, [pageViews]);

  const formatHour = (h: number | null) => {
    if (h === null) return '-';
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${suffix}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/dashboard">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Visitor Analytics</h1>
                  <p className="text-xs text-slate-500">
                    Insights for {admin?.username || 'admin'}
                  </p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Dashboard
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Time Range & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Time range</p>
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              {[
                { label: 'Last 7 days', value: '7d' as TimeRange },
                { label: 'Last 30 days', value: '30d' as TimeRange },
                { label: 'All time', value: 'all' as TimeRange },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onTimeRangeChange(option.value)}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    timeRange === option.value
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => loadAnalytics(timeRange)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-7 h-7 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-slate-300 text-sm mb-1">Total Page Views</p>
            <p className="text-3xl font-bold">{metrics.totalPageViews}</p>
            <p className="text-slate-400 text-xs mt-2">
              Across all tracked pages in the selected period
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-7 h-7 opacity-80" />
            </div>
            <p className="text-amber-100 text-sm mb-1">Unique Visitors</p>
            <p className="text-3xl font-bold">{metrics.totalVisitors}</p>
            <p className="text-amber-100 text-xs mt-2">
              {metrics.returningVisitors} returning visitors
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <BarChart2 className="w-7 h-7 opacity-80" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Pages per Visitor</p>
            <p className="text-3xl font-bold">{metrics.avgPagesPerVisitor}</p>
            <p className="text-blue-100 text-xs mt-2">
              Average depth of engagement per visitor
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-7 h-7 opacity-80" />
            </div>
            <p className="text-emerald-100 text-sm mb-1">Busiest Hour</p>
            <p className="text-2xl font-bold">{formatHour(metrics.busiestHour)}</p>
            <p className="text-emerald-100 text-xs mt-2">
              When visitors are most active on the site
            </p>
          </div>
        </div>

        {/* Location Metrics */}
        {(metrics.topCountry || metrics.topCity) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.topCountry && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Top Country</h3>
                    <p className="text-xs text-slate-500">Most visitors from</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-800">{metrics.topCountry}</p>
              </div>
            )}
            {metrics.topCity && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Top City</h3>
                    <p className="text-xs text-slate-500">Most visitors from</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-800">{metrics.topCity}</p>
              </div>
            )}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Daily Page Views
                </h2>
                <p className="text-xs text-slate-500">
                  Traffic trend over the selected time window
                </p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-56">
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : dailyViewsData.length === 0 ? (
              <div className="flex items-center justify-center h-56">
                <p className="text-slate-500 text-sm">No page views recorded yet.</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyViewsData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickMargin={8}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Top Pages by Views
                </h2>
                <p className="text-xs text-slate-500">
                  Where visitors spend most of their time
                </p>
              </div>
              <PieChartIcon className="w-5 h-5 text-amber-500" />
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-56">
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : pageDistributionData.length === 0 ? (
              <div className="flex items-center justify-center h-56">
                <p className="text-slate-500 text-sm">No page data yet.</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pageDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name }) => name.split(' ').slice(0, 2).join(' ')}
                    >
                      {pageDistributionData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Events / Behaviour */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Key Events & Engagement
                </h2>
                <p className="text-xs text-slate-500">
                  Button clicks and other tracked actions
                </p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-56">
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : eventCountsData.length === 0 ? (
              <div className="flex items-center justify-center h-56">
                <p className="text-slate-500 text-sm">No events recorded yet.</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventCountsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Location Distribution */}
        {locationData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Visitor Locations
                </h2>
                <p className="text-xs text-slate-500">
                  Geographic distribution of your visitors
                </p>
              </div>
              <Globe className="w-5 h-5 text-amber-500" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="country"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {locationData.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg p-2 text-center"
                >
                  <p className="text-xs font-semibold text-slate-800">{item.country}</p>
                  <p className="text-xs text-slate-500">{item.count} views</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-2">
              Highlight Insights
            </h2>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  • <span className="font-semibold">Top page:</span>{' '}
                  {metrics.topPage || 'No data yet'}
                </li>
                <li>
                  • <span className="font-semibold">CTA clicks tracked:</span>{' '}
                  {metrics.totalCtaClicks}
                </li>
                <li>
                  • <span className="font-semibold">Returning visitors:</span>{' '}
                  {metrics.returningVisitors}
                </li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">
                How this data is collected
              </p>
              <p>
                Firebase Analytics + Firestore store anonymous visitor IDs, page
                views, and key events like booking button clicks. Use this to
                understand which pages bring people closest to booking a seat
                or purchasing the book.
              </p>
            </div>
          </div>
      </main>
    </div>
  );
};

export default AdminMetrics;


