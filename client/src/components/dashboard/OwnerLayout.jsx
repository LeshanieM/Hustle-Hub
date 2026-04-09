import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerHeader from '../OwnerHeader';

const OwnerLayout = ({ children, activeTab = 'dashboard', theme = 'light' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        <Link 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-[#1111d4]/10 text-[#1111d4] font-bold' : 'text-slate-600 hover:bg-slate-100'}`} 
                            to="/owner-dashboard"
                        >
                            <span className="material-icons-filled">dashboard</span>
                            <span>Overview</span>
                        </Link>
                        <a className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-[#1111d4]/10 text-[#1111d4] font-bold' : 'text-slate-600 hover:bg-slate-100'}`} href="#">
                            <span className="material-symbols-outlined">inventory_2</span>
                            <span>Products</span>
                        </a>
                        <a className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-[#1111d4]/10 text-[#1111d4] font-bold' : 'text-slate-600 hover:bg-slate-100'}`} href="#">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <span>Orders</span>
                        </a>
                        <Link className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-[#1111d4]/10 text-[#1111d4] font-bold' : 'text-slate-600 hover:bg-slate-100'}`} to="/owner/reports">
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span>Reports</span>
                        </Link>
                        <Link 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-[#1111d4]/10 text-[#1111d4] font-bold' : 'text-slate-600 hover:bg-slate-100'}`} 
                            to="/analytics"
                        >
                            <span className="material-symbols-outlined">analytics</span>
                            <span>Analytics</span>
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-slate-200 space-y-3">
                        <button onClick={() => navigate('/owner/products/add')} className="w-full flex items-center justify-center gap-2 bg-[#1111d4] text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer border-none">
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>Add Product</span>
                        </button>
                        <div className="pt-4 space-y-1">
                            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm transition-colors" to="/store-editor">
                                <span className="material-symbols-outlined text-base">brush</span>
                                <span>Store Editor</span>
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm cursor-pointer border-none bg-transparent">
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Navigation */}
                    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0">
                        <div className="flex-1 max-w-xl">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1111d4] transition-colors">search</span>
                                <input className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#1111d4] transition-all text-sm outline-none" placeholder="Search products, orders, or analytics..." type="text" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold">{user?.firstName ? `${user.firstName} ${user.lastName}` : "Shop Owner"}</p>
                                    <p className="text-xs text-slate-500">Shop Owner</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-200 border border-[#1111d4]/20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'Owner'}&backgroundColor=b6e3f4')` }}></div>
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Dashboard Content */}
                    <div className={`flex-1 overflow-y-auto relative ${theme === 'dark' ? 'bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030712] to-black text-slate-100' : theme === 'white' ? 'bg-white text-slate-900' : 'bg-[#f6f6f8]'}`}>
                        <div className="p-8 animate-fade-in-up min-h-full relative z-10">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OwnerLayout;
