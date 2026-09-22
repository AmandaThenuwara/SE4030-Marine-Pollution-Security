import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/volunteers`;

// Get all volunteers
export const getVolunteers = () => axios.get(API_URL);

// Add volunteer
export const addVolunteer = (data) => axios.post(API_URL, data);

// Update volunteer
export const updateVolunteer = (id, data) =>
  axios.put(`${API_URL}/${id}`, data);

// Delete volunteer
export const deleteVolunteer = (id) =>
  axios.delete(`${API_URL}/${id}`);