import axios from "axios";

const BASE_URL = "https://solemate.servecounterstrike.com";

axios.defaults.withCredentials = true;


const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        
        if (!refresh) {
          localStorage.clear();
          window.location.replace("/login");
          return;
        }

        
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh/`,
          {
            refresh,
          }
        );

       
        localStorage.setItem(
          "access",
          res.data.access
        );

       
        if (res.data.refresh) {
          localStorage.setItem(
            "refresh",
            res.data.refresh
          );
        }

        
        originalRequest.headers.Authorization =
          `Bearer ${res.data.access}`;

        
        return API(originalRequest);

      } catch (err) {

        
        localStorage.clear();

        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);


export const getImage = (url) => {

  if (!url) {
    return "https://via.placeholder.com/300?text=No+Image";
  }

 
  if (url.startsWith("http")) {
    return url;
  }

  
  const cleanUrl = url.startsWith("/media/")
    ? url
    : `/media/${url}`;

  return `${BASE_URL}${cleanUrl}`;
};


export const getProduct = (id) => {
  return API.get(`/products/${id}/`);
};

export default API;