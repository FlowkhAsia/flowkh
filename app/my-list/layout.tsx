import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My List',
  description: 'Your saved movies and TV shows on Flowkh.',
};

export default function MyListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
