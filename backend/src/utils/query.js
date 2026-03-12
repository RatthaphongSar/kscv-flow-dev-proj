const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE || 20)
const MAX_PAGE_SIZE = Number(process.env.MAX_PAGE_SIZE || 100)

const toInt = (value) => {
  const num = Number.parseInt(String(value), 10)
  return Number.isNaN(num) ? null : num
}

export const parsePagination = (query, options = {}) => {
  const defaultPageSize = Number(options.defaultPageSize || DEFAULT_PAGE_SIZE)
  const maxPageSize = Number(options.maxPageSize || MAX_PAGE_SIZE)

  const rawSkip = toInt(query.skip)
  const rawTake = toInt(query.take)
  const rawPage = toInt(query.page)
  const rawPageSize = toInt(query.pageSize)

  let take = rawTake ?? rawPageSize ?? defaultPageSize
  let skip = rawSkip ?? 0
  let pageSize = rawPageSize ?? defaultPageSize
  let page = rawPage ?? Math.floor(skip / Math.max(pageSize, 1)) + 1

  take = Math.min(Math.max(take, 1), maxPageSize)
  pageSize = Math.min(Math.max(pageSize, 1), maxPageSize)
  page = Math.max(page, 1)
  skip = Math.max(skip, 0)

  if (rawSkip == null && rawTake == null) {
    skip = (page - 1) * pageSize
    take = pageSize
  }

  return { skip, take, page, pageSize }
}

export const buildOrderBy = (query, allowedFields, defaultField, defaultOrder = 'desc') => {
  const sortBy = String(query.sortBy || '').trim()
  const sortOrder = String(query.sortOrder || '').toLowerCase()
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField
  const direction = sortOrder === 'asc' ? 'asc' : defaultOrder
  return { [field]: direction }
}

export const buildSearch = (query, fields) => {
  const q = String(query.q || '').trim()
  if (!q) return null
  return {
    OR: fields.map((field) => ({
      [field]: { contains: q, mode: 'insensitive' }
    }))
  }
}
