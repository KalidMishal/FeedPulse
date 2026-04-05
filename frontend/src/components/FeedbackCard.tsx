import { Feedback } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { updateFeedbackStatus, triggerReanalyze } from '../lib/api';
import { useState } from 'react';

interface Props {
  feedback: Feedback;
  token: string;
  onUpdate: () => void;
}

export default function FeedbackCard({ feedback, token, onUpdate }: Props) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdating(true);
    try {
      await updateFeedbackStatus(token, feedback._id, e.target.value);
      onUpdate();
    } catch (err) {
      console.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReanalyze = async () => {
    setUpdating(true);
    try {
      await triggerReanalyze(token, feedback._id);
      onUpdate();
    } catch (err) {
      console.error('Failed to reanalyze');
    } finally {
      setUpdating(false);
    }
  };

  const getSentimentColor = (sentiment: string = 'Neutral') => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'Negative': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Bug': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Feature Request': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Improvement': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (score: number = 0) => {
    if (score >= 8) return 'text-red-600 bg-red-100';
    if (score >= 5) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow relative">
      {updating && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
        </div>
      )}

      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{feedback.title}</h3>
          <p className="text-slate-600 text-sm whitespace-pre-wrap">{feedback.description}</p>
        </div>
        
        <div className="flex flex-col items-end gap-2 shrink-0">
          <select 
            className="text-sm font-semibold p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer"
            value={feedback.status}
            onChange={handleStatusChange}
          >
            <option value="New">New</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReanalyze}
              title="Re-analyze with AI"
              className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
            >
              Analyze
            </button>
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getCategoryColor(feedback.category)}`}>
            {feedback.category}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getSentimentColor(feedback.ai_sentiment)}`}>
            Feeling: {feedback.ai_sentiment || 'Unknown'}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getPriorityColor(feedback.ai_priority)}`}>
            Priority Score: {feedback.ai_priority || 0}/10
          </span>
        </div>

        {feedback.ai_summary && (
          <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mb-4">
            <h4 className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI Summary
            </h4>
            <p className="text-sm text-indigo-800/80">{feedback.ai_summary}</p>
          </div>
        )}

        {feedback.ai_tags && feedback.ai_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {feedback.ai_tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {(feedback.submitterName || feedback.submitterEmail) && (
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
               {(feedback.submitterName?.[0] || feedback.submitterEmail?.[0] || 'A').toUpperCase()}
            </div>
            {feedback.submitterName} {feedback.submitterEmail && `(${feedback.submitterEmail})`}
          </div>
        )}
      </div>
    </div>
  );
}
