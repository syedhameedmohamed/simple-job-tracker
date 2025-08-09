import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`
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

    const { rows } = await sql`
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