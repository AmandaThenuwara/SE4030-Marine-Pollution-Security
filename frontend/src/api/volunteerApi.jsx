import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/volunteers`;

// Get all volunteers
const getRequestConfig = () => {
  const token = localStorage.getItem("token");
  return {
    withCredentials: true,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  };
};

export const getVolunteers = () => axios.get(API_URL, getRequestConfig());

// Add volunteer
export const addVolunteer = (data) => axios.post(API_URL, data, getRequestConfig());

// Update volunteer
export const updateVolunteer = (id, data) =>
  axios.put(`${API_URL}/${id}`, data, getRequestConfig());

// Delete volunteer
export const deleteVolunteer = (id) =>
  axios.delete(`${API_URL}/${id}`, getRequestConfig());
