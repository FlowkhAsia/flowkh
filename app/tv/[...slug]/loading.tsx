import { Icons } from '@/components/ui/icons';

export default function Loading() {
  return (
    <div className="relative w-full min-h-screen bg-zinc-950 pb-20 animate-pulse">
      {/* Hero Banner Backdrop Skeleton */}
      <div className="relative h-[70vh] md:h-[80vh] w-full bg-zinc-900">
         <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent z-0" />
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-0" />
         
         <div className="absolute bottom-12 left-4 md:left-16 z-20 w-full max-w-2xl space-y-4">
            <div className="w-48 md:w-80 h-16 md:h-24 bg-zinc-800 rounded-lg mb-4"></div>
            
            <div className="flex items-center gap-3 mb-4">
               <div className="w-32 h-4 bg-zinc-800 rounded"></div>
               <div className="w-16 h-4 bg-zinc-800 rounded"></div>
            </div>
            
            <div className="space-y-2 mb-8">
               <div className="w-full h-4 bg-zinc-800 rounded"></div>
               <div className="w-5/6 h-4 bg-zinc-800 rounded"></div>
               <div className="w-4/6 h-4 bg-zinc-800 rounded"></div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <div className="w-28 h-12 bg-white/20 rounded-full"></div>
              <div className="w-12 h-12 bg-zinc-800 rounded-full"></div>
            </div>
         </div>
      </div>
      
      {/* Lower Section Skeleton */}
      <div className="w-full px-4 md:px-16 py-8 space-y-12 mt-4">
         <div className="max-w-screen-xl mx-auto space-y-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                 <div className="w-32 h-6 bg-zinc-800 rounded"></div>
              </div>
              <div className="flex overflow-hidden gap-4 pb-4">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="w-[120px] md:w-[140px] shrink-0 flex flex-col gap-2">
                      <div className="aspect-[2/3] w-full rounded-xl bg-zinc-900 border border-zinc-800/50"></div>
                      <div className="space-y-1">
                         <div className="w-full h-3 bg-zinc-800 rounded"></div>
                         <div className="w-2/3 h-2 bg-zinc-800 rounded"></div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
