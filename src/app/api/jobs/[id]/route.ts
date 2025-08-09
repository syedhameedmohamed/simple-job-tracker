import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

// Create the sql function from neon
const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const jobId = parseInt(id);

    // If only status is being updated
    if (Object.keys(body).length === 1 && body.status) {
      const rows = await sql`
        UPDATE jobs 
        SET status = ${body.status}
        WHERE id = ${jobId}
        RETURNING *
      `;

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
    }

    // Full update
    const { company, position, link, status, notes } = body;
    
    if (!company || !position) {
      return NextResponse.json(
        { error: 'Company and position are required' }, 
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE jobs 
      SET company = ${company}, position = ${position}, link = ${link || ''}, 
          status = ${status}, notes = ${notes || ''}
      WHERE id = ${jobId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const jobId = parseInt(id);

    const rows = await sql`
      DELETE FROM jobs 
      WHERE id = ${jobId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}