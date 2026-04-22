import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomerHeader from '../CustomerHeader';

const CustomerLayout = ({ children, activeTab = 'dashboard', headerTitle = 'Customer Dashboard' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const sidebarItems = [
        { id: 'dashboard', label: 'Overview', icon: 'dashboard', path: '/customer-dashboard' },
        { id: 'stores', label: 'Browse Stores', icon: 'storefront', path: '/stores' },
        { id: 'products', label: 'Products', icon: 'inventory_2', path: '/customer/products' },
        { id: 'orders', label: 'My Orders', icon: 'shopping_bag', path: '/orders' },
        { id: 'saved', label: 'Saved Items', icon: 'favorite', path: '/saved-items' },
        { id: 'contact', label: 'Contact Us', icon: 'mail', path: '/customer/contact' },
        { id: 'settings', label: 'Settings', icon: 'settings', path: '/profile' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications', path: '/notifications' },
    ];

    const handleLogout = () => {
        if (logout) logout();
        else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        navigate('/login');
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
    };

    return (
        <div className="bg-[#f8fafc] text-slate-900 font-sans min-h-screen">
            <CustomerHeader />
            <div className="flex h-screen overflow-hidden pt-[72px]">
                {/* Sidebar */}
                <aside className="tour-sidebar w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200">
                    <div className="pt-6"></div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {sidebarItems.map(item => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                    activeTab === item.id
                                        ? 'bg-[#051094]/10 text-[#051094] font-bold shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'fill-1' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
                        <button
                            onClick={() => navigate('/stores')}
                            className="w-full flex items-center justify-center gap-2 bg-[#051094] text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all cursor-pointer border-none shadow-lg shadow-[#051094]/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">storefront</span>
                            <span>Browse Stores</span>
                        </button>
                        <div className="pt-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 text-sm font-bold cursor-pointer border-none bg-transparent transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Interior Header */}
                    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-100 shrink-0">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{headerTitle}</h2>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-black text-slate-900 tracking-tight">
                                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Student'}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {user?.studentEmail || 'Customer'}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                {user?.profilePicture ? (
                                    <img src={getImageUrl(user.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
                        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;
