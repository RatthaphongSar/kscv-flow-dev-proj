/**
 * Teaching Material Controller
 * Handles sharing teaching materials (files, links) with students
 */

import { validationResult } from 'express-validator';
import TeachingMaterialService from '../services/teachingMaterial.service.js';

// ==================== MATERIAL MANAGEMENT ====================

export const getClassMaterials = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { classId } = req.params;

    const materials = await TeachingMaterialService.getClassMaterials(classId);

    return res.json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
    });
  }
};

export const addMaterial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { classId } = req.params;
    const { id: teacherId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can add materials',
      });
    }

    const material = await TeachingMaterialService.addMaterial(
      classId,
      req.body,
      teacherId
    );

    return res.status(201).json({
      success: true,
      data: material,
      message: 'Material added successfully',
    });
  } catch (error) {
    console.error('Error adding material:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to add material',
    });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { materialId } = req.params;
    const { id: teacherId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can update materials',
      });
    }

    const material = await TeachingMaterialService.updateMaterial(
      materialId,
      req.body,
      teacherId
    );

    return res.json({
      success: true,
      data: material,
      message: 'Material updated successfully',
    });
  } catch (error) {
    console.error('Error updating material:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update material',
    });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { materialId } = req.params;
    const { id: teacherId, role } = req.user || {};

    if (role !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can delete materials',
      });
    }

    await TeachingMaterialService.deleteMaterial(materialId, teacherId);

    return res.json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete material',
    });
  }
};
