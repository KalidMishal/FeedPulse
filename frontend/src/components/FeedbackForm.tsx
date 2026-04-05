'use client';

import { useState } from 'react';
import { submitFeedback } from '../lib/api';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Feature Request',
    submitterName: '',
    submitterEmail: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      setErrorMessage('Description must be at least 20 characters long.');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await submitFeedback(formData);
      if (result.success) {
        setStatus('success');
        setFormData({
          title: '',
          description: '',
          category: 'Feature Request',
          submitterName: '',
          submitterEmail: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to submit feedback.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Have an idea or spotted a bug?</h2>
      
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-700 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Thank you! Your feedback has been submitted successfully and will be reviewed by our AI.
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
            placeholder="E.g., Dark mode is hard to read"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
          >
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Improvement">Improvement</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
           <div className="flex justify-between items-end mb-1">
             <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
             <span className={`text-xs ${formData.description.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
               {formData.description.length} / 20 min chars
             </span>
           </div>
          <textarea
            name="description"
            required
            minLength={20}
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 resize-none"
            placeholder="Please describe the issue or your idea in detail..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
            <input
              type="text"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-colors bg-white/80"
              placeholder="Alice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
            <input
              type="email"
              name="submitterEmail"
              value={formData.submitterEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-colors bg-white/80"
              placeholder="alice@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || formData.description.length < 20}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:active:scale-100 flex justify-center items-center"
        >
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
             'Submit Feedback'
          )}
        </button>
      </form>
    </div>
  );
}
