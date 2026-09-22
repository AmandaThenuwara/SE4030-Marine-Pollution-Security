import { useState, useEffect } from "react";

const VolunteerForm = ({ onSubmit, volunteer, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    team: "",
    photo: ""
  });

  // Populate form when editing
  useEffect(() => {
    if (volunteer) {
      setFormData({
        name: volunteer.name || "",
        email: volunteer.email || "",
        phone: volunteer.phone || "",
        description: volunteer.description || "",
        team: volunteer.team || "",
        photo: volunteer.photo || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        description: "",
        team: "",
        photo: ""
      });
    }
  }, [volunteer]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      description: "",
      team: "",
      photo: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-800 p-6 rounded-lg shadow-md max-w-lg mx-auto"
    >
      <h2 className="text-xl font-bold text-white mb-4">
        {volunteer ? "Edit Volunteer" : "Add Volunteer"}
      </h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded"
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded"
      />
      <input
        type="text"
        name="team"
        placeholder="Team (optional)"
        value={formData.team}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded"
      />
      <input
        type="text"
        name="photo"
        placeholder="Photo URL"
        value={formData.photo}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded"
      />

      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {volunteer ? "Update" : "Add"}
        </button>
        {volunteer && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default VolunteerForm;