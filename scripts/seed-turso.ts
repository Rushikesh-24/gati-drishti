import { createClient } from "@libsql/client";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment variables.");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function initDb() {
  console.log("Dropping existing tables if they exist...");
  
  await db.execute("DROP TABLE IF EXISTS train_schedules;");
  await db.execute("DROP TABLE IF EXISTS train_delay_aggregates;");
  await db.execute("DROP TABLE IF EXISTS station_names;");
  await db.execute("DROP TABLE IF EXISTS train_details;");
  
  console.log("Creating train_schedules table...");
  await db.execute(`
    CREATE TABLE train_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_no INTEGER,
      station_name TEXT,
      distance_from_origin INTEGER,
      arrival_day INTEGER,
      arrival_time TEXT,
      departure_day INTEGER,
      departure_time TEXT,
      train_no TEXT
    );
  `);

  console.log("Creating station_names table...");
  await db.execute(`
    CREATE TABLE station_names (
      station_name TEXT PRIMARY KEY,
      station_full_name TEXT,
      station_zone TEXT,
      station_address TEXT
    );
  `);

  console.log("Creating train_details table...");
  await db.execute(`
    CREATE TABLE train_details (
      train_no TEXT PRIMARY KEY,
      train_name TEXT,
      type_code TEXT
    );
  `);

  console.log("Creating train_delay_aggregates table...");
  await db.execute(`
    CREATE TABLE train_delay_aggregates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_no TEXT,
      station_name TEXT,
      avg_delay INTEGER
    );
  `);
}

async function seedSchedules() {
  const filePath = path.join(process.cwd(), "data_imports", "train_schedules.csv");
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping train_schedules: File not found`);
    return;
  }

  console.log("Parsing train_schedules.csv...");
  const records = [];
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

  for await (const record of parser) {
    records.push({
      station_no: parseInt(record.station_no, 10),
      station_name: record.station_name,
      distance_from_origin: parseInt(record.distance_from_origin, 10),
      arrival_day: parseInt(record.arrival_day, 10),
      arrival_time: record.arrival_time,
      departure_day: parseInt(record.departure_day, 10),
      departure_time: record.departure_time,
      train_no: record.train_no
    });
  }

  console.log(`Found ${records.length} schedule records. Inserting...`);
  const CHUNK_SIZE = 500;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const statements = chunk.map(row => ({
      sql: `INSERT INTO train_schedules (station_no, station_name, distance_from_origin, arrival_day, arrival_time, departure_day, departure_time, train_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [row.station_no, row.station_name, row.distance_from_origin, row.arrival_day, row.arrival_time, row.departure_day, row.departure_time, row.train_no]
    }));
    await db.batch(statements, "write");
  }
}

async function seedStationNames() {
  const filePath = path.join(process.cwd(), "data_imports", "station_full_names.csv");
  if (!fs.existsSync(filePath)) return;

  console.log("Parsing station_full_names.csv...");
  const records = [];
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));
  for await (const record of parser) {
    records.push(record);
  }

  const CHUNK_SIZE = 500;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const statements = chunk.map((row: any) => ({
      sql: `INSERT OR IGNORE INTO station_names (station_name, station_full_name, station_zone, station_address) VALUES (?, ?, ?, ?)`,
      args: [row.station_name, row.station_full_name, row.station_zone, row.station_address]
    }));
    await db.batch(statements, "write");
  }
  console.log("Finished station names!");
}

async function seedTrainDetails() {
  const filePath = path.join(process.cwd(), "data_imports", "train_details.csv");
  if (!fs.existsSync(filePath)) return;

  console.log("Parsing train_details.csv...");
  const records = [];
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));
  for await (const record of parser) {
    records.push(record);
  }

  const CHUNK_SIZE = 500;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const statements = chunk.map((row: any) => ({
      sql: `INSERT OR IGNORE INTO train_details (train_no, train_name, type_code) VALUES (?, ?, ?)`,
      args: [row.train_no, row.train_name, row.type_code]
    }));
    await db.batch(statements, "write");
  }
  console.log("Finished train details!");
}

async function seedDelays() {
  const filePath = path.join(process.cwd(), "data_imports", "train_delays.csv");
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping train_delays: File not found`);
    return;
  }

  console.log("Streaming and aggregating 38M records from train_delays.csv locally. This may take a few minutes...");
  
  const aggregates = new Map<string, { sum: number, count: number }>();
  let rowCount = 0;

  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

  for await (const record of parser) {
    rowCount++;
    if (rowCount % 1000000 === 0) {
      process.stdout.write(`\rProcessed ${rowCount} rows...`);
    }

    const delayStr = record.delay;
    if (!delayStr) continue; // Skip empty NaNs

    const delayNum = parseInt(delayStr, 10);
    if (isNaN(delayNum)) continue;

    const key = `${record.train_no}:::${record.station_name}`;
    const existing = aggregates.get(key) || { sum: 0, count: 0 };
    
    existing.sum += delayNum;
    existing.count += 1;
    aggregates.set(key, existing);
  }

  console.log(`\nAggregated ${rowCount} raw records into ${aggregates.size} unique train/station combinations.`);
  console.log("Beginning batch insert of aggregates into Turso...");

  const aggregatedRecords = Array.from(aggregates.entries()).map(([key, data]) => {
    const [train_no, station_name] = key.split(":::");
    return {
      train_no,
      station_name,
      avg_delay: Math.round(data.sum / data.count)
    };
  });

  const CHUNK_SIZE = 500;
  for (let i = 0; i < aggregatedRecords.length; i += CHUNK_SIZE) {
    const chunk = aggregatedRecords.slice(i, i + CHUNK_SIZE);
    const statements = chunk.map(row => ({
      sql: `INSERT INTO train_delay_aggregates (train_no, station_name, avg_delay) VALUES (?, ?, ?)`,
      args: [row.train_no, row.station_name, row.avg_delay]
    }));
    await db.batch(statements, "write");
    
    if (i % 10000 === 0) {
      process.stdout.write(`\rInserted ${Math.min(i + CHUNK_SIZE, aggregatedRecords.length)} / ${aggregatedRecords.length} aggregates`);
    }
  }
  console.log("\nFinished seeding delays!");
}

async function main() {
  try {
    await initDb();
    await seedStationNames();
    await seedTrainDetails();
    // We can skip schedules if they are already pushed, or push again since we drop tables.
    await seedSchedules();
    await seedDelays();
    console.log("Database seeding completed successfully.");
  } catch (err) {
    console.error("\nError during seeding:", err);
  } finally {
    process.exit(0);
  }
}

main();
