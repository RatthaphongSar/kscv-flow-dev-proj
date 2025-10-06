// backend/src/services/routerSelector.js
import { ruleBased } from './rules.js'
import { ragRoute } from './vector/index.js'
import { llmRoute } from './llm/index.js'

export async function selectRoute({ text }) {
  if (ruleBased.can(text)) return ruleBased
  if (process.env.VECTOR_PROVIDER) return ragRoute
  return llmRoute
}
