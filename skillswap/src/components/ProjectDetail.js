import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import Chat from './Chat';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const currentUser = useAuth();

  // Set active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/chat')) {
      setActiveTab('chat');
    } else {
      setActiveTab('details');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!projectId) return;

    const projectRef = doc(db, 'projects', projectId);
    const unsubscribe = onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleStatusChange = async (newStatus) => {
    if (!project || project.ownerId !== currentUser.uid) return;

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const isOwner = project.ownerId === currentUser.uid;
  const isCollaborator = project.collaborators?.some(c => c.uid === currentUser.uid);

  if (!isOwner && !isCollaborator) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to view this project.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Project Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <span className="text-sm text-gray-500">
                Created {project.createdAt?.toDate ? 
                  project.createdAt.toDate().toLocaleDateString() : 
                  'recently'
                }
              </span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex space-x-2">
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-gray-600 mb-4">{project.description}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Project Owner</h3>
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold">
                  {project.ownerName?.charAt(0)?.toUpperCase() || 'O'}
                </span>
              </div>
              <span className="text-gray-900">{project.ownerName}</span>
            </div>
          </div>

          {project.collaborators && project.collaborators.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Collaborators</h3>
              <div className="space-y-2">
                {project.collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold text-sm">
                        {collaborator.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <span className="text-gray-900">{collaborator.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Details
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chat
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{project.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {project.createdAt?.toDate ? 
                          project.createdAt.toDate().toLocaleString() : 
                          'Recently'
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {project.updatedAt?.toDate ? 
                          project.updatedAt.toDate().toLocaleString() : 
                          'Recently'
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Team Size</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {1 + (project.collaborators?.length || 0)} member{(1 + (project.collaborators?.length || 0)) !== 1 ? 's' : ''}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="h-96">
              <Chat projectId={projectId} projectName={project.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
