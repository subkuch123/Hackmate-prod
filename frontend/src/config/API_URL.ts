

let API_URL: string;
let WS_API_URL: string;

if (import.meta.env.VITE_NODE_ENV === "production") {
  API_URL = "https://hackforce.onrender.com";
  WS_API_URL = "hackforce.onrender.com";
} else {

  // API_URL = "https://hackforce.onrender.com";
  // WS_API_URL = "hackforce.onrender.com";
  // API_URL = "http://localhost:5001";
  // WS_API_URL = "ws://localhost:5001";
  // API_URL = "https://hack-mate-server-production.up.railway.app";
  // WS_API_URL = "hack-mate-server-production.up.railway.app";
  API_URL = "https://hackmate-prod-service.onrender.com";
  WS_API_URL = "hackmate-prod-service.onrender.com";
  // API_URL= "https://hackmate-dev.onrender.com"
  // WS_API_URL= "hackmate-dev.onrender.com"
  //  API_URL = "http://192.168.0.103:5001";
  // WS_API_URL = "192.168.0.103:5001";
}

export { API_URL, WS_API_URL };