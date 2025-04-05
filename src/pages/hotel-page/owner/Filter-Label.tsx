import { apiURl, fetchAllRoomType } from "@/utils/hotel-query";
import { Hotel } from "@pages/hotel-page/visitor/HotelListings";
interface DropdownProps {
  options: string[];

  checkInDate: string;
  checkOutDate: string;
  onSelect: (value: string) => void;
  onSetHotel: (value: Hotel[]) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  onSetHotel,
  checkInDate,
  checkOutDate,
}) => {
  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(event.target.value);
    const roomTy = event.target.value;
    if (roomTy === "All") {
      const res = await fetchAllRoomType();

      console.log("RES", res);

      if (res) {
        onSetHotel(res[0]);
      }
      return null;
    }

    const params = new URLSearchParams({
      roomType: roomTy,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
    });
    const res = await fetch(`${apiURl}/hotel/owner/filter-roomtype?${params}`);

    if (res.ok) {
      const data = await res.json();
      onSetHotel(data);
    }
  };
  return (
    <div>
      <label>
        <select
          onChange={handleChange}
          defaultValue=""
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="" disabled>
            Select an option
          </option>
          {options &&
            options.map((option, index) => (
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
