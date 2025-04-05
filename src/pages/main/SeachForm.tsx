import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SearchFormProps {
  departureQuery: string;
  setDepartureQuery: React.Dispatch<React.SetStateAction<string>>;
  departureSuggestions: string[];
  setDepartureSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  arrivalQuery: string;
  setArrivalQuery: React.Dispatch<React.SetStateAction<string>>;
  arrivalSuggestions: string[];
  setArrivalSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  tripType: string;
  setTripType: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
}

const SearchForm: React.FC<SearchFormProps> = ({
  departureQuery,
  setDepartureQuery,
  departureSuggestions,
  setDepartureSuggestions,
  arrivalQuery,
  setArrivalQuery,
  arrivalSuggestions,
  setArrivalSuggestions,
  tripType,
  setTripType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!departureQuery || !arrivalQuery || !startDate) {
      alert("Please fill in all required fields.");
      return;
    }

    // Extract the string before the comma if it exists, otherwise use the full string
    const origin = departureQuery.includes(",")
      ? departureQuery.split(",")[0].trim()
      : departureQuery.trim();
    const destination = arrivalQuery.includes(",")
      ? arrivalQuery.split(",")[0].trim()
      : arrivalQuery.trim();

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate ? endDate.toISOString().split("T")[0] : "";

    // Construct the endpoint dynamically
    const endpoint = `${
      process.env.API_URL
    }/api/flights/details?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(
      destination
    )}&date=${formattedStartDate}&flight_type=${encodeURIComponent(
      tripType === "twoway" ? "round_trip" : tripType
    )}${
      tripType === "twoway" && endDate
        ? `&round_trip_date=${formattedEndDate}`
        : ""
    }`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(
          `Error fetching flight details: ${response.statusText}`
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "An unknown error occurred.");
    }
  };

  return (
    <div className="bg-white rounded border border-solid border-slate-300 shadow-[0_2px_4px_rgba(7,4,146,0.1),0_24px_60px_rgba(6,47,125,0.05),0_12px_24px_rgba(27,59,119,0.05)] w-[1200px] max-md:w-[90%]">
      <form className="flex items-center" onSubmit={handleSubmit}>
        {/* Departure City */}
        <div className="flex flex-1 flex-col gap-2 px-3 py-2 relative">
          <i
            className="ti ti-plane-departure text-2xl text-slate-500"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="From where?"
            className="w-full text-lg border-[none] text-slate-400"
            aria-label="Departure city"
            value={departureQuery}
            onChange={(e) => setDepartureQuery(e.target.value)}
          />
          {departureSuggestions && departureSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
              {departureSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setDepartureQuery(suggestion);
                    setDepartureSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-px h-12 bg-slate-300" role="separator" />

        {/* Arrival City */}
        <div className="flex flex-1 flex-col gap-2 px-3 py-2 relative">
          <i
            className="ti ti-plane-arrival text-2xl text-slate-500"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Where to?"
            className="w-full text-lg border-[none] text-slate-400"
            aria-label="Arrival city"
            value={arrivalQuery}
            onChange={(e) => setArrivalQuery(e.target.value)}
          />
          {arrivalSuggestions && arrivalSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
              {arrivalSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setArrivalQuery(suggestion);
                    setArrivalSuggestions([]);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-px h-12 bg-slate-300" role="separator" />

        {/* Travel Dates */}
        <div className="flex flex-1 gap-2 items-center px-3 py-2">
          <i
            className="ti ti-calendar text-2xl text-indigo-500"
            aria-hidden="true"
          />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Select departure date"
            className="w-full text-lg border-[none] text-slate-400"
            aria-label="Departure date"
          />
        </div>

        {tripType === "twoway" && (
          <>
            <div className="w-px h-12 bg-slate-300" role="separator" />

            {/* Return Date */}
            <div className="flex flex-1 gap-2 items-center px-3 py-2">
              <i
                className="ti ti-calendar text-2xl text-indigo-500"
                aria-hidden="true"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="Select return date"
                className="w-full text-lg border-[none] text-slate-400"
                aria-label="Return date"
              />
            </div>
          </>
        )}

        <div className="w-px h-12 bg-slate-300" role="separator" />

        {/* Trip Type Selector */}
        <div className="flex flex-1 gap-2 items-center px-3 py-2">
          <i
            className="ti ti-exchange text-2xl text-slate-500"
            aria-hidden="true"
          />
          <select
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            className="w-full text-lg border-[none] text-slate-400"
            aria-label="Trip type"
          >
            <option value="oneway">One Way</option>
            <option value="twoway">Two Way</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-5 py-3 text-lg bg-indigo-500 rounded cursor-pointer border-[none] text-neutral-50"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
