import { fetchDetailPageData } from "../../../../services/geminiService";
import DetailPageWrapper from "../../../../components/DetailPageWrapper";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string, season?: string, episode?: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return { title: 'Not Found' };
    
    const { details } = await fetchDetailPageData(id, 'tv');
    return {
      title: details.title,
      description: details.description,
    };
  } catch (error) {
     return {
        title: 'Error',
        description: 'Could not load TV show details.'
    }
  }
}

export default async function TvDetailsPage({ params, searchParams }: Props) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return notFound();
  }

  try {
    const { details, cast, similar } = await fetchDetailPageData(id, 'tv');
  
    const initialSeasonNumber = params.season ? parseInt(params.season, 10) : undefined;
    const initialEpisodeNumber = params.episode ? parseInt(params.episode, 10) : undefined;
    const autoPlay = searchParams?.autoplay === 'true' || !!(initialSeasonNumber && initialEpisodeNumber);
    
    return (
      <DetailPageWrapper
        initialDetails={details}
        initialCast={cast}
        initialSimilar={similar}
        mediaType="tv"
        autoPlay={autoPlay}
        initialSeasonNumber={initialSeasonNumber}
        initialEpisodeNumber={initialEpisodeNumber}
      />
    );
  } catch (error) {
    notFound();
  }
}