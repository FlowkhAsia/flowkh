type PagesFunction = (context: {
  request: Request;
  params: { path: string | string[] };
  env: { [key: string]: any; };
  [key: string]: any;
}) => Promise<Response>;

// This function will handle all requests to /tmdb/*
export const onRequest: PagesFunction = async (context) => {
  // Get the original request from the client
  const request = context.request;

  // The base URL for the real TMDB API
  const tmdbApiBase = 'https://api.themoviedb.org/3';

  // Get the TMDB API key from Cloudflare's environment variables.
  const apiKeyV3 = context.env.TMDB_API_KEY_V3;

  if (!apiKeyV3) {
    return new Response('TMDB_API_KEY_V3 environment variable not configured', { status: 500 });
  }

  // Create a URL object from the incoming request to access its search parameters.
  const url = new URL(request.url);

  // The resource path is everything after `/tmdb/`.
  // e.g., for /tmdb/trending/tv/week, path is ['trending', 'tv', 'week']
  const path = context.params.path as string[];
  const resourcePath = path.join('/');

  // Construct the URL to the TMDB API
  const tmdbUrl = new URL(`${tmdbApiBase}/${resourcePath}`);

  // Forward the original search parameters from the client request
  url.searchParams.forEach((value, key) => {
    tmdbUrl.searchParams.append(key, value);
  });

  // Append the v3 API key to the search parameters
  tmdbUrl.searchParams.append('api_key', apiKeyV3);

  // Fetch the data from the TMDB API. No Authorization header is needed.
  const response = await fetch(tmdbUrl.toString(), {
    headers: {
      'Accept': 'application/json'
    },
  });

  // Create a new response to return to the client, adding CORS headers
  // to allow the browser to read the response.
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });

  return newResponse;
};