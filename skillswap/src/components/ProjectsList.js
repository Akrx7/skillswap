import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const currentUser = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Load projects where user is owner or collaborator
    const q = query(
      collection(db, 'projects'),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const projectList = [];
      snap.forEach((doc) => {
        const project = { id: doc.id, ...doc.data() };
        
        // Check if current user is involved in this project
        const isOwner = project.ownerId === currentUser.uid;
        const isCollaborator = project.collaborators?.some(c => c.uid === currentUser.uid);
        
        if (isOwner || isCollaborator) {
          projectList.push(project);
        }
      });
      setProjects(projectList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <p className="text-gray-600">Collaborate and manage your projects</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "Create your first collaborative project to get started!" 
              : `No projects found with status "${filter}". Try a different filter or create a new project!`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{project.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
              )}
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Owner:</p>
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    <span className="text-blue-600 font-semibold text-xs">
                      {project.ownerName?.charAt(0)?.toUpperCase() || 'O'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">{project.ownerName}</span>
                </div>
              </div>

              {project.collaborators && project.collaborators.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Collaborators:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center">
                        <div className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center mr-1">
                          <span className="text-purple-600 font-semibold text-xs">
                            {collaborator.name?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">{collaborator.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {project.createdAt?.toDate ? 
                    project.createdAt.toDate().toLocaleDateString() : 
                    'Recently created'
                  }
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/project/${project.id}/chat`}
                    className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Chat
                  </Link>
                  <Link
                    to={`/project/${project.id}`}
                    className="bg-purple-50 text-purple-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
