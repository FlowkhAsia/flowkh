import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const { path } = await params;
    const apiPath = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams;
    
    const url = new URL(`${TMDB_BASE_URL}${apiPath}`);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('TMDB Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
