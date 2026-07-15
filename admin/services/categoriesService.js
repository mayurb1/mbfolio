import { createResourceService } from './createResourceService'

// Categories service for categories management APIs.
// CRUD methods come from the shared resource factory; exposed under the
// entity-specific names the store/pages already call.
const base = createResourceService('/categories', {
  singular: 'category',
  plural: 'categories',
})

const categoriesService = {
  getAllCategories: base.getAll,
  getCategoryById: base.getById,
  createCategory: base.create,
  updateCategory: base.update,
  patchCategory: base.partialUpdate,
  deleteCategory: base.remove,
  toggleCategoryStatus: base.toggleStatus,
}

export default categoriesService
