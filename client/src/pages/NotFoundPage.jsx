import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
            <div className="bg-white p-12 text-center border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full">
                <h1 className="text-9xl font-black text-blue-900 mb-4 italic">404</h1>
                <h2 className="text-3xl font-black uppercase mb-6 tracking-widest bg-black text-white py-2">Lost in the Hub?</h2>
                <p className="text-lg font-bold text-gray-800 mb-8 italic">
                    "Looks like this page skipped the lecture. We couldn't find what you were looking for."
                </p>
                <Link
                    to="/"
                    className="inline-block bg-blue-900 text-white px-10 py-4 font-black text-xl border-4 border-black hover:bg-black transition-all uppercase"
                >
                    Back to Campus
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
