import { NextRequest, NextResponse } from 'next/server';
import { generateHTMLPreview } from '../../../lib/latexTemplate';

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json();
    
    // Generate HTML preview for PDF conversion
    const htmlContent = generateHTMLPreview(resumeData);
    
    // Return HTML content that can be converted to PDF on the frontend
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    return NextResponse.json({ error: 'Failed to generate PDF preview' }, { status: 500 });
  }
}