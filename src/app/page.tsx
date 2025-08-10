'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Edit3, Trash2, Calendar, Building, Trophy } from 'lucide-react';
import { useTrophy } from './contexts/TrophyContext';

interface Job {
  id: number;
  company: string;
  position: string;
  link: string;
  status: string;
  date_added: string;
  notes: string;
}

const JobTracker = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    link: '',
    status: 'Applied',
    notes: ''
  });

  const { checkTrophyUnlocks, trophiesLoaded } = useTrophy();

  const statuses = ['Applied', 'In Review', 'In Interview', 'Technical Round', 'Final Round', 'Offer', 'Rejected', 'Withdrawn'];

  const statusColors = {
    'Applied': 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-500/30',
    'In Review': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-500/30',
    'In Interview': 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/30',
    'Technical Round': 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/30',
    'Final Round': 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-orange-500/30',
    'Offer': 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-500/30',
    'Rejected': 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-500/30',
    'Withdrawn': 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-gray-500/30'
  };

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Fetched jobs:', data.length);
        setJobs(data);
        
        // Only check for trophy unlocks if trophies have been loaded
        if (trophiesLoaded) {
          checkTrophyUnlocks(data);
        } else {
          console.log('⏳ Delaying trophy check until trophies are loaded');
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Check trophies when trophiesLoaded changes and we have jobs
  useEffect(() => {
    if (trophiesLoaded && jobs.length > 0) {
      console.log('🎯 Trophies loaded, now checking unlocks for existing jobs');
      checkTrophyUnlocks(jobs);
    }
  }, [trophiesLoaded]);

  const handleSubmit = async () => {
    if (!formData.company.trim() || !formData.position.trim()) {
      alert('Please fill in company and position fields');
      return;
    }

    console.log('🚀 Submitting job:', formData);

    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('✅ Job saved successfully');
        await fetchJobs(); // This will trigger trophy checking
        resetForm();
      } else {
        alert('Error saving job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Error saving job');
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      position: job.position,
      link: job.link,
      status: job.status,
      notes: job.notes
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        const response = await fetch(`/api/jobs/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchJobs(); // This will trigger trophy checking
        } else {
          alert('Error deleting job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Error deleting job');
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    console.log('🔄 Changing status for job', id, 'to', newStatus);
    
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        console.log('✅ Status updated successfully');
        await fetchJobs(); // This will trigger trophy checking
      } else {
        alert('Error updating status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingJob(null);
    setFormData({
      company: '',
      position: '',
      link: '',
      status: 'Applied',
      notes: ''
    });
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    statuses.forEach(status => {
      counts[status] = jobs.filter(job => job.status === status).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* PS5 Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(59,130,246,0.03)_49%,rgba(59,130,246,0.03)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6 pl-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl border border-slate-600/30 p-8 mb-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Job Tracker
                </h1>
                <p className="text-slate-300 mt-1">Track your job applications and unlock achievements</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Plus size={20} />
              Add Job
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {statuses.map(status => (
            <div key={status} className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 shadow-xl">
              <div className="text-2xl font-bold text-white">{statusCounts[status] || 0}</div>
              <div className="text-sm text-slate-300 mt-1">{status}</div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-md rounded-2xl border border-slate-600/40 p-8 mb-8 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-blue-400">
              {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm"
                  placeholder="e.g., Google, Microsoft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm"
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Posting Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status} className="bg-slate-800">{status}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm"
                  rows={3}
                  placeholder="Add any notes about the application, interview details, etc."
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  {editingJob ? 'Update Job' : 'Add Job'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-8 py-3 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-12 text-center shadow-xl">
              <Building size={64} className="mx-auto text-slate-500 mb-6" />
              <h3 className="text-2xl font-semibold text-slate-300 mb-3">No job applications yet</h3>
              <p className="text-slate-400 mb-6">Start tracking your job applications and unlock your first trophy!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                Add Your First Job
              </button>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-gradient-to-r from-slate-800/70 to-slate-700/70 backdrop-blur-md rounded-2xl border border-slate-600/40 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{job.position}</h3>
                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                    <p className="text-lg text-slate-300 mb-3">{job.company}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Added {job.date_added}
                      </div>
                    </div>

                    {job.notes && (
                      <p className="text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-600/30">{job.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border-0 ${statusColors[job.status as keyof typeof statusColors]} shadow-lg`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status} className="bg-slate-800 text-white">{status}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => handleEdit(job)}
                      className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-xl transition-all duration-300"
                    >
                      <Edit3 size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-xl transition-all duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTracker;