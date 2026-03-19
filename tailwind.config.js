/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                pharmlyGreen: '#0d3b36', // dark green from sidebar
                pharmlyLightGreen: '#d4ed66', // lime green from active item
                pharmlyGray: '#f8f9fa', // background color
                pharmlyTextDark: '#1a1a1a',
                pharmlyTextGray: '#6b7280',
                pharmlyCard: '#ffffff',
            }
        },
    },
    plugins: [],
}
