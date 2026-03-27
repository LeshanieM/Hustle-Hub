import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import OwnerHeader from '../../components/OwnerHeader';

const StoreEditor = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
    const [activeTab, setActiveTab] = useState('design'); // 'design', 'content', 'settings'

    const mockProducts = [];

    // Mock store state for editor
    const [storeData, setStoreData] = useState({
        name: "My Store",
        location: "",
        rating: 0,
        reviews: "0",
        banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200",
        logo: "https://api.dicebear.com/7.x/identicon/svg?seed=store",
        headline: "Welcome to my store",
        subheadline: "Your one-stop shop for everything premium.",
        ctaText: "Shop Now",
        primaryColor: "#1111d4",
        contactInfo: ""
    });

    const [bannerFile, setBannerFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const validateField = (field, value) => {
        let err = null;
        if (field === 'name') {
            if (!value?.trim()) err = 'Brand name is required';
            else if (value.length < 3) err = 'Must be at least 3 characters';
            else if (value.length > 40) err = 'Cannot exceed 40 characters';
        } else if (field === 'contactInfo') {
            if (!value?.trim()) err = 'Contact info is required';
            else {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const digits = value.replace(/\D/g, '');
                const isPhone = digits.length >= 7 && digits.length <= 10 && /^[\d\s\-\+\(\)]+$/.test(value);
                if (!isEmail && !isPhone) {
                    err = 'Must be a valid email or 7-10 digit phone number';
                }
            }
        } else if (field === 'primaryColor') {
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(value)) err = 'Invalid hex color';
        } else if (field === 'headline') {
            if (!value?.trim()) err = 'Headline is required';
            else if (value.length > 60) err = 'Cannot exceed 60 characters';
        } else if (field === 'subheadline') {
            if (value && value.length > 150) err = 'Cannot exceed 150 characters';
        } else if (field === 'ctaText') {
            if (!value?.trim()) err = 'Button text is required';
            else if (value.length > 20) err = 'Cannot exceed 20 characters';
        } else if (field === 'banner' || field === 'logo') {
            const urlPattern = /^https?:\/\/.+/i;
            if (value && typeof value === 'string' && !urlPattern.test(value) && !value.startsWith('/') && !value.startsWith('blob:') && !value.startsWith('api/')) {
                err = 'Must be a valid URL';
            }
        }
        return err;
    };

    const handleFieldChange = (field, value) => {
        setStoreData(prev => ({ ...prev, [field]: value }));
        const err = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleFieldBlur = (field) => {
        const err = validateField(field, storeData[field]);
        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const validateForm = () => {
        const newErrs = {};

        // Check all fields
        const fields = ['name', 'contactInfo', 'primaryColor', 'headline', 'subheadline', 'ctaText', 'banner', 'logo'];
        fields.forEach(field => {
            const err = validateField(field, storeData[field]);
            if (err) newErrs[field] = err;
        });

        setErrors(newErrs);

        if (Object.keys(newErrs).length > 0) {
            // Visual feedback given dynamically in the form
            // Automatically scroll to the top of the sidebar where most identity fields are
            document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        }
        return true;
    };

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/stores/my-store', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && res.data.success && res.data.store) {
                    const s = res.data.store;
                    console.log('DEBUG: RAW STORE FROM SERVER', s);

                    setStoreData(prev => ({
                        ...prev,
                        name: s.storeName || prev.name,
                        banner: s.bannerUrl || prev.banner,
                        logo: s.logoUrl || prev.logo,
                        headline: s.themeSettings?.headline || prev.headline,
                        subheadline: s.themeSettings?.subheadline || prev.subheadline,
                        ctaText: s.themeSettings?.ctaText || prev.ctaText,
                        primaryColor: s.themeSettings?.primaryColor || prev.primaryColor,
                        contactInfo: s.contactInfo || prev.contactInfo
                    }));
                }
            } catch (err) {
                console.log("No store profile found yet, using defaults", err);
            }
        };
        fetchStore();
    }, []);

    const handleSave = async () => {
        if (!validateForm()) return;
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('storeName', storeData.name);
            formData.append('description', storeData.subheadline);
            formData.append('contactInfo', storeData.contactInfo);

            if (bannerFile) {
                formData.append('banner', bannerFile);
            } else {
                formData.append('bannerUrl', storeData.banner);
            }

            if (logoFile) {
                formData.append('logo', logoFile);
            } else {
                formData.append('logoUrl', storeData.logo);
            }

            formData.append('themeSettings', JSON.stringify({
                headline: storeData.headline,
                subheadline: storeData.subheadline,
                ctaText: storeData.ctaText,
                primaryColor: storeData.primaryColor
            }));

            await axios.post('http://localhost:5000/api/stores', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert(`SAVED SUCCESSFULLY!`);
            // Refresh to get actual Cloudinary URLs
            window.location.reload();
        } catch (error) {
            console.error('Failed to save store', error);
            const errorMsg = error.response?.data?.message || 'Failed to save store layout.';
            alert(errorMsg);
        }
        setIsSaving(false);
    };

    const handleLogout = () => {
        if (logout) {
            logout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 font-sans">
            {/* Top Navigation Bar: Editor Mode */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm relative">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/owner-dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        <span className="text-sm font-bold uppercase tracking-widest hidden md:block">Dashboard</span>
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">brush</span>
                        <h1 className="font-bold text-lg text-slate-900 tracking-tight">Store Builder</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/store/${encodeURIComponent(storeData.name)}`)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors cursor-pointer border border-transparent hover:border-slate-200 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        Live View
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#1111d4] hover:bg-[#1111d4]/90 text-white rounded-lg text-sm font-black transition-colors shadow-lg shadow-[#1111d4]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? (
                            'Saving...'
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Editor Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Configuration Sidebar */}
                <aside className="w-[320px] md:w-[380px] flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar flex flex-col shadow-2xl z-10">
                    <div className="p-6 space-y-8">
                        {/* Identity Section */}
                        <section>
                            <h2 className="text-[10px] font-black tracking-widest uppercase text-slate-700 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">badge</span>
                                Store Identity
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Brand Name</label>
                                    <input
                                        type="text"
                                        value={storeData.name || ''}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        onBlur={() => handleFieldBlur('name')}
                                        className={`w-full bg-slate-50 border ${errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-slate-400`}
                                        placeholder="Enter store name..."
                                    />
                                    {errors.name && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.name}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Contact Info</label>
                                    <input
                                        type="text"
                                        value={storeData.contactInfo || ''}
                                        onChange={(e) => handleFieldChange('contactInfo', e.target.value)}
                                        onBlur={() => handleFieldBlur('contactInfo')}
                                        className={`w-full bg-slate-50 border ${errors.contactInfo ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-slate-400`}
                                        placeholder="Phone, email address..."
                                    />
                                    {errors.contactInfo && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.contactInfo}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Theme Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg border-2 border-slate-200 overflow-hidden relative shadow-inner cursor-pointer flex-shrink-0">
                                            <input
                                                type="color"
                                                value={storeData.primaryColor || '#1111d4'}
                                                onChange={(e) => setStoreData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={storeData.primaryColor || '#1111d4'}
                                            onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                                            onBlur={() => handleFieldBlur('primaryColor')}
                                            className={`flex-1 bg-slate-50 border ${errors.primaryColor ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase`}
                                        />
                                    </div>
                                    {errors.primaryColor && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.primaryColor}</span>}
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-slate-100"></div>

                        {/* Content Section */}
                        <section>
                            <h2 className="text-[10px] font-black tracking-widest uppercase text-slate-700 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">edit_document</span>
                                Hero Content
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Headline</label>
                                    <textarea
                                        value={storeData.headline || ''}
                                        onChange={(e) => handleFieldChange('headline', e.target.value)}
                                        onBlur={() => handleFieldBlur('headline')}
                                        className={`w-full bg-slate-50 border ${errors.headline ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder-slate-400`}
                                        rows="2"
                                        placeholder="Hero headline..."
                                    ></textarea>
                                    {errors.headline && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.headline}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Subheadline</label>
                                    <textarea
                                        value={storeData.subheadline || ''}
                                        onChange={(e) => handleFieldChange('subheadline', e.target.value)}
                                        onBlur={() => handleFieldBlur('subheadline')}
                                        className={`w-full bg-slate-50 border ${errors.subheadline ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder-slate-400`}
                                        rows="3"
                                        placeholder="Description below headline..."
                                    ></textarea>
                                    {errors.subheadline && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.subheadline}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Button Text</label>
                                    <input
                                        type="text"
                                        value={storeData.ctaText || 'Shop Now'}
                                        onChange={(e) => handleFieldChange('ctaText', e.target.value)}
                                        onBlur={() => handleFieldBlur('ctaText')}
                                        className={`w-full bg-slate-50 border ${errors.ctaText ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-slate-400`}
                                        placeholder="e.g. Shop Now"
                                    />
                                    {errors.ctaText && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.ctaText}</span>}
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-slate-100"></div>

                        {/* Media Section */}
                        <section>
                            <h2 className="text-[10px] font-black tracking-widest uppercase text-slate-700 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">collections</span>
                                Media Assets
                            </h2>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all cursor-pointer border border-dashed border-slate-300">
                                            <span className="material-symbols-outlined text-[18px]">upload</span>
                                            {bannerFile ? bannerFile.name : 'Upload Laptop Banner'}
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            alert('Asset must be smaller than 5MB.');
                                                            return;
                                                        }
                                                        if (!file.type.startsWith('image/')) {
                                                            alert('Asset must be a valid image file.');
                                                            return;
                                                        }
                                                        setBannerFile(file);
                                                        setStoreData(prev => ({ ...prev, banner: URL.createObjectURL(file) }));
                                                    }
                                                }}
                                                accept="image/*"
                                            />
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="h-px bg-slate-100 flex-1"></span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase">OR URL</span>
                                            <span className="h-px bg-slate-100 flex-1"></span>
                                        </div>
                                        <input
                                            type="text"
                                            value={storeData.banner || ''}
                                            onChange={(e) => handleFieldChange('banner', e.target.value)}
                                            onBlur={() => handleFieldBlur('banner')}
                                            className={`w-full bg-slate-50 border ${errors.banner ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-slate-400`}
                                            placeholder="Paste image URL..."
                                        />
                                        {errors.banner && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.banner}</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-4 items-center">
                                            {storeData.logo ? (
                                                <img src={storeData.logo} alt="Logo" className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shadow-sm bg-slate-50 flex-shrink-0" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400">image</span>
                                                </div>
                                            )}
                                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-dashed border-slate-300">
                                                {logoFile ? logoFile.name : 'Upload Logo'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (file.size > 5 * 1024 * 1024) {
                                                                alert('Logo must be smaller than 5MB.');
                                                                return;
                                                            }
                                                            if (!file.type.startsWith('image/')) {
                                                                alert('Logo must be a valid image file.');
                                                                return;
                                                            }
                                                            setLogoFile(file);
                                                            setStoreData(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
                                                        }
                                                    }}
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-px bg-slate-100 flex-1"></span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase">OR URL</span>
                                            <span className="h-px bg-slate-100 flex-1"></span>
                                        </div>
                                        <input
                                            type="text"
                                            value={storeData.logo || ''}
                                            onChange={(e) => handleFieldChange('logo', e.target.value)}
                                            onBlur={() => handleFieldBlur('logo')}
                                            className={`w-full bg-slate-50 border ${errors.logo ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'} rounded-xl px-4 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-slate-400`}
                                            placeholder="Paste logo URL..."
                                        />
                                        {errors.logo && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block px-1">{errors.logo}</span>}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </aside>

                {/* Right Panel: Live Preview Canvas */}
                <main className="flex-1 bg-[#f6f6f8] overflow-y-auto p-4 md:p-10 flex justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-6 right-6 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm shadow-xl z-20">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Live Preview
                    </div>

                    {/* Mock Browser Window */}
                    <div className="w-full max-w-[1200px] bg-white rounded-t-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col pointer-events-none transform origin-top transition-transform duration-300 min-h-[1000px]">
                        {/* Browser Header */}
                        <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            <div className="flex-1 max-w-sm mx-auto bg-white border border-slate-200 rounded-md py-1 px-4 text-center">
                                <span className="text-xs text-slate-400 font-medium">
                                    <span className="material-symbols-outlined text-[10px] mr-1 inline-block align-middle">lock</span>
                                    hustlehub.com/store/{storeData.name?.toLowerCase().replace(/\s+/g, '-') || 'my-shop'}
                                </span>
                            </div>
                        </div>

                        {/* Interactive Store Mockup */}
                        <div className="flex-1 bg-slate-50 flex flex-col font-sans text-slate-900 relative">
                            {/* Mock Store Header */}
                            <header className="px-8 py-5 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm shrink-0">
                                <div className="flex items-center gap-4">
                                    {storeData.logo ? (
                                        <img src={storeData.logo} alt="Mock Logo" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-400">store</span>
                                        </div>
                                    )}
                                    <span className="font-black text-xl tracking-tight" style={{ color: storeData.primaryColor || '#051094' }}>
                                        {storeData.name || 'Store Name'}
                                    </span>
                                </div>
                                <div className="hidden md:flex items-center gap-6">
                                    <span className="text-sm font-bold text-slate-400">Marketplace</span>
                                </div>
                            </header>

                            {/* Mock Store Hero/Banner */}
                            <div className="relative h-[400px] shrink-0 bg-slate-100 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                                {storeData.banner ? (
                                    <img src={storeData.banner} alt="Mock Banner" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${storeData.primaryColor || '#1111d4'}, #000000)` }}></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                                <div className="relative z-10 max-w-2xl transform translate-y-4">
                                    <h1 className="text-5xl font-black text-white mb-6 drop-shadow-md leading-tight">
                                        {storeData.headline || 'Welcome to our store'}
                                    </h1>
                                    <p className="text-xl text-slate-200 font-medium mb-10 drop-shadow-md">
                                        {storeData.subheadline || 'Explore our latest collection.'}
                                    </p>
                                    <button
                                        className="px-10 py-4 text-white font-black rounded-2xl shadow-xl transition-colors"
                                        style={{ backgroundColor: storeData.primaryColor || '#051094' }}
                                    >
                                        {storeData.ctaText || 'Shop Now'}
                                    </button>
                                </div>
                            </div>

                            {/* Mock Store Grid Placeholder */}
                            <div className="flex-1 p-10 bg-slate-50 relative pointer-events-none pb-20">
                                <div className="max-w-6xl mx-auto">
                                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-3xl" style={{ color: storeData.primaryColor || '#051094' }}>local_mall</span>
                                        Featured Products
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-80">
                                        {[
                                            { id: 1, stock: 'in_stock', label: 'In Stock', color: 'bg-emerald-100 text-emerald-700' },
                                            { id: 2, stock: 'low_stock', label: 'Low Stock', color: 'bg-amber-100 text-amber-700' },
                                            { id: 3, stock: 'out_of_stock', label: 'Out of Stock', color: 'bg-rose-100 text-rose-700' },
                                            { id: 4, stock: 'in_stock', label: 'In Stock', color: 'bg-emerald-100 text-emerald-700' }
                                        ].map(item => (
                                            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-200 relative group overflow-hidden">
                                                <div className={`aspect-[4/5] bg-slate-100 rounded-2xl mb-4 relative overflow-hidden ${item.stock === 'out_of_stock' ? 'opacity-80 grayscale' : ''}`}>
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                                    </div>

                                                    {/* Stock Badge Centered Over Image */}
                                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${item.color} z-10 shadow-sm flex items-center gap-1 backdrop-blur-sm`}>
                                                        <span className="material-symbols-outlined text-[11px]">
                                                            {item.stock === 'in_stock' ? 'check_circle' : item.stock === 'low_stock' ? 'warning' : 'error'}
                                                        </span>
                                                        {item.label}
                                                    </div>
                                                </div>

                                                <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-2"></div>
                                                <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-4"></div>

                                                <div className="mt-auto flex justify-between items-center">
                                                    <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
                                                    <button
                                                        disabled={item.stock === 'out_of_stock'}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.stock === 'out_of_stock'
                                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                                : 'bg-slate-100 text-[#1111d4] hover:bg-[#1111d4] hover:text-white cursor-pointer'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Gradient fade overlay for the bottom to mimic endless scroll */}
                                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StoreEditor;
