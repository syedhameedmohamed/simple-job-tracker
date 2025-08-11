interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
}

export function generateLatexFromTemplate(resumeData: ResumeData): string {
  const { personalInfo, experience, education, skills } = resumeData;
  
  // Format dates for LaTeX
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Generate skills sections
  const generateSkills = () => {
    return skills.map(skill => {
      const skillItems = skill.items.join(', ');
      return `\\begin{itemize}[noitemsep,nolistsep,leftmargin=1 cm]
\\item {${skill.category}: ${skillItems}}
\\end{itemize}`;
    }).join('\n\n');
  };

  // Generate experience section
  const generateExperience = () => {
    return experience.map(exp => {
      const startDate = formatDate(exp.startDate);
      const endDate = exp.current ? 'Present' : formatDate(exp.endDate);
      const dateRange = `${startDate} $-$ ${endDate}`;
      
      // Split description by newlines and create bullet points
      const descriptions = exp.description
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `\\item {${line}}`)
        .join('\n');
      
      return `\\noindent \\textbf{${exp.company}} \\hfill ${exp.location} \\\\
\\textit{${exp.position}} \\hfill ${dateRange}
\\begin{itemize}[noitemsep, nolistsep, leftmargin=1cm] {\\leftmargin=2em \\itemindent=1em}
${descriptions}
\\end{itemize}
\\vspace{1mm}`;
    }).join('\n');
  };

  // Generate education section
  const generateEducation = () => {
    return education.map(edu => {
      const startDate = formatDate(edu.startDate);
      const endDate = formatDate(edu.endDate);
      const dateRange = `${startDate} $-$ ${endDate}`;
      const gpaText = edu.gpa ? ` \\hspace{2mm} GPA: ${edu.gpa}` : '';
      
      return `\\textbf{${edu.institution}} \\hfill \\\\
\\textit{${edu.degree} in ${edu.field}}${gpaText} \\hfill ${dateRange} \\\\`;
    }).join('\n');
  };

  // Build the complete LaTeX document using your template
  const latexContent = `\\documentclass[10pt]{extarticle}

\\usepackage[top=0.5in, bottom=0.5in, left=0.5in, right=0.5in]{geometry}
\\usepackage{enumitem}
\\usepackage{tabto}
\\usepackage{hyperref}
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=cyan,
    }
\\renewcommand{\\familydefault}{\\sfdefault}

\\begin{document}
\\begin{center}
\\thispagestyle{empty}
\\Huge \\textbf{${personalInfo.fullName} \\\\}
\\normalsize ${personalInfo.email}${personalInfo.phone ? ` $\\mid$ ${personalInfo.phone}` : ''}${personalInfo.linkedin ? ` $\\mid$ \\href{${personalInfo.linkedin}}{${personalInfo.linkedin.replace('https://', '')}}` : ''}${personalInfo.website ? ` $\\mid$ \\href{${personalInfo.website}}{${personalInfo.website.replace('https://', '')}}` : ''} \\\\
\\hrulefill
\\end{center}

${education.length > 0 ? `
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% EDUCATION
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\noindent \\textbf{\\underline{EDUCATION}} \\\\
${generateEducation()}
\\vspace{1mm}` : ''}

${skills.length > 0 ? `
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% TECHNICAL SKILLS
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\noindent \\textbf{\\underline{TECHNICAL SKILLS}}
${generateSkills()}
\\vspace{1.5mm}` : ''}

${experience.length > 0 ? `
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% WORK EXPERIENCE
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\noindent \\textbf{\\underline{EXPERIENCE}} \\\\
${generateExperience()}` : ''}

\\end{document}`;

  return latexContent;
}

// Function to create a downloadable LaTeX file
export function downloadLatexFile(resumeData: ResumeData, filename: string = 'resume.tex') {
  const latexContent = generateLatexFromTemplate(resumeData);
  const blob = new Blob([latexContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Function to create HTML preview that matches LaTeX styling
export function generateHTMLPreview(resumeData: ResumeData): string {
  const { personalInfo, experience, education, skills } = resumeData;
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${personalInfo.fullName} - Resume</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.1;
            margin: 0;
            padding: 0;
            color: black;
            background: white;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
        }
        .name {
            font-size: 22pt;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .contact {
            font-size: 9pt;
            margin-bottom: 6px;
        }
        .contact a {
            color: #0066cc;
            text-decoration: none;
        }
        hr {
            border: none;
            height: 1px;
            background-color: black;
            margin: 8px 0;
        }
        .section-title {
            font-weight: bold;
            text-decoration: underline;
            font-size: 10pt;
            margin: 12px 0 4px 0;
        }
        .entry {
            margin-bottom: 8px;
        }
        .entry-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 10pt;
        }
        .entry-subheader {
            display: flex;
            justify-content: space-between;
            font-style: italic;
            margin-bottom: 3px;
            font-size: 9pt;
        }
        .description {
            margin: 3px 0 3px 15px;
            font-size: 9pt;
        }
        .skills-category {
            margin: 3px 0 3px 15px;
            font-size: 9pt;
        }
        ul {
            margin: 0;
            padding-left: 15px;
        }
        li {
            margin-bottom: 1px;
            font-size: 9pt;
        }
        @media print {
            body { 
                margin: 0;
                padding: 0.5in;
                max-width: none;
            }
            .no-print { display: none; }
        }
        @page {
            margin: 0.5in;
            size: letter;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${personalInfo.fullName}</div>
        <div class="contact">
            ${personalInfo.email}${personalInfo.phone ? ` | ${personalInfo.phone}` : ''}${personalInfo.linkedin ? ` | <a href="${personalInfo.linkedin}">${personalInfo.linkedin.replace('https://', '')}</a>` : ''}${personalInfo.website ? ` | <a href="${personalInfo.website}">${personalInfo.website.replace('https://', '')}</a>` : ''}
        </div>
        <hr>
    </div>

    ${education.length > 0 ? `
    <div class="section-title">EDUCATION</div>
    ${education.map(edu => `
    <div class="entry">
        <div class="entry-header">
            <span>${edu.institution}</span>
            <span></span>
        </div>
        <div class="entry-subheader">
            <span>${edu.degree} in ${edu.field}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</span>
            <span>${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</span>
        </div>
    </div>
    `).join('')}
    ` : ''}

    ${skills.length > 0 ? `
    <div class="section-title">TECHNICAL SKILLS</div>
    ${skills.map(skill => `
    <div class="skills-category">• ${skill.category}: ${skill.items.join(', ')}</div>
    `).join('')}
    ` : ''}

    ${experience.length > 0 ? `
    <div class="section-title">EXPERIENCE</div>
    ${experience.map(exp => {
      // Split description by newlines and create bullet points
      const descriptions = exp.description
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<div class="description">• ${line}</div>`)
        .join('');
        
      return `
    <div class="entry">
        <div class="entry-header">
            <span>${exp.company}</span>
            <span>${exp.location}</span>
        </div>
        <div class="entry-subheader">
            <span>${exp.position}</span>
            <span>${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</span>
        </div>
        ${descriptions}
    </div>
    `;
    }).join('')}
    ` : ''}
</body>
</html>`;
}