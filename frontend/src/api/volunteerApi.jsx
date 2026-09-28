import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/volunteers`;

// Get all volunteers
const requestConfig = { withCredentials: true };

export const getVolunteers = () => axios.get(API_URL, requestConfig);

// Add volunteer
export const addVolunteer = (data) => axios.post(API_URL, data, requestConfig);

// Update volunteer
export const updateVolunteer = (id, data) =>
  axios.put(`${API_URL}/${id}`, data, requestConfig);

// Delete volunteer
export const deleteVolunteer = (id) =>
  axios.delete(`${API_URL}/${id}`, requestConfig);
