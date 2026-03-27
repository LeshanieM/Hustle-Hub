import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CustomerHeader from '../../components/CustomerHeader';
import Footer from '../../components/Footer';

const StorefrontView = () => {
  const { storeName } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const encodedName = encodeURIComponent(storeName);
        const storeRes = await axios.get(
          `http://localhost:5000/api/stores/${encodedName}`,
        );

        if (storeRes.data && storeRes.data.success && storeRes.data.store) {
          const storeObj = storeRes.data.store;
          setStore(storeObj);

          // Fetch products owned by this store's owner
          if (storeObj.ownerId) {
            const productRes = await axios.get(
              `http://localhost:5000/api/products/owner/${storeObj.ownerId}`,
            );
            const prods = productRes.data?.products || productRes.data || [];
            setProducts(Array.isArray(prods) ? prods : []);
          }
        }
      } catch (err) {
        console.error('Failed to load store data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [storeName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#051094]"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-bold text-slate-400">
        <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">
          storefront
        </span>
        Store Not Found
        <Link
          to="/"
          className="mt-4 px-6 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-300 transition-colors"
        >
          Return to Market
        </Link>
      </div>
    );
  }

  const themeColors = store.themeSettings || {};
  const primaryColor = themeColors.primaryColor || '#051094';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <CustomerHeader />

      <div className="flex-grow pt-24 pb-12">
        {/* Banner Section */}
        <div className="relative h-[250px] md:h-[450px] bg-slate-900 overflow-hidden flex items-center justify-center text-center">
          {store.bannerUrl && (
            <img
              src={store.bannerUrl}
              alt="Store Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          {/* Fallback gradient if no banner */}
          {!store.bannerUrl && (
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #000000)`,
              }}
            ></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

          <div className="relative z-10 max-w-3xl px-6 transform translate-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight shadow-black drop-shadow-lg">
              {themeColors.headline || `Welcome to ${store.storeName}`}
            </h2>
            <p className="text-lg md:text-xl text-slate-200 font-medium mb-8 drop-shadow-md">
              {themeColors.subheadline || 'Explore our latest collection.'}
            </p>
          </div>
        </div>

        {/* Contact & Info Bar */}
        <div className="bg-white border-b border-slate-200 py-4 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-8">
            {store.contactInfo && (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="material-symbols-outlined text-xl text-slate-400">
                  contact_support
                </span>
                <span className="text-sm font-bold truncate max-w-xs">
                  {store.contactInfo}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-xl text-slate-400">
                verified
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-[#059669]">
                Verified Store
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: primaryColor }}
              >
                local_mall
              </span>
              Featured Products
            </h3>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((p, idx) => (
                <Link
                  to={`/customer/products/${p._id}`}
                  key={idx}
                  className="bg-white p-5 rounded-[32px] border border-slate-200 group cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block"
                >
                  <div className="aspect-[4/5] bg-slate-100 rounded-2xl mb-5 overflow-hidden relative">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined text-4xl">
                          inventory_2
                        </span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors truncate">
                    {p.name}
                  </h4>
                  <p className="text-slate-500 font-medium line-clamp-2 text-sm mt-1 mb-3">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <p
                      className="text-lg font-black"
                      style={{ color: primaryColor }}
                    >
                      ${p.price.toFixed(2)}
                    </p>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        shopping_cart
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  inventory_2
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">
                No Products Yet
              </h4>
              <p className="text-slate-500 font-medium">
                This store hasn't added any products to their catalog.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StorefrontView;
