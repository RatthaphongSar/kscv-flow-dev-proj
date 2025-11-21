/**
 * Teaching Materials Service
 * Handles classroom materials (files, links) that teachers can share
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeachingMaterialService {
  /**
   * Add teaching material to a class
   */
  async addMaterial(classId, materialData, teacherId) {
    // Validate that teacher owns the class
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord || classRecord.teacherId !== teacherId) {
      throw new Error('Unauthorized - not the class teacher');
    }

    if (!materialData.type || !['FILE', 'LINK'].includes(materialData.type)) {
      throw new Error('Invalid material type - must be FILE or LINK');
    }

    if (materialData.type === 'FILE' && !materialData.fileUrl) {
      throw new Error('File URL required for FILE type');
    }

    if (materialData.type === 'LINK' && !materialData.linkUrl) {
      throw new Error('Link URL required for LINK type');
    }

    return prisma.teachingMaterial.create({
      data: {
        classId,
        title: materialData.title,
        description: materialData.description,
        type: materialData.type,
        fileUrl: materialData.fileUrl,
        linkUrl: materialData.linkUrl,
        fileType: materialData.fileType,
        createdBy: teacherId,
      },
    });
  }

  /**
   * Get all materials for a class
   */
  async getClassMaterials(classId) {
    return prisma.teachingMaterial.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single material
   */
  async getMaterial(materialId) {
    return prisma.teachingMaterial.findUnique({
      where: { id: materialId },
    });
  }

  /**
   * Update material
   */
  async updateMaterial(materialId, updateData, teacherId) {
    const material = await prisma.teachingMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material || material.createdBy !== teacherId) {
      throw new Error('Unauthorized - not the creator of this material');
    }

    return prisma.teachingMaterial.update({
      where: { id: materialId },
      data: {
        title: updateData.title || material.title,
        description: updateData.description || material.description,
        fileUrl: updateData.fileUrl || material.fileUrl,
        linkUrl: updateData.linkUrl || material.linkUrl,
        fileType: updateData.fileType || material.fileType,
      },
    });
  }

  /**
   * Delete material
   */
  async deleteMaterial(materialId, teacherId) {
    const material = await prisma.teachingMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material || material.createdBy !== teacherId) {
      throw new Error('Unauthorized - not the creator of this material');
    }

    return prisma.teachingMaterial.delete({
      where: { id: materialId },
    });
  }
}

export default new TeachingMaterialService();
