import { Icons } from '@/components/ui/icons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <Icons.spinner className="w-8 h-8 text-white animate-spin" />
    </div>
  );
}
