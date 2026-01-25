/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'safety-safe': '#00ff66',
                'safety-warning': '#ffcc00',
                'safety-danger': '#ff0033',
                'dark-bg': '#121212',
                'dark-card': '#1e1e1e',
            }
        },
    },
    plugins: [],
}
