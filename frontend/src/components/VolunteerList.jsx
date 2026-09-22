import VolunteerCard from "./VolunteerCard";

const VolunteerList = ({ volunteers, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {volunteers.map(vol => (
        <VolunteerCard key={vol._id} volunteer={vol} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default VolunteerList;