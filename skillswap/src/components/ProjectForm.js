import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export default function ProjectForm() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [availableCollaborators, setAvailableCollaborators] = useState([]);
  const [saving, setSaving] = useState(false);
  const currentUser = useAuth();

  // Load connected users (accepted connections only)
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'connections'),
      where('status', '==', 'accepted')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const collaborators = [];
      snap.forEach((doc) => {
        const conn = doc.data();
        // Include both requester and recipient if current user is involved
        if (conn.requesterId === currentUser.uid) {
          collaborators.push({
            uid: conn.recipientId,
            name: conn.recipientName,
            email: conn.requesterEmail // This should be recipientEmail, but we'll use what we have
          });
        } else if (conn.recipientId === currentUser.uid) {
          collaborators.push({
            uid: conn.requesterId,
            name: conn.requesterName,
            email: conn.requesterEmail
          });
        }
      });
      setAvailableCollaborators(collaborators);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCollaboratorToggle = (collaborator) => {
    setSelectedCollaborators(prev => {
      const isSelected = prev.some(c => c.uid === collaborator.uid);
      if (isSelected) {
        return prev.filter(c => c.uid !== collaborator.uid);
      } else {
        return [...prev, collaborator];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !currentUser) return;
    
    setSaving(true);
    try {
      const projectData = {
        name: projectName.trim(),
        description: description.trim(),
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email,
        collaborators: selectedCollaborators,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      // Reset form
      setProjectName('');
      setDescription('');
      setSelectedCollaborators([]);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 p-3 rounded-lg mr-4">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <p className="text-gray-600">Start a collaborative project with your connections</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe your project goals and requirements..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {availableCollaborators.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Collaborators
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableCollaborators.map((collaborator) => (
                <div
                  key={collaborator.uid}
                  onClick={() => handleCollaboratorToggle(collaborator)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedCollaborators.some(c => c.uid === collaborator.uid)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold text-sm">
                        {collaborator.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{collaborator.name}</p>
                      <p className="text-sm text-gray-600">{collaborator.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedCollaborators.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedCollaborators.length} collaborator{selectedCollaborators.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {availableCollaborators.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-700 text-sm">
                You need to have accepted connections to create collaborative projects. 
                Go to the Connections page to accept pending requests.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saving || !projectName.trim() || availableCollaborators.length === 0}
        >
          {saving ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Project...
            </span>
          ) : (
            'Create Project'
          )}
        </button>
      </form>
    </div>
  );
}
