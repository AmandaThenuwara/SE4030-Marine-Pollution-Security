const VolunteerCard = ({ volunteer, onEdit, onDelete }) => {
  return (
    <div className="bg-neutral-800 p-4 rounded-lg shadow-md text-white">
      <h3 className="font-bold text-lg">{volunteer.name}</h3>
      <p>Type: {volunteer.type} {volunteer.type === "team" && `(Team size: ${volunteer.teamSize})`}</p>
      <p>Availability: {volunteer.availability ? new Date(volunteer.availability).toLocaleDateString() : "N/A"}</p>
      <p className="mt-1">{volunteer.description}</p>
      <div className="mt-2 flex gap-2">
        <button onClick={() => onEdit(volunteer)} className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-600">Edit</button>
        <button onClick={() => onDelete(volunteer._id)} className="bg-red-500 px-2 py-1 rounded hover:bg-red-600">Delete</button>
      </div>
    </div>
  );
};

export default VolunteerCard;