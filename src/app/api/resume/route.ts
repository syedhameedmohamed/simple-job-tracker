import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get the most recent resume (for now, later we can add user-specific logic)
    const rows = await sql`
      SELECT r.*, rt.name as template_name 
      FROM resumes r
      LEFT JOIN resume_templates rt ON r.template_id = rt.id
      ORDER BY r.updated_at DESC
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      // Return empty resume structure if none exists
      return NextResponse.json({
        id: null,
        personal_info: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          website: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: []
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json();
    const { personal_info, summary, experience, education, skills, job_id } = resumeData;
    
    if (!personal_info || !personal_info.fullName || !personal_info.email) {
      return NextResponse.json(
        { error: 'Full name and email are required' }, 
        { status: 400 }
      );
    }

    // Get default template ID
    const templateResult = await sql`
      SELECT id FROM resume_templates WHERE is_default = TRUE LIMIT 1
    `;
    
    const templateId = templateResult.length > 0 ? templateResult[0].id : null;

    const rows = await sql`
      INSERT INTO resumes (
        template_id, 
        job_id, 
        personal_info, 
        summary, 
        experience, 
        education, 
        skills,
        updated_at
      )
      VALUES (
        ${templateId},
        ${job_id || null},
        ${JSON.stringify(personal_info)},
        ${summary || ''},
        ${JSON.stringify(experience || [])},
        ${JSON.stringify(education || [])},
        ${JSON.stringify(skills || [])},
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const resumeData = await request.json();
    const { id, personal_info, summary, experience, education, skills, job_id } = resumeData;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resume ID is required for updates' }, 
        { status: 400 }
      );
    }

    if (!personal_info || !personal_info.fullName || !personal_info.email) {
      return NextResponse.json(
        { error: 'Full name and email are required' }, 
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE resumes 
      SET 
        job_id = ${job_id || null},
        personal_info = ${JSON.stringify(personal_info)},
        summary = ${summary || ''},
        experience = ${JSON.stringify(experience || [])},
        education = ${JSON.stringify(education || [])},
        skills = ${JSON.stringify(skills || [])},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}