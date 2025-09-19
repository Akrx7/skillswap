import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export default function SkillList() {
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState('all');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState({});
  const currentUser = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'skills'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setSkills(list);
    });
    return () => unsub();
  }, []);

  // Load connections for the current user (both sent and received)
  useEffect(() => {
    if (!currentUser) return;
    
    // Load connections where current user is the requester
    const sentQuery = query(
      collection(db, 'connections'),
      where('requesterId', '==', currentUser.uid)
    );
    
    // Load connections where current user is the recipient
    const receivedQuery = query(
      collection(db, 'connections'),
      where('recipientId', '==', currentUser.uid)
    );
    
    const sentUnsub = onSnapshot(sentQuery, (snap) => {
      const sentList = [];
      snap.forEach((doc) => sentList.push({ id: doc.id, ...doc.data() }));
      
      const receivedUnsub = onSnapshot(receivedQuery, (snap) => {
        const receivedList = [];
        snap.forEach((doc) => receivedList.push({ id: doc.id, ...doc.data() }));
        
        // Combine both lists
        setConnections([...sentList, ...receivedList]);
      });
      
      return () => receivedUnsub();
    });
    
    return () => sentUnsub();
  }, [currentUser]);

  const categories = ['all', 'Web Development', 'Mobile Development', 'Data Science', 'Design', 'Marketing', 'Writing', 'Photography', 'Music', 'Languages', 'Other'];
  
  const filteredSkills = filter === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === filter);

  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': 'bg-blue-100 text-blue-800',
      'Mobile Development': 'bg-green-100 text-green-800',
      'Data Science': 'bg-purple-100 text-purple-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Marketing': 'bg-yellow-100 text-yellow-800',
      'Writing': 'bg-indigo-100 text-indigo-800',
      'Photography': 'bg-red-100 text-red-800',
      'Music': 'bg-orange-100 text-orange-800',
      'Languages': 'bg-teal-100 text-teal-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const handleConnect = async (skillOwner) => {
    if (!currentUser || currentUser.uid === skillOwner.uid) return;
    
    setLoading(prev => ({ ...prev, [skillOwner.uid]: true }));
    
    try {
      await addDoc(collection(db, 'connections'), {
        requesterId: currentUser.uid,
        requesterName: currentUser.displayName || currentUser.email,
        requesterEmail: currentUser.email,
        recipientId: skillOwner.uid,
        recipientName: skillOwner.displayName,
        skill: skillOwner.skill,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setLoading(prev => ({ ...prev, [skillOwner.uid]: false }));
    }
  };

  const getConnectionStatus = (skillOwner) => {
    // Check if current user sent a request to this skill owner
    const sentConnection = connections.find(conn => 
      conn.requesterId === currentUser.uid && conn.recipientId === skillOwner.uid
    );
    
    // Check if current user received a request from this skill owner
    const receivedConnection = connections.find(conn => 
      conn.recipientId === currentUser.uid && conn.requesterId === skillOwner.uid
    );
    
    // Return the status of the connection (sent takes priority)
    if (sentConnection) return sentConnection.status;
    if (receivedConnection) return receivedConnection.status;
    
    return null;
  };

  const isOwnSkill = (skillOwner) => {
    return currentUser && currentUser.uid === skillOwner.uid;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Skills</h2>
            <p className="text-gray-600">Discover skills shared by our community</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No skills found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "Be the first to share a skill with the community!" 
              : `No skills found in the ${filter} category. Try a different filter or share a skill in this category!`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.skill}</h3>
                {item.category && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                )}
              </div>
              
              {item.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">
                      {item.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.displayName}</p>
                    <p className="text-xs text-gray-500">
                      {item.createdAt?.toDate ? 
                        item.createdAt.toDate().toLocaleDateString() : 
                        'Recently shared'
                      }
                    </p>
                  </div>
                </div>
                
                {isOwnSkill(item) ? (
                  <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium">
                    Your Skill
                  </span>
                ) : (() => {
                  const status = getConnectionStatus(item);
                  if (status === 'pending') {
                    // Check if this is a received request (someone wants to connect with current user)
                    const receivedConnection = connections.find(conn => 
                      conn.recipientId === currentUser.uid && conn.requesterId === item.uid
                    );
                    
                    if (receivedConnection) {
                      return (
                        <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg text-sm font-medium">
                          Wants to Connect
                        </span>
                      );
                    } else {
                      return (
                        <span className="bg-yellow-100 text-yellow-600 px-4 py-2 rounded-lg text-sm font-medium">
                          Pending
                        </span>
                      );
                    }
                  } else if (status === 'accepted') {
                    return (
                      <span className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm font-medium">
                        Connected
                      </span>
                    );
                  } else {
                    return (
                      <button 
                        onClick={() => handleConnect(item)}
                        disabled={loading[item.uid]}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[item.uid] ? 'Sending...' : 'Connect'}
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

