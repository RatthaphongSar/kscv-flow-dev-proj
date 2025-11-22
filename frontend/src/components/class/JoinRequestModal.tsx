/**
 * JoinRequestModal.tsx
 * Themed modal for displaying and managing student join requests to a class
 */

import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, AlertCircle, Users, Mail, BookOpen } from 'lucide-react';
import classApi from '../../api/classApi';

interface JoinRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentMajor?: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
}

const JoinRequestModal: React.FC<JoinRequestModalProps> = ({ isOpen, onClose, classId, className }) => {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (isOpen) {
      loadJoinRequests();
    }
  }, [isOpen, classId]);

  const loadJoinRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const requests = await classApi.getJoinRequests(classId);
      setJoinRequests(requests || []);
    } catch (err) {
      console.error('Error loading join requests:', err);
      setError('Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setApproving(requestId);
      await classApi.approveJoinRequest(requestId);
      setJoinRequests(joinRequests.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve join request');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setRejecting(requestId);
      await classApi.rejectJoinRequest(requestId);
      setJoinRequests(joinRequests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject join request');
    } finally {
      setRejecting(null);
    }
  };

  const filteredRequests = joinRequests.filter(req =>
    filterStatus === 'all' ? true : req.status === filterStatus
  );

  const pendingCount = joinRequests.filter(r => r.status === 'pending').length;
  const approvedCount = joinRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = joinRequests.filter(r => r.status === 'rejected').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600/20 border-green-500 text-green-300';
      case 'rejected':
        return 'bg-red-600/20 border-red-500 text-red-300';
      case 'pending':
      default:
        return 'bg-yellow-600/20 border-yellow-500 text-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ปฏิเสธแล้ว';
      case 'pending':
      default:
        return 'รอการอนุมัติ';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-violet-500/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-violet-600/10 to-transparent sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-violet-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-100">คำขอเข้าร่วมชั้นเรียน</h2>
                <p className="text-sm text-slate-400 mt-1">{className}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="p-3 rounded-lg bg-yellow-600/20 border border-yellow-500/40">
              <div className="text-2xl font-bold text-yellow-300">{pendingCount}</div>
              <p className="text-xs text-yellow-300/70">รอการอนุมัติ</p>
            </div>
            <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/40">
              <div className="text-2xl font-bold text-green-300">{approvedCount}</div>
              <p className="text-xs text-green-300/70">อนุมัติแล้ว</p>
            </div>
            <div className="p-3 rounded-lg bg-red-600/20 border border-red-500/40">
              <div className="text-2xl font-bold text-red-300">{rejectedCount}</div>
              <p className="text-xs text-red-300/70">ปฏิเสธแล้ว</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-4 border-b border-slate-700 bg-slate-800/30 overflow-x-auto sticky top-14">
            {[
              { value: 'pending', label: 'รอการอนุมัติ', count: pendingCount },
              { value: 'approved', label: 'อนุมัติแล้ว', count: approvedCount },
              { value: 'rejected', label: 'ปฏิเสธแล้ว', count: rejectedCount },
              { value: 'all', label: 'ทั้งหมด', count: joinRequests.length },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value as any)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                  filterStatus === tab.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab.label}
                <span className="ml-2 opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-400">กำลังโหลดคำขอ...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
                <p className="text-slate-400 mb-1">
                  {filterStatus === 'pending'
                    ? 'ไม่มีคำขอที่รอการอนุมัติ'
                    : filterStatus === 'all'
                    ? 'ไม่มีคำขอเข้าร่วม'
                    : `ไม่มีคำขอที่${['อนุมัติแล้ว', 'ปฏิเสธแล้ว'][['approved', 'rejected'].indexOf(filterStatus)]}`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      request.status === 'pending'
                        ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}
                  >
                    {/* Request Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {request.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-100">{request.studentName}</h3>
                            {request.studentMajor && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <BookOpen className="w-3 h-3" />
                                {request.studentMajor}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-2 ml-13">
                          <Mail className="w-3 h-3" />
                          {request.studentEmail}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    {/* Request Date */}
                    <p className="text-xs text-slate-500 mb-3">
                      ขอเข้าร่วมเมื่อ: {new Date(request.requestedAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {/* Action Buttons - Only show for pending requests */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-3 border-t border-slate-700">
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={rejecting === request.id || approving === request.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 hover:border-red-500/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          {rejecting === request.id ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={approving === request.id || rejecting === request.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          {approving === request.id ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-slate-700 bg-slate-800/30">
            <button
              onClick={loadJoinRequests}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
            >
              รีเฟรช
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors text-sm font-medium"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestModal;
