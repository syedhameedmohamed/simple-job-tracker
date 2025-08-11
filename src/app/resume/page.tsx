'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Save, Plus, Edit3, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateLatexFromTemplate, downloadLatexFile, generateHTMLPreview } from '../lib/latexTemplate';

interface ResumeData {
  id?: number;
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
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: Array<{
    id: string;
    category: string;
    items: string[];
  }>;
}

const ResumePage = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
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

  const [activeTab, setActiveTab] = useState<'personal' | 'summary' | 'experience' | 'education' | 'skills'>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');

  // Load resume data on component mount
  useEffect(() => {
    loadResumeData();
  }, []);

  const loadResumeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resume');
      if (response.ok) {
        const data = await response.json();
        
        // Transform database data to match our component structure
        const transformedData: ResumeData = {
          id: data.id,
          personalInfo: data.personal_info || {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: ''
          },
          summary: data.summary || '',
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || []
        };
        
        setResumeData(transformedData);
        console.log('📄 Resume data loaded:', transformedData);
      } else {
        console.error('Failed to load resume data');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkillCategory = () => {
    const newSkillCategory = {
      id: Date.now().toString(),
      category: '',
      items: []
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkillCategory]
    }));
  };

  const updateSkillCategory = (id: string, field: string, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkillCategory = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');

      // Prepare data for API (transform to database format)
      const dataToSave = {
        id: resumeData.id,
        personal_info: resumeData.personalInfo,
        summary: resumeData.summary,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills
      };

      const url = '/api/resume';
      const method = resumeData.id ? 'PUT' : 'POST';

      console.log('💾 Saving resume data:', dataToSave);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const savedData = await response.json();
        setResumeData(prev => ({ ...prev, id: savedData.id }));
        setSaveStatus('success');
        console.log('✅ Resume saved successfully:', savedData);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const error = await response.json();
        console.error('❌ Failed to save resume:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('❌ Error saving resume:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

    const handlePreview = async () => {
    try {
        // Generate HTML preview
        const htmlContent = generateHTMLPreview(resumeData);
        setPreviewHTML(htmlContent);
        setShowPreview(true);
    } catch (error) {
        console.error('Error generating preview:', error);
        alert('Error generating preview');
    }
    };

const handleDownloadPDF = async () => {
  try {
    // Method 1: Download LaTeX file (user can compile with their LaTeX setup)
    const confirmed = window.confirm(
      'Choose download method:\n\nOK = Download LaTeX file (.tex) - compile with your LaTeX setup for best quality\nCancel = Download PDF (browser-generated)'
    );
    
    if (confirmed) {
      // Download LaTeX file
      downloadLatexFile(resumeData, `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.tex`);
    } else {
      // Generate PDF using browser
      await generateBrowserPDF();
    }
  } catch (error) {
    console.error('Error downloading resume:', error);
    alert('Error downloading resume');
  }
};

const generateBrowserPDF = async () => {
  try {
    // Generate HTML content
    const htmlContent = generateHTMLPreview(resumeData);
    
    // Create a temporary window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Note: The user will need to manually save as PDF from the print dialog
      }, 500);
    };
  } catch (error) {
    console.error('Error generating browser PDF:', error);
    alert('Error generating PDF');
  }
};

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'summary', label: 'Summary', icon: Edit3 },
    { id: 'experience', label: 'Experience', icon: Edit3 },
    { id: 'education', label: 'Education', icon: Edit3 },
    { id: 'skills', label: 'Skills', icon: Edit3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading resume...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* PS5 Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(59,130,246,0.03)_49%,rgba(59,130,246,0.03)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 pl-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl border border-slate-600/30 p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Resume Editor
                </h1>
                <p className="text-slate-300 mt-1">Create and customize your professional resume</p>
                {resumeData.id && (
                  <p className="text-slate-400 text-sm mt-1">Resume ID: {resumeData.id}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
              >
                <Eye size={18} />
                Preview
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className={`border px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                  saveStatus === 'success' 
                    ? 'bg-green-600/20 border-green-500/30 text-green-300'
                    : saveStatus === 'error'
                    ? 'bg-red-600/20 border-red-500/30 text-red-300'
                    : 'bg-green-600/20 hover:bg-green-600/30 border-green-500/30 text-green-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-300 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle size={18} />
                    Saved!
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <AlertCircle size={18} />
                    Error
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save
                  </>
                )}
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
              >
                <Download size={20} />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-md rounded-2xl border border-slate-600/40 p-8 shadow-2xl">
          
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-green-400 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                    placeholder="New York, NY"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-green-400 mb-6">Professional Summary</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Summary (2-3 sentences highlighting your key qualifications)
                </label>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                  rows={6}
                  placeholder="Experienced software developer with 5+ years of expertise in full-stack development..."
                />
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-green-400">Work Experience</h2>
                <button
                  onClick={addExperience}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                >
                  <Plus size={18} />
                  Add Experience
                </button>
              </div>

              {resumeData.experience.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No work experience added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Experience Entry</h3>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder="Job Title"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company Name"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder="Location"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <div className="flex gap-2">
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="flex-1 p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                          />
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className="flex-1 p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white disabled:opacity-50"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="flex items-center space-x-2 text-slate-300">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="rounded border-slate-600 bg-slate-700 text-green-600 focus:ring-green-500"
                          />
                          <span>Currently working here</span>
                        </label>
                      </div>
                      
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={4}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-green-400">Education</h2>
                <button
                  onClick={addEducation}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                >
                  <Plus size={18} />
                  Add Education
                </button>
              </div>

              {resumeData.education.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No education added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Education Entry</h3>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="Institution Name"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Degree (Bachelor's, Master's, etc.)"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                          placeholder="Field of Study"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          placeholder="GPA (optional)"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        />
                        <input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-green-400">Skills</h2>
                <button
                  onClick={addSkillCategory}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                >
                  <Plus size={18} />
                  Add Skill Category
                </button>
              </div>

              {resumeData.skills.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No skills added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Skill Category</h3>
                        <button
                          onClick={() => removeSkillCategory(skill.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={skill.category}
                          onChange={(e) => updateSkillCategory(skill.id, 'category', e.target.value)}
                          placeholder="Category (e.g., Programming Languages, Frameworks)"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                        <textarea
                          value={skill.items.join(', ')}
                          onChange={(e) => updateSkillCategory(skill.id, 'items', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
                          placeholder="Skills (comma-separated: JavaScript, React, Node.js)"
                          rows={3}
                          className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        {showPreview && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-slate-800 p-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Resume Preview</h3>
            <div className="flex gap-2">
            <button
                onClick={() => generateBrowserPDF()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
            >
                <Download size={16} />
                Print/Save PDF
            </button>
            <button
                onClick={() => setShowPreview(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
                Close
            </button>
            </div>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
            <iframe
            srcDoc={previewHTML}
            className="w-full h-[800px] border-none"
            title="Resume Preview"
            />
        </div>
        </div>
    </div>
    )}
    </div>
  );
};

export default ResumePage;