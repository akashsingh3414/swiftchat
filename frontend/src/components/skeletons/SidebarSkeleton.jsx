import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(11).fill(null);

  return (
    <aside className="h-full border-r border-base-300 flex flex-col items-center w-16 lg:w-64 transition-all duration-200">
      <div className="w-full py-3 space-y-4">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="flex items-center w-full gap-3 px-2">
            <div className="skeleton size-12 rounded-full mx-auto lg:mx-0" />

            <div className="hidden lg:flex flex-col gap-2 flex-1">
              <div className="skeleton h-4 w-full max-w-[120px]" />
              <div className="skeleton h-3 w-full max-w-[80px]" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
