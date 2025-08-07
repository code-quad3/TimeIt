
const BlockedList = ({ name, onUnblock }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleUnblock = () => {
    onUnblock();
    setIsMenuOpen(false); // Close the menu after clicking
  };

  return (
    <li className="flex justify-between items-center px-5 py-3 bg-white rounded-[30px] mb-4 shadow-sm hover:shadow-md transition-shadow relative">
      <span className="text-base font-medium">{name}</span>
      <div className="relative">
        <span
          className="cursor-pointer text-2xl px-2 py-1 rounded-full select-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ⋮
        </span>
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
            <button
              className="block w-full px-4 py-2 text-left text-sm border-b border-gray-200 hover:bg-gray-100"
              onClick={() => {
                /* Implement Block logic here */
                setIsMenuOpen(false);
              }}
            >
              Block
            </button>
            <button
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              onClick={handleUnblock}
            >
              Unblock
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default BlockedList;