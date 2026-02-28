import axios from "axios"

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:8000/api"
    : "https://ai-smart-study-planner.onrender.com/api"

const API = axios.create({
  baseURL,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
