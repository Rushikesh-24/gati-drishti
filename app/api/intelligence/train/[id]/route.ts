import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trainNo } = await params;
    if (!trainNo) {
      return NextResponse.json({ success: false, error: 'Train number required' }, { status: 400 });
    }

    // 1. Get Train Details
    const trainResult = await db.execute({
      sql: 'SELECT * FROM train_details WHERE train_no = ?',
      args: [trainNo]
    });
    
    if (trainResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Train not found' }, { status: 404 });
    }
    const trainInfo = trainResult.rows[0];

    // 2. Get Schedule joined with Delay Aggregates and Station Names
    const scheduleResult = await db.execute({
      sql: `
        SELECT 
          ts.station_no,
          ts.station_name as code,
          ts.distance_from_origin,
          ts.arrival_day,
          ts.arrival_time,
          ts.departure_day,
          ts.departure_time,
          sn.station_full_name as name,
          sn.station_zone as zone,
          tda.avg_delay
        FROM train_schedules ts
        LEFT JOIN station_names sn ON ts.station_name = sn.station_name
        LEFT JOIN train_delay_aggregates tda ON ts.train_no = tda.train_no AND ts.station_name = tda.station_name
        WHERE ts.train_no = ?
        ORDER BY ts.station_no ASC
      `,
      args: [trainNo]
    });

    return NextResponse.json({
      success: true,
      data: {
        train: {
          train_no: trainInfo.train_no,
          train_name: trainInfo.train_name,
          type_code: trainInfo.type_code
        },
        route: scheduleResult.rows.map(row => ({
          station_no: row.station_no,
          code: row.code,
          name: row.name || row.code,
          zone: row.zone || '',
          distance: row.distance_from_origin,
          arrival_day: row.arrival_day,
          arrival_time: row.arrival_time,
          departure_day: row.departure_day,
          departure_time: row.departure_time,
          avg_delay: row.avg_delay !== null ? Number(row.avg_delay) : null
        }))
      }
    });

  } catch (err: any) {
    console.error('Error fetching intelligence train data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
