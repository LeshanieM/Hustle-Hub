import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AIPlatformInsight = () => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews/platform-summary');
      setInsight(res.data.summary);
    } catch (err) {
      setInsight("Unable to load platform insights at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div className="bg-white border text-left border-gray-100 shadow-sm rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-[#051094] flex items-center gap-2">
          AI Review Insights
        </h3>
      </div>
      
      <div className="flex-1 bg-[#051094]/5 border-l-4 border-l-[#051094] p-5">
        {loading ? (
          <div className="flex items-center gap-3 text-sm text-[#051094] font-medium h-full">
             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             Analyzing 30-day feedback...
          </div>
        ) : (
          <p className="italic text-gray-700 text-sm leading-relaxed text-left">"{insight}"</p>
        )}
      </div>

      <button 
        onClick={fetchInsight} 
        disabled={loading}
        className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-bold text-[#051094] hover:text-blue-900 border border-[#051094]/20 hover:bg-[#051094]/10 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
      >
        ✦ Regenerate platform summary
      </button>
    </div>
  );
};

export default AIPlatformInsight;
