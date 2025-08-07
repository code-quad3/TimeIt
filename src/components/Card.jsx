
const ProfileCard = ({ img, name, time }) => {
  return (
    // The main card container, styled with Tailwind classes.
    // bg-white, shadow-md, rounded corners, padding, and centered text.
    <div className="bg-white p-6 rounded-2xl shadow-md text-center max-w-xs mx-auto font-sans flex flex-col items-center">
      
      {/* Container for the profile image with a fixed size and rounded shape. */}
      {/* The image itself is set to fill this container. */}
      <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
        <img 
          src={img} 
          alt="Profile" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* The name display, styled with a larger font and heavier weight. */}
      <div className="text-xl font-semibold mb-2 text-gray-800">{name}</div>
      
      {/* The time display, styled to be slightly smaller and a muted color. */}
      <div className="text-base font-bold text-gray-600">{time}</div>
    </div>
  );
};

export default ProfileCard;