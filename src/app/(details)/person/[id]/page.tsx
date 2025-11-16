import React from 'react';
import { fetchActorCredits } from '../../../../services/geminiService';
import ActorCreditsPageContent from '../../../../components/ActorCreditsPageContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return { title: 'Not Found' };

    const { actor } = await fetchActorCredits(id);
    return {
      title: actor.name,
      description: actor.biography ? actor.biography.substring(0, 160) + '...' : `Credits and biography for ${actor.name}.`,
    };
  } catch (error) {
     return {
        title: 'Error',
        description: 'Could not load actor details.'
    }
  }
}

export default async function ActorCreditsPage({ params }: Props) {
  const actorId = parseInt(params.id, 10);
  if (isNaN(actorId)) {
    return notFound();
  }

  try {
    const { actor, credits, backdropUrl } = await fetchActorCredits(actorId);

    return (
      <ActorCreditsPageContent
        actor={actor}
        credits={credits}
        backdropUrl={backdropUrl}
      />
    );
  } catch (error) {
    notFound();
  }
}