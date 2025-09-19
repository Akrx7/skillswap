import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export default function Connections() {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [loading, setLoading] = useState({});
  const currentUser = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Load sent connection requests
    const sentQuery = query(
      collection(db, 'connections'),
      where('requesterId', '==', currentUser.uid)
    );
    const sentUnsub = onSnapshot(sentQuery, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setSentRequests(list);
    });

    // Load received connection requests
    const receivedQuery = query(
      collection(db, 'connections'),
      where('recipientId', '==', currentUser.uid)
    );
    const receivedUnsub = onSnapshot(receivedQuery, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setReceivedRequests(list);
    });

    return () => {
      sentUnsub();
      receivedUnsub();
    };
  }, [currentUser]);

  const handleAcceptConnection = async (connectionId) => {
    setLoading(prev => ({ ...prev, [connectionId]: true }));
    try {
      await updateDoc(doc(db, 'connections', connectionId), {
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error accepting connection:', error);
    } finally {
      setLoading(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleRejectConnection = async (connectionId) => {
    setLoading(prev => ({ ...prev, [connectionId]: true }));
    try {
      await deleteDoc(doc(db, 'connections', connectionId));
    } catch (error) {
      console.error('Error rejecting connection:', error);
    } finally {
      setLoading(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleCancelRequest = async (connectionId) => {
    setLoading(prev => ({ ...prev, [connectionId]: true }));
    try {
      await deleteDoc(doc(db, 'connections', connectionId));
    } catch (error) {
      console.error('Error canceling request:', error);
    } finally {
      setLoading(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const pendingReceived = receivedRequests.filter(req => req.status === 'pending');
  const acceptedReceived = receivedRequests.filter(req => req.status === 'accepted');
  const pendingSent = sentRequests.filter(req => req.status === 'pending');
  const acceptedSent = sentRequests.filter(req => req.status === 'accepted');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connections</h1>
        <p className="text-gray-600">Manage your skill sharing connections</p>
      </div>

      <div className="space-y-8">
        {/* Received Requests */}
        {pendingReceived.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Pending Requests ({pendingReceived.length})
            </h2>
            <div className="space-y-4">
              {pendingReceived.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-semibold">
                          {request.requesterName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requesterName}</h3>
                        <p className="text-sm text-gray-600">Wants to connect about: <span className="font-medium">{request.skill}</span></p>
                        <p className="text-xs text-gray-500">{request.requesterEmail}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptConnection(request.id)}
                        disabled={loading[request.id]}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {loading[request.id] ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRejectConnection(request.id)}
                        disabled={loading[request.id]}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Requests */}
        {pendingSent.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              Sent Requests ({pendingSent.length})
            </h2>
            <div className="space-y-4">
              {pendingSent.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                        <span className="text-purple-600 font-semibold">
                          {request.recipientName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.recipientName}</h3>
                        <p className="text-sm text-gray-600">About: <span className="font-medium">{request.skill}</span></p>
                        <p className="text-xs text-gray-500">Status: Pending</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      disabled={loading[request.id]}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      {loading[request.id] ? 'Canceling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Connections */}
        {(acceptedReceived.length > 0 || acceptedSent.length > 0) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Connected ({acceptedReceived.length + acceptedSent.length})
            </h2>
            <div className="space-y-4">
              {[...acceptedReceived, ...acceptedSent].map((connection) => (
                <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                      <span className="text-green-600 font-semibold">
                        {connection.requesterId === currentUser.uid 
                          ? connection.recipientName?.charAt(0)?.toUpperCase() 
                          : connection.requesterName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {connection.requesterId === currentUser.uid 
                          ? connection.recipientName 
                          : connection.requesterName}
                      </h3>
                      <p className="text-sm text-gray-600">Connected about: <span className="font-medium">{connection.skill}</span></p>
                      <p className="text-xs text-gray-500">
                        {connection.requesterId === currentUser.uid 
                          ? connection.requesterEmail 
                          : connection.requesterEmail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingReceived.length === 0 && pendingSent.length === 0 && acceptedReceived.length === 0 && acceptedSent.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
            <p className="text-gray-600">Start connecting with others by exploring skills in the dashboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
