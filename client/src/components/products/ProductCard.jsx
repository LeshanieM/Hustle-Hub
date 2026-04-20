import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductCard = ({ product, isOwner = false, onDelete }) => {
  const { user, updateUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (user && user.savedItems) {
      setIsFavorite(user.savedItems.includes(product._id));
    }
  }, [user, product._id]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to save items');
      return;
    }

    try {
      setIsToggling(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const res = await axios.post(`${API_URL}/user/favorite/${product._id}`, {}, config);
      setIsFavorite(res.data.isFavorite);
      
      // Update AuthContext user object to keep it in sync across components
      if (res.data.isFavorite) {
        updateUser({ savedItems: [...(user.savedItems || []), product._id] });
      } else {
        updateUser({ savedItems: (user.savedItems || []).filter(id => id !== product._id) });
      }

      toast.success(res.data.message);
    } catch (error) {
      console.error('Toggle Favorite Error:', error);
      toast.error('Failed to update favorite');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full group">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <>
            <img src={resolveImageUrl(product.imageUrl)} alt={product.name} className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ${product.stock === 0 ? 'opacity-80 grayscale' : ''}`} />
            {product.modelUrl && (
              <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded shadow-sm text-xs font-semibold flex items-center z-10">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                3D Available
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
             <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        
        {/* Favorite Button */}
        {!isOwner && user && (
          <button
            onClick={handleToggleFavorite}
            disabled={isToggling}
            className={`absolute top-2 right-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md z-20 border-none cursor-pointer active:scale-90 ${
              isFavorite 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'fill-1' : ''}`}>
              favorite
            </span>
          </button>
        )}

        {product.stock === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-rose-600/95 text-white rounded-lg text-xs font-black shadow-lg uppercase tracking-wider z-20 flex items-center gap-1.5 backdrop-blur-sm border border-rose-400">
            <span className="material-symbols-outlined text-[14px]">error</span>
            Out of Stock
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 items-start z-10">
          <div className="bg-[#051094]/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
            {product.type || 'Standard'}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#051094] transition-colors">{product.name}</h3>
          <span className="text-lg font-black text-slate-900 ml-2">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">{product.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-50">
          {isOwner ? (
            <div className="flex items-center space-x-2">
              <Link 
                to={`/customer/products/${product._id}`}
                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="View Product"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>
              <Link 
                to={`/owner/products/edit/${product._id}`}
                className="flex-1 text-center bg-[#051094]/10 text-[#051094] hover:bg-[#051094]/20 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Edit
              </Link>
              <button 
                onClick={() => onDelete(product._id)}
                className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          ) : (
            <Link 
              to={`/customer/products/${product._id}`}
              className="block w-full text-center bg-[#051094] hover:bg-[#0d0db0] text-white py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#051094]/10 active:scale-[0.98]"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;