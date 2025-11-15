import React, { useState, useEffect } from 'react';
// This would be a component for a full movie detail page, using a route parameter for the movie ID.
// For example: /movie/:id
// Since the current app uses a modal, this is a placeholder for that functionality.
import { getDetails } from '../services/tmdb';
import { MovieDetail } from '../types';
import DetailPage from './DetailPage';

interface MovieDetailPageProps {
  movieId: number;
}

const MovieDetailPage: React.FC<MovieDetailPageProps> = ({ movieId }) => {
  const [details, setDetails] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
        try {
            const data = await getDetails('movie', movieId);
            setDetails(data);
        } catch (error) {
            console.error("Failed to fetch movie details", error);
        } finally {
            setLoading(false);
        }
    };
    fetchMovieDetails();
  }, [movieId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!details) {
    return <div>Details not found.</div>;
  }

  return (
    // FIX: Corrected props passed to DetailPage. It expects 'movieId' and 'mediaType', not a 'movie' object.
    // Also removed non-existent props like 'onBack' and 'onPlayMovie'.
    <DetailPage
      movieId={movieId}
      mediaType={'movie'}
      onSelectMovie={() => {}}
      myList={[]}
      onToggleMyList={() => {}}
      onSelectActor={() => {}}
    />
  );
};

export default MovieDetailPage;