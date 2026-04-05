'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getFeedback, getSummary, getAISummary } from '@/lib/api';
import FeedbackCard from '@/components/FeedbackCard';
import StatCard from '@/components/StatCard';
import { Feedback } from '@/types';
import { MessageSquare, AlertCircle, BarChart3, Hash } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const filters: any = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (statusFilter) filters.status = statusFilter;
      if (sortBy) filters.sortBy = sortBy;
      if (search) filters.search = search;
      filters.page = page.toString();
      
      const [feedbackRes, summaryRes] = await Promise.all([
        getFeedback(token, filters),
        getSummary(token)
      ]);

      if (feedbackRes.success) {
        setFeedbacks(feedbackRes.data);
        if (feedbackRes.pagination) setPagination(feedbackRes.pagination);
      }
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      // Optional: Handle token expiration
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, sortBy, search, page, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadAiSummary = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setLoadingAi(true);
    try {
      const res = await getAISummary(token);
      if (res.success) setAiSummaryText(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
               F
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">FeedPulse Admin</span>
          </div>
          <button 
             onClick={handleLogout}
             className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <button 
            onClick={loadAiSummary}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
            disabled={loadingAi}
          >
            {loadingAi ? 'Generating...' : '✨ Generate AI Insights'}
          </button>
        </div>

        {aiSummaryText && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="text-xl">✨</span> AI Weekly Insights
            </h2>
            <p className="text-indigo-800/90 whitespace-pre-wrap text-sm leading-relaxed">
              {aiSummaryText}
            </p>
          </div>
        )}

        {/* Stats Section */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
               title="Total Feedback" 
               value={summary.total || 0} 
               icon={MessageSquare} 
               colorClass="bg-blue-100 text-blue-600" 
            />
            <StatCard 
               title="Open Items" 
               value={summary.openItems || 0} 
               icon={AlertCircle} 
               colorClass="bg-amber-100 text-amber-600" 
            />
            <StatCard 
               title="Average Priority" 
               value={summary.avgPriority || 0} 
               icon={BarChart3} 
               colorClass="bg-red-100 text-red-600" 
            />
            <StatCard 
               title="Top Topic" 
               value={`#${summary.mostCommonTag}` || 'None'} 
               icon={Hash} 
               colorClass="bg-emerald-100 text-emerald-600" 
            />
          </div>
        )}

        {/* Filters and List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-slate-100">
            <input 
              type="text"
              placeholder="Search feedback..."
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 max-w-xs w-full"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            
            <select 
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 max-w-xs"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="Bug">Bugs</option>
              <option value="Feature Request">Requests</option>
              <option value="Improvement">Improvements</option>
              <option value="Other">Other</option>
            </select>

            <select 
               className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 max-w-xs"
               value={statusFilter}
               onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select 
               className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 max-w-xs ml-auto"
               value={sortBy}
               onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="">Sort: Newest</option>
              <option value="date_asc">Sort: Oldest</option>
              <option value="priority">Sort: Priority</option>
              <option value="sentiment">Sort: Sentiment</option>
            </select>
          </div>

          <div className="flex flex-col gap-5">
            {feedbacks.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No feedback found matching your criteria.</p>
              </div>
            ) : (
              feedbacks.map((f) => (
                <FeedbackCard 
                  key={f._id} 
                  feedback={f} 
                  token={localStorage.getItem('adminToken') || ''} 
                  onUpdate={loadData} 
                />
              ))
            )}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6 py-4 border-t border-slate-100">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500 font-medium">Page {page} of {pagination.pages}</span>
              <button 
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
