import { fetchDetailPageData } from "../../../../../../services/geminiService";
import DetailPageWrapper from "../../../../../../components/DetailPageWrapper";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string; season: string; episode: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return { title: 'Not Found' };

    const { details } = await fetchDetailPageData(id, 'tv');
    return {
      title: `${details.title} - S${params.season} E${params.episode}`,
      description: details.description,
    };
  } catch (error) {
    return {
      title: 'Error',
      description: 'Could not load TV episode details.'
    }
  }
}

export default async function TvEpisodePage({ params }: Props) {
  const id = parseInt(params.id, 10);
  const season = parseInt(params.season, 10);
  const episode = parseInt(params.episode, 10);

  if (isNaN(id) || isNaN(season) || isNaN(episode)) {
    return notFound();
  }

  try {
    const { details, cast, similar } = await fetchDetailPageData(id, 'tv');

    return (
        <DetailPageWrapper
            initialDetails={details}
            initialCast={cast}
            initialSimilar={similar}
            mediaType="tv"
            autoPlay={true}
            initialSeasonNumber={season}
            initialEpisodeNumber={episode}
        />
    );
  } catch (error) {
      notFound();
  }
}