import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://dashboard.fal.ai/api/credits', {
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { computeCost } = await request.json();
    // You could store credit usage in a database here
    return NextResponse.json({ credits: computeCost });
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
  }
}