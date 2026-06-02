export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="w-full h-[70vh] bg-neutral-900 animate-pulse relative">
         <div className="absolute bottom-16 left-4 md:left-8 w-3/4 md:w-1/2">
            <div className="h-12 bg-neutral-800 rounded-md w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-800 rounded-md w-full mb-2"></div>
            <div className="h-4 bg-neutral-800 rounded-md w-5/6 mb-8"></div>
            <div className="flex gap-4">
              <div className="w-32 h-12 bg-neutral-800 rounded-full"></div>
              <div className="w-32 h-12 bg-neutral-800 rounded-full"></div>
            </div>
         </div>
      </div>
      <div className="-mt-20 z-10 px-4 md:px-8 space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section}>
             <div className="h-8 w-48 bg-neutral-800 rounded-md mb-4 animate-pulse"></div>
             <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((card) => (
                   <div key={card} className="w-[140px] sm:w-[160px] md:w-[200px] flex-none">
                      <div className="aspect-[2/3] bg-neutral-900 rounded-xl animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-neutral-900 rounded-md mt-2 animate-pulse"></div>
                   </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
