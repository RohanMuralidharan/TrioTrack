import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom styles for scrollbar and animations
const style = document.createElement('style');
style.textContent = `
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* Pulsing animation for alerts */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 87, 34, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 87, 34, 0);
    }
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  /* Skeleton loading animation */
  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }
  
  .skeleton {
    background: linear-gradient(to right, #f6f6f6 8%, #f0f0f0 18%, #f6f6f6 33%);
    background-size: 800px 104px;
    animation: shimmer 1.5s linear infinite;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
