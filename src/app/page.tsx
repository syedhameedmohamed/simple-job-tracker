'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Edit3, Trash2, Calendar, Building } from 'lucide-react';

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

  const statuses = ['Applied', 'In Review', 'In Interview', 'Technical Round', 'Final Round', 'Offer', 'Rejected', 'Withdrawn'];

  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-800',
    'In Review': 'bg-yellow-100 text-yellow-800',
    'In Interview': 'bg-purple-100 text-purple-800',
    'Technical Round': 'bg-indigo-100 text-indigo-800',
    'Final Round': 'bg-orange-100 text-orange-800',
    'Offer': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Withdrawn': 'bg-gray-100 text-gray-800'
  };

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
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

  const handleSubmit = async () => {
    if (!formData.company.trim() || !formData.position.trim()) {
      alert('Please fill in company and position fields');
      return;
    }

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
        await fetchJobs(); // Refresh the list
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
          await fetchJobs(); // Refresh the list
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
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchJobs(); // Refresh the list
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Tracker</h1>
              <p className="text-gray-600 mt-1">Track your job applications and interview progress</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Job
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          {statuses.map(status => (
            <div key={status} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</div>
              <div className="text-sm text-gray-600 mt-1">{status}</div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Google, Microsoft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Posting Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes about the application, interview details, etc."
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingJob ? 'Update Job' : 'Add Job'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Building size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your job applications by adding your first job!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Job
              </button>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.position}</h3>
                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-3">{job.company}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        Added {job.date_added}
                      </div>
                    </div>

                    {job.notes && (
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{job.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status as keyof typeof statusColors]}`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => handleEdit(job)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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