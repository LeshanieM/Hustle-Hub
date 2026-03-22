import React, { useEffect, useRef } from 'react';

const ModelViewer = ({ src, alt = "A 3D model", autoRotate = true, className = "" }) => {
  const modelRef = useRef(null);

  useEffect(() => {

  }, [src]);

  if (!src) return null;

  return (
    <div className={`relative w-full h-full min-h-[400px] bg-gradient-to-b from-gray-50 to-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-inner group ${className}`}>
      <model-viewer
        ref={modelRef}
        src={src}
        alt={alt}
        shadow-intensity="1"
        camera-controls
        auto-rotate={autoRotate ? "true" : undefined}
        auto-rotate-delay="1000"
        rotation-per-second="30deg"
        interaction-prompt="auto"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center text-gray-500 animate-pulse">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Loading 3D Model...</span>
          </div>
        </div>
      </model-viewer>
      
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-semibold text-gray-700 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 mr-1.5 text-[#051094]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        Interactive 3D
      </div>
    </div>
  );
};

export default ModelViewer;