import { NextResponse } from 'next/server';
import { searchStations } from '@/lib/api/stations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit');
    
    let limit = 20;
    if (limitParam && !isNaN(parseInt(limitParam, 10))) {
      limit = parseInt(limitParam, 10);
    }

    const results = searchStations(query, limit);

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in stations search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search stations' },
      { status: 500 }
    );
  }
}
