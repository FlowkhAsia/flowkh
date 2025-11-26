import type { Movie } from './types';

export const mockMovies: Movie[] = [
  {
    id: 1,
    media_type: 'movie',
    title: "Cosmic Odyssey",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterUrl: "https://picsum.photos/id/101/500/750",
    backdropUrl: "https://picsum.photos/id/10/1280/720",
    releaseYear: "2024",
    rating: 8.8,
    genres: ["Sci-Fi", "Adventure", "Drama"]
  },
  {
    id: 2,
    media_type: 'movie',
    title: "Midnight Heist",
    description: "A master thief is coaxed out of retirement for one last job, but a tenacious detective is hot on her trail.",
    posterUrl: "https://picsum.photos/id/21/500/750",
    backdropUrl: "https://picsum.photos/id/20/1280/720",
    releaseYear: "2023",
    rating: 8.2,
    genres: ["Crime", "Thriller", "Action"]
  },
];