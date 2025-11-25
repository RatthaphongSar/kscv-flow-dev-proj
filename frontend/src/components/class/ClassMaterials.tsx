/**
 * ClassMaterials.tsx
 * Tab for displaying teaching materials (files and links)
 */

import React, { useState, useEffect } from 'react';
import { Plus, Download, ExternalLink, Trash2, FileText, Link } from 'lucide-react';
import classApi from '../../api/classApi';
import { useAuth } from '../../hooks/useAuth';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface Material {
  id: string;
  title: string;
  description?: string;
  type: 'FILE' | 'LINK';
  fileUrl?: string;
  linkUrl?: string;
  fileType?: string;
  createdAt: string;
}

interface ClassMaterialsProps {
  classId: string;
}

export default function ClassMaterials({ classId }: ClassMaterialsProps) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FILE' as 'FILE' | 'LINK',
    fileUrl: '',
    linkUrl: '',
    fileType: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [classId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await classApi.getMaterials(classId);
      setMaterials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await classApi.addMaterial(classId, formData);
      await loadMaterials();
      setFormData({
        title: '',
        description: '',
        type: 'FILE',
        fileUrl: '',
        linkUrl: '',
        fileType: '',
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    setDeleteTargetId(materialId);
    setDeleteTargetName(material?.title || 'Material');
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await classApi.deleteMaterial(deleteTargetId);
      setMaterials(materials.filter((m) => m.id !== deleteTargetId));
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="space-y-6">
      {/* Add Material Button */}
      {isTeacher && (
        <div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={20} />
            เพิ่มสื่อการสอน
          </button>
        </div>
      )}

      {/* Add Material Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold mb-4">เพิ่มสื่อการสอน</h3>
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="ชื่อเอกสาร"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600"
            />

            <textarea
              placeholder="คำอธิบาย (ถ้ามี)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600"
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="FILE"
                  checked={formData.type === 'FILE'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'FILE' | 'LINK' })}
                />
                ไฟล์
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="LINK"
                  checked={formData.type === 'LINK'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'FILE' | 'LINK' })}
                />
                ลิงก์
              </label>
            </div>

            {formData.type === 'FILE' ? (
              <>
                <input
                  type="url"
                  placeholder="URL ของไฟล์"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="ประเภทไฟล์ (เช่น pdf, docx)"
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
              </>
            ) : (
              <input
                type="url"
                placeholder="ลิงก์เว็บ"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600"
              />
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>ยังไม่มีสื่อการสอน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="border rounded-lg p-4 dark:border-slate-700 dark:bg-slate-800 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  {material.type === 'FILE' ? (
                    <FileText size={24} className="text-blue-600" />
                  ) : (
                    <Link size={24} className="text-green-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{material.title}</h3>
                  {material.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(material.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>

                <div className="flex gap-2">
                  {material.type === 'FILE' && material.fileUrl && (
                    <a
                      href={material.fileUrl}
                      download
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded"
                    >
                      <Download size={18} />
                    </a>
                  )}
                  {material.type === 'LINK' && material.linkUrl && (
                    <a
                      href={material.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 rounded"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  {isTeacher && (
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
          setDeleteTargetName('');
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Material"
        message={`Are you sure you want to delete this material?`}
        itemName={deleteTargetName}
        resourceType="material"
      />
    </div>
  );
}
