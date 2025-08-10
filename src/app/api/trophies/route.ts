import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM unlocked_trophies 
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching unlocked trophies:', error);
    return NextResponse.json({ error: 'Failed to fetch trophies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { trophy_id, trophy_name, trophy_type } = await request.json();
    
    if (!trophy_id || !trophy_name || !trophy_type) {
      return NextResponse.json(
        { error: 'Trophy ID, name, and type are required' }, 
        { status: 400 }
      );
    }

    // Use INSERT ... ON CONFLICT to avoid duplicate trophies
    const rows = await sql`
      INSERT INTO unlocked_trophies (trophy_id, trophy_name, trophy_type, unlocked_date, unlocked_at)
      VALUES (${trophy_id}, ${trophy_name}, ${trophy_type}, CURRENT_DATE, CURRENT_TIMESTAMP)
      ON CONFLICT (trophy_id) DO NOTHING
      RETURNING *
    `;

    if (rows.length === 0) {
      // Trophy was already unlocked
      return NextResponse.json({ message: 'Trophy already unlocked' }, { status: 200 });
    }

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error unlocking trophy:', error);
    return NextResponse.json({ error: 'Failed to unlock trophy' }, { status: 500 });
  }
}

// DELETE endpoint for testing/admin purposes
export async function DELETE() {
  try {
    await sql`DELETE FROM unlocked_trophies`;
    return NextResponse.json({ message: 'All trophies reset successfully' });
  } catch (error) {
    console.error('Error resetting trophies:', error);
    return NextResponse.json({ error: 'Failed to reset trophies' }, { status: 500 });
  }
}