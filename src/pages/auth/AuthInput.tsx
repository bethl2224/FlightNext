import * as React from "react";

interface AuthInputProps {
  name?: string;
  placeholder: string;
  value?: string;
  type: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthInput: React.FC<AuthInputProps> = ({
  name,
  placeholder,
  type,
  className = "",
  value,
  onChange,
}) => {
  return (
    <div className={className}>
      <div className="overflow-hidden flex-1 shrink gap-2 w-full bg-white rounded border border-solid basis-0 border-[color:var(--Grey-300,#A1B0CC)] max-md:max-w-full">
        <input
          name={name} // Bind the name prop
          type={type}
          placeholder={placeholder}
          value={value} // Bind the value prop
          onChange={onChange} // Bind the onChange handler
          className="w-full px-3 py-2 text-slate-400 placeholder-slate-400 text-center focus:outline-none"
        />
      </div>
    </div>
  );
};

export default AuthInput;
