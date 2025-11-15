
import type { Movie } from './types';

export const mockMovies: Movie[] = [
  {
    id: 1,
    media_type: 'movie',
    title: "Cosmic Odyssey",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterUrl: "https://picsum.photos/id/101/500/750",
    backdropUrl: "https://picsum.photos/id/10/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2024",
    rating: 8.8,
    genres: ["Sci-Fi", "Adventure", "Drama"]
  },
  {
    id: 2,
    media_type: 'movie',
    title: "Midnight Heist",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "A master thief is coaxed out of retirement for one last job, but a tenacious detective is hot on her trail.",
    posterUrl: "https://picsum.photos/id/21/500/750",
    backdropUrl: "https://picsum.photos/id/20/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2023",
    rating: 8.2,
    genres: ["Crime", "Thriller", "Action"]
  },
  {
    id: 3,
    media_type: 'movie',
    title: "Echoes of the Past",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "A historian discovers a mysterious artifact that allows her to witness historical events firsthand, uncovering a conspiracy that spans centuries.",
    posterUrl: "https://picsum.photos/id/31/500/750",
    backdropUrl: "https://picsum.photos/id/30/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2022",
    rating: 7.9,
    genres: ["Mystery", "Sci-Fi", "Thriller"]
  },
  {
    id: 4,
    media_type: 'movie',
    title: "The Last Stand",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "In a post-apocalyptic world, a small community must defend their stronghold against a ruthless horde.",
    posterUrl: "https://picsum.photos/id/41/500/750",
    backdropUrl: "https://picsum.photos/id/40/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2024",
    rating: 8.5,
    genres: ["Action", "Post-Apocalyptic", "Survival"]
  },
  {
    id: 5,
    media_type: 'movie',
    title: "City of Dreams",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "A young musician moves to the big city with dreams of stardom, but finds that the path to success is paved with unexpected challenges and sacrifices.",
    posterUrl: "https://picsum.photos/id/51/500/750",
    backdropUrl: "https://picsum.photos/id/50/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2021",
    rating: 7.5,
    genres: ["Drama", "Music", "Romance"]
  },
  {
    id: 6,
    media_type: 'movie',
    title: "Jungle Quest",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "An adventurer and a botanist venture deep into the Amazon rainforest in search of a mythical plant with healing powers.",
    posterUrl: "https://picsum.photos/id/61/500/750",
    backdropUrl: "https://picsum.photos/id/60/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2023",
    rating: 6.9,
    genres: ["Adventure", "Action", "Comedy"]
  },
  {
    id: 7,
    media_type: 'movie',
    title: "The Inventor",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "A brilliant but eccentric inventor creates a machine that can change the weather, but it falls into the wrong hands.",
    posterUrl: "https://picsum.photos/id/71/500/750",
    backdropUrl: "https://picsum.photos/id/70/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2020",
    rating: 6.5,
    genres: ["Family", "Sci-Fi", "Comedy"]
  },
  {
    id: 8,
    media_type: 'movie',
    title: "Cybernetic Revolution",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "In a futuristic city, a detective who is part human, part machine, uncovers a plot that threatens the balance between humans and AI.",
    posterUrl: "https://picsum.photos/id/81/500/750",
    backdropUrl: "https://picsum.photos/id/80/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2025",
    rating: 9.1,
    genres: ["Sci-Fi", "Cyberpunk", "Action"]
  },
  {
    id: 9,
    media_type: 'movie',
    title: "Beneath the Waves",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "A marine biologist makes a groundbreaking discovery in the Mariana Trench, but her team awakens a creature that should have remained dormant.",
    posterUrl: "https://picsum.photos/id/91/500/750",
    backdropUrl: "https://picsum.photos/id/90/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2022",
    rating: 7.7,
    genres: ["Horror", "Sci-Fi", "Thriller"]
  },
  {
    id: 10,
    media_type: 'movie',
    title: "The King's Gambit",
    // FIX: Replaced 'overview' with 'description' to match the Movie type.
    description: "A tale of political intrigue, betrayal, and war in a medieval kingdom, as a young queen fights to protect her throne from usurpers.",
    posterUrl: "https://picsum.photos/id/102/500/750",
    backdropUrl: "https://picsum.photos/id/103/1280/720",
    // FIX: Replaced 'year' with 'releaseYear' and converted to string. Added 'rating'.
    releaseYear: "2023",
    rating: 8.9,
    genres: ["Fantasy", "Drama", "War"]
  },
];

export const contentCategories = [
    { title: "Trending Now", movies: [...mockMovies].sort(() => 0.5 - Math.random()) },
    // FIX: Updated sorting logic to use 'releaseYear' property.
    { title: "New Releases", movies: [...mockMovies].sort((a, b) => Number(b.releaseYear) - Number(a.releaseYear)) },
    { title: "Sci-Fi Hits", movies: mockMovies.filter(m => m.genres.includes("Sci-Fi")) },
    { title: "Action & Adventure", movies: mockMovies.filter(m => m.genres.includes("Action")) },
    { title: "Critically Acclaimed", movies: [...mockMovies].sort(() => 0.5 - Math.random()) },
];
