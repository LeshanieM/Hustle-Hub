import React, { useState } from 'react';
import api from '../../api/axios';

const AISummaryCard = ({ productId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/reviews/summary/${productId}`);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-8">
      {!summary && !loading && !error && (
        <button
          onClick={fetchSummary}
          className="flex items-center gap-2 px-6 py-3 bg-[#051094] hover:bg-blue-800 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ✨ Summarize All Reviews
        </button>
      )}

      {loading && (
        <div className="flex items-center text-gray-500 gap-3 py-4">
          <svg className="animate-spin h-5 w-5 text-[#051094]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Analyzing reviews with AI...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 mb-4 inline-block">
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="relative p-6 bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#051094]"></div>
          <div className="flex items-start gap-3">
             <div className="p-2 bg-blue-100 rounded-full shrink-0">
               <svg className="w-6 h-6 text-[#051094]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             </div>
             <div>
               <h4 className="text-lg font-bold text-gray-900 mb-2">AI Review Summary</h4>
               <p className="text-gray-700 leading-relaxed italic md:pr-4">{summary}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISummaryCard;
