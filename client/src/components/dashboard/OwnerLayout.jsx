import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerHeader from '../OwnerHeader';

const OwnerLayout = ({ children, activeTab = 'dashboard', headerTitle = 'Owner Dashboard', theme = 'light' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const sidebarItems = [
        { id: 'dashboard', label: 'Overview', icon: 'dashboard', path: '/owner-dashboard' },
        { id: 'products', label: 'Products', icon: 'inventory_2', path: '/owner/products' },
        { id: 'orders', label: 'Orders', icon: 'shopping_cart', path: '/owner/orders' },
        { id: 'alerts', label: 'Stock Alerts', icon: 'error', path: '/owner/alerts' },
        { id: 'analytics', label: 'Analytics', icon: 'analytics', path: '/analytics' },
        { id: 'reports', label: 'Reports', icon: 'bar_chart', path: '/owner/reports' },
        { id: 'store-editor', label: 'Store Editor', icon: 'brush', path: '/store-editor' },
        { id: 'contact', label: 'Support', icon: 'mail', path: '/owner/contact' },
    ];

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
        <div className="bg-[#f6f6f8] text-slate-900 font-sans min-h-screen">
            <OwnerHeader />
            <div className="flex h-screen overflow-hidden pt-[72px]">
                {/* Sidebar Navigation */}
                <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200">
                    <div className="pt-6"></div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                        {sidebarItems.map(item => (
                            <Link 
                                key={item.id}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#1111d4]/10 text-[#1111d4] font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`} 
                                to={item.path}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                    
                    <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
                        <button onClick={() => navigate('/owner/products/add')} className="w-full flex items-center justify-center gap-2 bg-[#1111d4] text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all cursor-pointer border-none shadow-lg shadow-[#1111d4]/20">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>Add Product</span>
                        </button>
                        <div className="pt-2">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 text-sm font-bold cursor-pointer border-none bg-transparent transition-colors">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Interior Header */}
                    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-100 shrink-0">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{headerTitle}</h2>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-black text-slate-900 tracking-tight">{user?.firstName ? `${user.firstName} ${user.lastName}` : "Shop Owner"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.storeName || 'Verified Merchant'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Dashboard Content */}
                    <div className={`flex-1 overflow-y-auto relative ${theme === 'dark' ? 'bg-[#030712] text-slate-100' : theme === 'white' ? 'bg-white text-slate-900' : 'bg-[#f6f6f8]'}`}>
                        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full relative z-10">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OwnerLayout;
