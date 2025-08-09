import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

// Create the sql function from neon
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Note: Neon returns results directly, not wrapped in { rows }
    const rows = await sql`
      SELECT * FROM jobs 
      ORDER BY date_added DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { company, position, link, status, notes } = await request.json();
    
    if (!company || !position) {
      return NextResponse.json(
        { error: 'Company and position are required' }, 
        { status: 400 }
      );
    }

    // Note: Neon returns results directly, not wrapped in { rows }
    const rows = await sql`
      INSERT INTO jobs (company, position, link, status, notes, date_added)
      VALUES (${company}, ${position}, ${link || ''}, ${status}, ${notes || ''}, CURRENT_DATE)
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}