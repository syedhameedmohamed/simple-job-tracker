import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const trophyId = id;

    console.log('🗑️ Attempting to revoke trophy:', trophyId);

    const rows = await sql`
      DELETE FROM unlocked_trophies 
      WHERE trophy_id = ${trophyId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Trophy not found or not unlocked' }, { status: 404 });
    }

    console.log('✅ Trophy revoked successfully:', trophyId);
    return NextResponse.json({ 
      message: 'Trophy revoked successfully',
      trophy: rows[0]
    });
  } catch (error) {
    console.error('Error revoking trophy:', error);
    return NextResponse.json({ error: 'Failed to revoke trophy' }, { status: 500 });
  }
}