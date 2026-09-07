import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Top 5 bottleneck stations across the network based on average historical delay.
    // We aggregate by station_name across all trains to find worst offenders.
    const result = await db.execute(`
      SELECT 
        tda.station_name as code, 
        sn.station_full_name as name,
        ROUND(AVG(tda.avg_delay), 1) as overall_avg_delay,
        COUNT(tda.train_no) as affected_trains
      FROM train_delay_aggregates tda
      LEFT JOIN station_names sn ON tda.station_name = sn.station_name
      GROUP BY tda.station_name
      HAVING affected_trains > 10
      ORDER BY overall_avg_delay DESC
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      data: result.rows.map(row => ({
        code: row.code,
        name: row.name || row.code,
        avg_delay: Number(row.overall_avg_delay),
        affected_trains: Number(row.affected_trains)
      }))
    });

  } catch (err: any) {
    console.error('Error fetching bottlenecks:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
