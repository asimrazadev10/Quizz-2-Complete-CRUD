import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { Toaster } from "sonner"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        classNames: {
          toast: 'bg-gray-900/95 backdrop-blur-sm border border-white/10 text-white',
          title: 'text-white font-semibold',
          description: 'text-gray-300',
          success: 'bg-green-600/20 border-green-500/50',
          error: 'bg-red-600/20 border-red-500/50',
          warning: 'bg-yellow-600/20 border-yellow-500/50',
          info: 'bg-blue-600/20 border-blue-500/50',
        },
        style: {
          background: 'rgba(17, 24, 39, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
        },
      }}
    />
  </React.StrictMode>,
)
