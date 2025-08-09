import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const id = parseInt(params.id);

    // If only status is being updated
    if (Object.keys(body).length === 1 && body.status) {
      const { rows } = await sql`
        UPDATE jobs 
        SET status = ${body.status}
        WHERE id = ${id}
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

    const { rows } = await sql`
      UPDATE jobs 
      SET company = ${company}, position = ${position}, link = ${link || ''}, 
          status = ${status}, notes = ${notes || ''}
      WHERE id = ${id}
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const { rows } = await sql`
      DELETE FROM jobs 
      WHERE id = ${id}
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