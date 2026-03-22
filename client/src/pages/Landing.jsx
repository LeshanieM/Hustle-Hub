import React from 'react';
import { Link } from 'react-router-dom';
import chemistryImg from '../assets/chemistry.png';
import CustomerHeader from '../components/CustomerHeader';

// SVG-based Icon component for maximum reliability
const MaterialIcon = ({ name, size = 24, className = "" }) => {
  const icons = {
    grid_view: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    notifications: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    shopping_cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    add_shopping_cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        <line x1="12" y1="9" x2="12" y2="15" /><line x1="9" y1="12" x2="15" y2="12" />
      </svg>
    ),
    favorite: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    chevron_right: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    chevron_left: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    help_center: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    menu_book: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    devices: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    restaurant: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    design_services: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.5 1.5" /><path d="M14 11l5 5" />
      </svg>
    ),
    calendar_today: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    public: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    share: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    alternate_email: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" /><path d="M16 12v1a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
      </svg>
    )
  };

  return <span className={`inline-flex items-center justify-center ${className}`}>{icons[name] || name}</span>;
};

export default function Landing() {
  return (
    <div className="bg-[#f6f6f8] text-slate-900 antialiased font-display min-h-screen">
      {/* Customer Header Component */}
      <CustomerHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Search Section */}
        <section className="py-12 md:py-20 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            What are you looking for today?
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            Discover local student-run businesses and essentials on campus.
          </p>
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <MaterialIcon name="search" className="text-slate-400 group-focus-within:text-[#1111d4]" size={24} />
            </div>
            <input 
              className="block w-full pl-14 pr-32 py-5 bg-white border-none rounded-2xl shadow-lg shadow-[#1111d4]/5 focus:ring-1 focus:ring-[#1111d4] text-base placeholder-slate-300 outline-none" 
              placeholder="Search textbooks, tech, food, and more..." 
              type="text" 
            />
            <div className="absolute inset-y-2 right-2">
              <button className="h-full px-8 bg-[#1111d4] text-white font-bold rounded-xl hover:bg-[#0d0db0] transition-all active:scale-95 border-none cursor-pointer">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Categories</h2>
            <Link className="text-[#1111d4] font-bold text-sm hover:underline no-underline" to="#">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Textbooks', icon: 'menu_book', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD7XK9IjLYp7nxDE8Ao0Aq-otKi9YUn6TmoW5iLlepNmLK8czWkFZzfVGQwaMRxM4nVtOJsNoH_IaWsXkK-TsC9WqR4xEy0hKt0EoLGgD6cJHSInJC-vXOl2sTFkpuTyD3KQw8MfB_qHMXWJlVp_GLJfLc4af-Mu29qnwowo-LVssAMvyFPJMOUOhPylhY8vjf3w-_qA1u5Psszyzv1FhtHe3XxCXmq_VGlY4yr0US1w7-c6A-nM0HNIkuTSWmkfQhDRp3D90YNQ' },
              { name: 'Tech', icon: 'devices', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZcKZoE9md5_ik2-FQhWcf93ZrVjWTYHRrxyzMadC7bUY2R-gzUg1RRDIWcSDbp-bhCcN7gafEY3_gY2Al11vDidJcqW94E6srooEUP5RtMXJIdav3qNtlx9cx6B4isKH-BicCUMhSPcrGYCaLnDx6V9jHjUDBe5cqmXsGKXnE-K3Ne1_QE6VIlbyV7RUcnTS2W8m4BzjjJzHCvI-cGJxx5iYiPdurqwpEtVOyojxwigJ1RFOxrxHs_UqucOd9UNdAS9wzP6g-Aw' },
              { name: 'Food', icon: 'restaurant', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXMk3n8Cn0Ae3xvskSC0XfcF-EpJqsDioiDJ84H-G6JMG9XiMpLgBwRXWSE3FFg9S3RV9_vbUF3XcA51PCysYBbtLgzyhazpqnVtqt4B1iR3jV37dqrY6kI9bI6BbBvkR5LCp86siiBY8iwzcsTgutY2CymEEv2HKZSZAE5zDtBjXfPErOAbkeSl_Xfrtg8qB49eG7IAHIB3phDsr0rE9vJYUTIKyHmFSGX2QzX3Kny93UtvI5dxlzrvspEPkQGfO8gQHiTryTvw' },
              { name: 'Services', icon: 'design_services', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF8g043J-vg8umvuJziYJCWsii_-EYUQkY4L6PrtpICL-emNY6HneQspoqUkkNzqOdLoG3oYhrOdQT96jJNuMwbtCVq9SVRJo6b-R0xuPyDUQNZIGkL4KTPbgs_anHQRVM0t2u7nxjhBfvbB3DZHWO-9LV5BMRA0wVabY9Xrz7ruzj9CHrvnML8pNhs5eX4cK4HlMqD0WANQgUlxZhL3_rayBnmRpcIAG_XfLnjMaUQ_1WlKaFfyJQLIDWGORXCjBO10QGHwjPtw' }
            ].map((cat) => (
              <Link key={cat.name} className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-200 no-underline shadow-sm" to="#">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={cat.img} alt={cat.name}/>
                <div className="absolute bottom-4 left-4 z-20">
                  <MaterialIcon name={cat.icon} className="text-white mb-2" size={24} />
                  <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* New on Campus Stores */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">New on Campus</h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">Support your fellow students and discover fresh hustle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: 'Dorm Decor & Co.', 
                tag: 'Verified Seller', 
                tagColor: 'bg-green-100 text-green-700', 
                desc: 'Elevate your living space with affordable, student-made decor and lights.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeONIoXT64xhkVrkveg-9uWfoTfU7Wz8XWavIXfry04MBOu0sf3SVDYxpw6xXftYOYLd4lD3o1-jELwBiUgf0iSVhw3Qq4V-Rtcib-1f_MYjDNv0H9W-fDxg85tip_EMcwbVdg4iJPppr7Tn_KSyhBRyS0qL5pajlvjrexrIjrpsZDQ0rQuku2VT50acYl5kR_UZFimDJxOCi4fat928UcwI3hkE9MKN4mBO-wv0OnUv45IGkzia8wbBC_c98tTNdSnpOZgDKiVg',
                btn: 'Visit Store'
              },
              { 
                name: 'Quick Fix Tech', 
                tag: 'Service', 
                tagColor: 'bg-blue-100 text-blue-700', 
                desc: 'Screen repairs, RAM upgrades, and software troubleshooting while you wait.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUEHaby3ethq5DAtRF1TSrsacBPmUcKcwoGd8t8Gat_wF-NdEPfGxAGivms1mB_XnZWG9KjPu-3t6osJ1eBF1T8UOSr20QF5V6_Hn64cDgFRJd0oAw7fUm6i2rWzXkDv2A5khW4DtgNit3-NeCkq-ylx__djtAZq28iXpBjiO_fIi3jxmnGpEYCZSXTY5CYie4jVQRUvgugO2jtAnIEXCCAQ5z1-XP0wIfiq01djS4hEfD8sMU-MJ5hoNMAsoRHvFekjjrgJYYXA',
                btn: 'Book Now'
              },
              { 
                name: 'Midnight Munchies', 
                tag: 'Popular', 
                tagColor: 'bg-amber-100 text-amber-700', 
                desc: 'Freshly baked cookies and hot cocoa delivered straight to your library desk.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw6xpsI7ozuK_giEpkBe6fwbTbqthBb5cziTnOp91A98luG6-VRCSFWJoeZpOV54GKZYHHCPDRIlSB7iUn5F97ZG-NSYgT2RdlMMdK1T3oBpvp17j9wa7o27oPwSTYBB7JuTBo_sBfnV2y-jBGb3qNjL77-2A78fxJf3rhbVa6UFwnpHfaeSdEJXsR7GM3jMWm5WSJvUaQFiM1xWeOxj7p_JP0UsSatvD-HLFpGatJXlKyZQ9LdCpSL7fKM8UPD8Wtmj7N4z4BGg',
                btn: 'Order Now'
              }
            ].map((store) => (
              <div key={store.name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                    <img alt="Logo" className="w-full h-full object-cover" src={store.img}/>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{store.name}</h3>
                    <span className={`inline-block px-2 py-0.5 mt-1 ${store.tagColor} text-[10px] font-bold uppercase tracking-wider rounded`}>{store.tag}</span>
                  </div>
                </div>
                <p className="text-slate-500 font-medium mb-6 text-sm leading-relaxed line-clamp-2">{store.desc}</p>
                <button className="w-full py-2.5 rounded-lg border-2 border-slate-100 text-[#1111d4] font-bold hover:bg-[#1111d4] hover:text-white hover:border-[#1111d4] transition-all border-none bg-transparent cursor-pointer">
                  {store.btn}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Now Products */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Trending Now</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-900">
                <MaterialIcon name="chevron_left" size={24} />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-900">
                <MaterialIcon name="chevron_right" size={24} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Pro Noise Cancelling Headphones', cat: 'Tech', price: '$85.00', score: '4.9 (42)', icon: 'add_shopping_cart', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp2iu3WNHQw9drZmrNIiQ1Jdh6Isv1itVIZ8nVl109gqa2TJ2463rxqnSfFDAj5bmPk1FmNkzncwjRpU_gK8bC_2V6oADqfNiBChoKcSk3dZBxyHtU5yObd7-MEafrHCMlubFQQ4cBKJuPVgP1qVqF9yvF3lGYzpbLaxzgYWqgmQZUPm9A0__KGEhZhmuBe1Z8LMTZchr-43gYF49fdof6KuhXsxUsqul4UKUz_tK-Y-EHg7PBM-OprME78PQl9mVqgs9zYpZ0gQ' },
              { name: 'Chemistry 101 Tutoring (1hr)', cat: 'Services', price: '$25.00', score: '5.0 (18)', icon: 'calendar_today', img: chemistryImg },
              { name: 'Macroeconomics (8th Ed.)', cat: 'Textbooks', price: '$45.00', score: '4.7 (5)', icon: 'add_shopping_cart', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC06V4nQSTb0Ba5I9Vcy7_Ni7brElLn-wuavBshEx4Mjk-C3oJBa8z3ic9X1LWrCpupJu_5iUfIf20QKC5KW4xyoPJ4oQjBq-M9cKgkbxzPzED3Z6n2Ia2RO9x3oHMSDHSq-qu4iQ3wE96Wal5EiuFzem7a1lwXMf12RxLQHPd_lQ3p8xX4dCqAGzX_OYth6msLVUg128ixrCO956Yclf71YuaruPdLGIijL_zpK90GdhE7uJkTuOo1IqECYLI63_tqHexLQUh1aA' },
              { name: 'Gourmet Cookie Box (6pk)', cat: 'Food', price: '$12.00', score: '4.8 (124)', icon: 'add_shopping_cart', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB-bz5ZzU62EH-s7rtkOn2SSXFsbgoeD4RH4yWJ1vACZr3Us39PNbUdexUywIKmae8_scNsX4M0PBqIQuYdZtX6GbQ7ytYLkFYEBSJ0gWGxi0D4S0yhr3cMqfA9V_UY7JlYRGO5NaXlFfYbFmyC56AAgqDbQRMAGjkzt85ROsUuOdkOmOQNzhDlFJb8aq-Ba30rc-uzfMZEkGYxgMnMyel4nJi6Z8G-0DR_JyVbWnfNelCfksQAOcPwnVEMdrW1FIYzragkWoy4g' }
            ].map((prod) => (
              <div key={prod.name} className="group cursor-pointer">
                <div className="relative rounded-3xl overflow-hidden aspect-square bg-slate-100 mb-4 shadow-sm group-hover:shadow-lg transition-all duration-500">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={prod.img} alt={prod.name}/>
                  <button className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 transition-all shadow-md active:scale-90 border-none cursor-pointer">
                    <MaterialIcon name="favorite" size={20} />
                  </button>
                </div>
                <div className="space-y-1.5 px-0.5">
                  <p className="text-[10px] font-bold text-[#1111d4] uppercase tracking-widest">{prod.cat}</p>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{prod.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    <MaterialIcon name="star" size={12} />
                    <span className="text-xs font-bold text-slate-900">{prod.score}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-black text-slate-900">{prod.price}</span>
                    <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-[#1111d4] transition-all active:scale-90 shadow-md border-none bg-transparent cursor-pointer">
                      <MaterialIcon name={prod.icon} size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#1111d4] rounded-[32px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-[#1111d4]/20">
          <div className="absolute inset-0 bg-white/10 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">Ready to start your own hustle?</h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of students earning extra cash by selling textbooks, skills, or treats on campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-white text-[#1111d4] font-bold rounded-xl text-lg hover:shadow-2xl hover:scale-105 transition-all active:scale-95 border-none cursor-pointer">
                Start Selling Today
              </button>
              <button className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white font-bold rounded-xl text-lg hover:bg-white/20 hover:scale-105 transition-all active:scale-95 border-none cursor-pointer">
                Learn How It Works
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-center md:text-left">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <div className="bg-[#1111d4] text-white p-1 rounded-lg">
                  <MaterialIcon name="grid_view" size={20} />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-[#1111d4]">Hustle Hub</span>
              </div>
              <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                The ultimate marketplace for university life. Built for students, by students.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Shop</h4>
              <ul className="space-y-3 text-slate-500 font-semibold text-sm list-none p-0">
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">All Categories</Link></li>
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Featured Stores</Link></li>
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Student Discounts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Sell</h4>
              <ul className="space-y-3 text-slate-500 font-semibold text-sm list-none p-0">
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Seller Dashboard</Link></li>
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Pricing & Fees</Link></li>
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Verification</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h4>
              <ul className="space-y-3 text-slate-500 font-semibold text-sm list-none p-0">
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Help Center</Link></li>
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Trust & Safety</Link></li>
                <li><Link className="hover:text-[#1111d4] no-underline transition-colors" to="#">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-slate-300">© 2024 Hustle Hub Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link className="text-slate-300 hover:text-[#1111d4] transition-all no-underline" to="#">
                <MaterialIcon name="public" size={20} />
              </Link>
              <Link className="text-slate-300 hover:text-[#1111d4] transition-all no-underline" to="#">
                <MaterialIcon name="share" size={20} />
              </Link>
              <Link className="text-slate-300 hover:text-[#1111d4] transition-all no-underline" to="#">
                <MaterialIcon name="alternate_email" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#1111d4] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-none cursor-pointer p-0">
        <MaterialIcon name="help_center" size={28} />
      </button>
    </div>
  );
}
