/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1111d4',
                indigo: {
                    50: '#eef1ff',
                    100: '#e0e5ff',
                    200: '#c5ccfa',
                    300: '#a1a9f5',
                    400: '#7d84ed',
                    500: '#5c60e3',
                    600: '#051094',
                    700: '#040b7a',
                    800: '#030861',
                    900: '#02054a',
                    950: '#010333',
                }
            }
        },
    },
    plugins: [],
}
