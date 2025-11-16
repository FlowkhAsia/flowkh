import { fetchDetailPageData } from "../../../../services/geminiService";
import DetailPageWrapper from "../../../../components/DetailPageWrapper";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return { title: 'Not Found' };
    
    const { details } = await fetchDetailPageData(id, 'movie');
    return {
      title: details.title,
      description: details.description,
    };
  } catch (error) {
    return {
        title: 'Error',
        description: 'Could not load movie details.'
    }
  }
}

export default async function MovieDetailsPage({ params, searchParams }: Props) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return notFound();
  }

  try {
    const { details, cast, similar } = await fetchDetailPageData(id, 'movie');
    const autoPlay = searchParams?.autoplay === 'true';

    return (
      <DetailPageWrapper
        initialDetails={details}
        initialCast={cast}
        initialSimilar={similar}
        mediaType="movie"
        autoPlay={autoPlay}
      />
    );
  } catch (error) {
    notFound();
  }
}