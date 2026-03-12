import { prisma } from "../db.js"
import { parsePagination, buildOrderBy, buildSearch } from '../utils/query.js'

/**
 * Resources / Materials list
 * @route GET /
 */
export const listResources = async (req, res, next) => {
  try {
    const { classId, fileType } = req.query

    let where = {}
    if (classId) where.classId = classId
    if (fileType) where.fileType = fileType
    const search = buildSearch(req.query, ['title', 'description'])
    if (search) where.OR = search.OR

    const pagination = parsePagination(req.query, { defaultPageSize: 20, maxPageSize: 100 })
    const orderBy = buildOrderBy(req.query, ['createdAt', 'title', 'size'], 'createdAt', 'desc')

    const [total, resources] = await prisma.$transaction([
      prisma.resource.count({ where }),
      prisma.resource.findMany({
        where,
        include: { class: { select: { name: true } } },
        orderBy,
        skip: pagination.skip,
        take: pagination.take
      })
    ])

    res.json({ data: resources, pagination: { ...pagination, total } })
  } catch (err) {
    next(err)
  }
}

/**
 * Create resource (teacher)
 * @route POST /
 */
export const createResource = async (req, res, next) => {
  try {
    const { title, description, fileUrl, fileType, size, classId } = req.body
    if (!title || !fileUrl || !classId) {
      return res.status(400).json({ error: "title, fileUrl, classId are required" })
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        fileUrl,
        fileType: fileType || 'document',
        size,
        classId
      },
      include: { class: { select: { name: true } } }
    })

    res.status(201).json(resource)
  } catch (err) {
    next(err)
  }
}

/**
 * Delete resource
 * @route DELETE /:id
 */
export const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.resource.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
