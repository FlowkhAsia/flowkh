import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  const resourcePath = Array.isArray(path) ? path.join('/') : path;
  
  const tmdbApiBase = 'https://api.themoviedb.org/3';
  const apiKeyV3 = process.env.TMDB_API_KEY_V3;

  if (!apiKeyV3) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }

  const tmdbUrl = new URL(`${tmdbApiBase}/${resourcePath}`);
  
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') {
      const value = req.query[key];
      if (Array.isArray(value)) {
        value.forEach(v => tmdbUrl.searchParams.append(key, v));
      } else if (value) {
        tmdbUrl.searchParams.append(key, value);
      }
    }
  });
  
  tmdbUrl.searchParams.append('api_key', apiKeyV3);

  try {
    const tmdbResponse = await fetch(tmdbUrl.toString(), {
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!tmdbResponse.ok) {
        const errorData = await tmdbResponse.json();
        return res.status(tmdbResponse.status).json(errorData);
    }
    
    const data = await tmdbResponse.json();
    
    // Cache successful responses for 1 hour on the edge
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
}