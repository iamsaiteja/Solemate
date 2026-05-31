import axios from "axios";

const BASE_URL = "https://solemate.servecounterstrike.com";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getImage = (url) => {
  if (!url) {
    return "https://via.placeholder.com/300?text=No+Image";
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${BASE_URL}${url}`;
};

export const getProduct = (id) => {
  return API.get(`/products/${id}/`);
};

export default API;