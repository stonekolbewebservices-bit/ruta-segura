import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

console.log("React Imports Loaded");
console.log("Mounting App Component...");

try {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
    console.log("App Component Mounted");
} catch (e) {
    console.error("Render failed", e);
}
