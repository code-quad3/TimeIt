import './ProfileCard.css';

const ProfileCard = ({ img, name, time }) => {
  return (
    <div className="card">
      <img src={img} alt="Profile" />
      <div className="name">{name}</div>
      <div className="time">{time}</div>
    </div>
  );
};

export default ProfileCard;
