import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductForm = ({ initialData, onSubmit, isLoading, isEdit = false }) => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Initialize state directly with props
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || '',
    description: initialData?.description || '',
    type: initialData?.type || 'General',
    imageUrl: initialData?.imageUrl || '',
    modelUrl: initialData?.modelUrl || '',
    stock: initialData?.stock || 0,
    trackStock: initialData?.trackStock || false,
    alertThreshold: initialData?.alertThreshold || 5,
  });

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Product name must be less than 100 characters';
    }

    // Price validation
    if (!formData.price && formData.price !== 0) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || formData.price < 0) {
      newErrors.price = 'Price must be a positive number';
    } else if (formData.price > 10000) {
      newErrors.price = 'Price must be less than $10,000';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Product type is required';
    }

    // Image URL validation (if provided)
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl =
        'Please enter a valid URL (e.g., https://example.com/image.jpg)';
    }

    // Model URL validation (if provided)
    if (formData.modelUrl && !isValidUrl(formData.modelUrl)) {
      newErrors.modelUrl =
        'Please enter a valid URL (e.g., https://example.com/model.glb)';
    }

    // File validation
    if (imageFile && !imageFile.type.startsWith('image/')) {
      newErrors.imageFile =
        'Please upload a valid image file (JPEG, PNG, etc.)';
    }

    if (modelFile && !modelFile.name.match(/\.(glb|gltf)$/i)) {
      newErrors.modelFile =
        'Please upload a valid 3D model file (.glb or .gltf)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => {
      let newValue = value;
      if (type === 'checkbox') newValue = checked;
      else if (type === 'number' && name !== 'price') newValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
      else if (name === 'price') newValue = value ? Number(value) : '';

      return { ...prev, [name]: newValue };
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'image') {
      setImageFile(files[0]);
      if (errors.imageFile) {
        setErrors((prev) => ({ ...prev, imageFile: '' }));
      }
    }
    if (name === 'model') {
      setModelFile(files[0]);
      if (errors.modelFile) {
        setErrors((prev) => ({ ...prev, modelFile: '' }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name.trim());
    submitData.append('price', formData.price);
    submitData.append('description', formData.description.trim());
    submitData.append('type', formData.type);
    submitData.append('stock', formData.stock);
    submitData.append('trackStock', formData.trackStock);
    submitData.append('alertThreshold', formData.alertThreshold);


    if (imageFile) {
      submitData.append('image', imageFile);
    } else if (formData.imageUrl) {
      submitData.append('imageUrl', formData.imageUrl);
    }

    if (modelFile) {
      submitData.append('model', modelFile);
    } else if (formData.modelUrl) {
      submitData.append('modelUrl', formData.modelUrl);
    }

    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h2>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094] transition-colors bg-white text-gray-900 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. University Hoodie"
            />
            {errors.name && (
              <p className="error-message text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094] transition-colors bg-white text-gray-900 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="error-message text-red-500 text-xs mt-1">
                {errors.price}
              </p>
            )}
          </div>
        </div>

        {/* Type Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Product Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094] transition-colors bg-white text-gray-900 ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="General">General</option>
            <option value="Apparel">Apparel</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Ticket">Ticket / Event</option>
          </select>
          {errors.type && (
            <p className="error-message text-red-500 text-xs mt-1">
              {errors.type}
            </p>
          )}
        </div>

                {/* Inventory Tracking Setup */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Inventory Tracking</h3>
              <p className="text-xs text-gray-500">Monitor stock levels and receive low-stock alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="trackStock" 
                checked={formData.trackStock} 
                onChange={handleChange} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#051094]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#051094]"></div>
            </label>
          </div>

          {formData.trackStock && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 animate-fade-in-up">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Current Stock Level
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">inventory_2</span>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Low Stock Alert Threshold
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">warning</span>
                  <input
                    type="number"
                    name="alertThreshold"
                    min="0"
                    value={formData.alertThreshold}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094] transition-colors resize-none bg-white text-gray-900 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the product..."
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="error-message text-red-500 text-xs">
                {errors.description}
              </p>
            )}
            <p
              className={`text-xs ${formData.description.length > 2000 ? 'text-red-500' : 'text-gray-400'} ml-auto`}
            >
              {formData.description.length}/2000
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Upload Field */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              Product Image (Optional)
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Paste a Web Link
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094] transition-colors bg-white text-gray-900 ${
                    errors.imageUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-gray-400 font-medium">
                <span className="flex-1 border-t border-gray-300"></span>
                <span>OR UPLOAD A FILE</span>
                <span className="flex-1 border-t border-gray-300"></span>
              </div>

              <div>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#051094] file:text-white hover:file:bg-[#051094]/90 transition-colors cursor-pointer"
                />
                {errors.imageFile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.imageFile}
                  </p>
                )}
              </div>
              {isEdit && formData.imageUrl && !imageFile && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Current image is active.
                </p>
              )}
            </div>
          </div>

          {/* 3D Model Upload Field */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              3D Model File (.glb) (Optional)
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Paste a Web Link
                </label>
                <input
                  type="url"
                  name="modelUrl"
                  value={formData.modelUrl}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094] transition-colors bg-white text-gray-900 ${
                    errors.modelUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/model.glb"
                />
                {errors.modelUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.modelUrl}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-gray-400 font-medium">
                <span className="flex-1 border-t border-gray-300"></span>
                <span>OR UPLOAD A FILE</span>
                <span className="flex-1 border-t border-gray-300"></span>
              </div>

              <div>
                <input
                  type="file"
                  name="model"
                  accept=".glb,.gltf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#051094] file:text-white hover:file:bg-[#051094]/90 transition-colors cursor-pointer"
                />
                {errors.modelFile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.modelFile}
                  </p>
                )}
              </div>
              {isEdit && formData.modelUrl && !modelFile && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Current 3D model is active.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[#051094] text-white font-medium rounded-lg hover:bg-[#051094]/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
