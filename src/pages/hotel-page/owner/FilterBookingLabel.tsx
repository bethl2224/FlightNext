import { RoomTypeBooking } from "./Bookings";

interface DropdownProps {
  options: string[];
  checkInDate: string;
  checkOutDate: string;
  singleRoomType: string;
  onSelect: (value: string) => void;

  onSetRoomTypeBooking: (value: RoomTypeBooking) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  singleRoomType,
}) => {
  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(event.target.value);
  };

  return (
    <div className="relative">
      <label>
        <select
          value={singleRoomType}
          onChange={handleChange}
          className="px-4 py-2 h-15 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="" disabled>
            Select an option
          </option>
          {options &&
            options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
};

export default Dropdown;
