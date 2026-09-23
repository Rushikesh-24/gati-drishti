import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch High Risk Fleet (Trains with highest average historical delays)
    // We aggregate delay per train, then join with train_details for names/types
    const fleetResult = await db.execute(`
      WITH TrainStats AS (
        SELECT 
          t.train_no, 
          td.train_name, 
          td.type_code,
          ROUND(AVG(t.avg_delay), 1) as avg_route_delay,
          COUNT(t.station_name) as stations_analysed
        FROM train_delay_aggregates t
        LEFT JOIN train_details td ON t.train_no = td.train_no
        GROUP BY t.train_no
        HAVING stations_analysed > 5
      )
      SELECT * FROM (SELECT * FROM TrainStats WHERE avg_route_delay > 120 ORDER BY RANDOM() LIMIT 20)
      UNION ALL
      SELECT * FROM (SELECT * FROM TrainStats WHERE avg_route_delay > 60 AND avg_route_delay <= 120 ORDER BY RANDOM() LIMIT 20)
      UNION ALL
      SELECT * FROM (SELECT * FROM TrainStats WHERE avg_route_delay > 15 AND avg_route_delay <= 60 ORDER BY RANDOM() LIMIT 30)
      UNION ALL
      SELECT * FROM (SELECT * FROM TrainStats WHERE avg_route_delay <= 15 ORDER BY RANDOM() LIMIT 30)
    `);

    // 2. Fetch Network Bottlenecks (Stations with highest average historical delays)
    // We aggregate delay per station, joining with station_names
    const bottleneckResult = await db.execute(`
      SELECT 
        t.station_name as code, 
        sn.station_full_name as name,
        sn.station_zone as zone,
        ROUND(AVG(t.avg_delay), 1) as overall_avg_delay,
        COUNT(t.train_no) as affected_trains
      FROM train_delay_aggregates t
      LEFT JOIN station_names sn ON t.station_name = sn.station_name
      GROUP BY t.station_name
      HAVING affected_trains > 20
      ORDER BY overall_avg_delay DESC
      LIMIT 10
    `);

    // Format Fleet Response
    const fleet = fleetResult.rows.map(row => ({
      train_no: row.train_no,
      name: row.train_name || 'Unknown Express',
      type: row.type_code || 'EXP',
      avg_delay: Number(row.avg_route_delay),
      stations_analysed: Number(row.stations_analysed)
    }));

    // Format Bottleneck Response
    const bottlenecks = bottleneckResult.rows.map(row => ({
      code: row.code,
      name: row.name || row.code,
      zone: row.zone || 'Unknown',
      avg_delay: Number(row.overall_avg_delay),
      affected_trains: Number(row.affected_trains)
    }));

    return NextResponse.json({
      success: true,
      data: {
        fleet,
        bottlenecks
      }
    });

  } catch (err: any) {
    console.error('Error fetching control room data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
