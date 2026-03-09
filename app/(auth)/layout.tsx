import { Toaster } from "react-hot-toast";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center w-full items-center bg-slate-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false}/>
      {children}

    </div>
  );
};

export default layout;
