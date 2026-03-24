import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RoomBuilder = () => {
  const [selectedScene, setSelectedScene] = useState('office');
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);
  const containerRef = useRef(null);

  // Fetch products from the backend
  useEffect(() => {
    setLoadingProducts(true);
    axios.get(`${API_URL}/products`)
      .then(res => {
        setProducts(res.data);
        setProductError(null);
      })
      .catch(() => {
        setProductError('Could not load products. Is the server running?');
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const scenes = {
    office: {
      name: 'Modern Office',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
      type: 'floor'
    },
    living: {
      name: 'Minimalist Living Room',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
      type: 'floor'
    },
    desk: {
      name: 'Wooden Desk',
      url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1200',
      type: 'table'
    },
    wall: {
      name: 'Gallery Wall',
      url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1200',
      type: 'frame'
    }
  };

  const addItem = (product) => {
    const newItem = {
      id: product._id,
      name: product.name,
      url: product.imageUrl,
      modelUrl: product.modelUrl,
      uniqueId: Date.now(),
      x: 100,
      y: 100,
      scale: 1,
      rotation: 0
    };

    setPlacedItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.uniqueId);
    toast.success(`${product.name} added to scene!`);
  };

  const updateItem = (uniqueId, updates) => {
    setPlacedItems(prev => prev.map(item => 
      item.uniqueId === uniqueId ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (uniqueId) => {
    setPlacedItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    if (selectedItemId === uniqueId) setSelectedItemId(null);
    toast.error('Item removed');
  };

  const selectedItem = placedItems.find(i => i.uniqueId === selectedItemId);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 bg-white shadow-xl z-20 flex flex-col p-6 space-y-8 overflow-y-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Room Builder</h2>
          <p className="text-sm text-gray-500">Simulate product placement in your space.</p>
        </div>

        {/* Scene Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">Select Scene</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(scenes).map(key => (
              <button
                key={key}
                onClick={() => setSelectedScene(key)}
                className={`p-2 text-xs rounded-xl border-2 transition-all ${
                  selectedScene === key 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                  : 'border-gray-100 hover:border-gray-200 text-gray-600'
                }`}
              >
                {scenes[key].name}
              </button>
            ))}
          </div>
        </div>

        {/* Add Items — from Products DB */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">Add Products</label>

          {loadingProducts && (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {productError && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">
              {productError}
            </div>
          )}

          {!loadingProducts && !productError && products.filter(p => p.modelUrl).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No products with 3D models found.</p>
          )}

          {!loadingProducts && !productError && products.filter(p => p.modelUrl).length > 0 && (
            <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
              {products.filter(p => p.modelUrl).map(product => (
                <button
                  key={product._id}
                  onClick={() => addItem(product)}
                  title={product.name}
                  className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 object-contain group-hover:scale-110 transition-transform rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                  )}
                  <span className="text-[10px] mt-1 text-gray-500 truncate w-full text-center">{product.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Item Controls */}
        {selectedItem && (
          <div className="space-y-6 pt-6 border-t border-gray-100 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Edit {selectedItem.name}</h3>
              <button 
                onClick={() => removeItem(selectedItem.uniqueId)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600 uppercase">Scale</label>
                  <span className="text-xs font-bold text-blue-600">{(selectedItem.scale * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0.2" max="2" step="0.1"
                  value={selectedItem.scale}
                  onChange={(e) => updateItem(selectedItem.uniqueId, { scale: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600 uppercase">Rotation</label>
                  <span className="text-xs font-bold text-blue-600">{selectedItem.rotation}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" step="1"
                  value={selectedItem.rotation}
                  onChange={(e) => updateItem(selectedItem.uniqueId, { rotation: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 text-[10px] text-gray-400 text-center">
          Drag items to move • Select to resize/rotate
        </div>
      </div>

      {/* Placement Area */}
      <div className="flex-grow relative bg-gray-200 overflow-hidden" ref={containerRef}>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url(${scenes[selectedScene].url})` }}
        >
          {/* Overlay to dim background slightly when editing */}
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />

          {placedItems.map(item => {
            const nodeRef = React.createRef();
            return (
              <Draggable
                key={item.uniqueId}
                nodeRef={nodeRef}
                bounds="parent"
                position={null}
                defaultPosition={{ x: item.x, y: item.y }}
                onStart={() => setSelectedItemId(item.uniqueId)}
              >
                <div 
                  ref={nodeRef}
                  className={`absolute cursor-move overflow-visible ${
                    selectedItemId === item.uniqueId ? 'z-50' : 'z-10'
                  }`}
                  style={{ 
                    transition: 'none'
                  }}
                >
                  <div
                    className={`transition-all duration-200 ${
                      selectedItemId === item.uniqueId ? 'ring-2 ring-blue-500 rounded-lg shadow-2xl' : 'hover:ring-1 hover:ring-white/50'
                    }`}
                    style={{ 
                      transform: `scale(${item.scale}) rotate(${item.rotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {/* 3D Model Viewer */}
                    <model-viewer
                      src={item.modelUrl}
                      alt={item.name}
                      camera-controls
                      auto-rotate
                      auto-rotate-delay="500"
                      shadow-intensity="1"
                      style={{
                        width: '200px',
                        height: '200px',
                        background: 'transparent',
                        pointerEvents: selectedItemId === item.uniqueId ? 'auto' : 'none'
                      }}
                    />
                    
                    {/* Individual Item Controls Overlay (Hidden unless selected) */}
                    {selectedItemId === item.uniqueId && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center space-x-2 animate-in fade-in zoom-in duration-200 pointer-events-auto">
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeItem(item.uniqueId); }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="text-xs font-bold text-gray-700 uppercase whitespace-nowrap">{item.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Draggable>
            );
          })}
        </div>

        {/* Scene Info Badge */}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-gray-800">{scenes[selectedScene].name}</span>
        </div>
      </div>
    </div>
  );
};

export default RoomBuilder;
