import { NextResponse } from 'next/server';
import { getStationByCode } from '@/lib/api/stations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const code = id;
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Station code is required' },
        { status: 400 }
      );
    }

    const station = getStationByCode(code);

    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error('Error in station details API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get station details' },
      { status: 500 }
    );
  }
}
