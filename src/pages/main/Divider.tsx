"use client";

import * as React from "react";

const Divider: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2.5 justify-center items-center py-2 w-full whitespace-nowrap text-slate-400">
      <div className="flex flex-1 shrink self-stretch my-auto h-px basis-0 bg-slate-300 w-[226px]" />
      <span className="self-stretch my-auto">or</span>
      <div className="flex flex-1 shrink self-stretch my-auto h-px basis-0 bg-slate-300 w-[225px]" />
    </div>
  );
};

export default Divider;
