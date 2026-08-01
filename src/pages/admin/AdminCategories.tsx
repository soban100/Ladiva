import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, AlertCircle, Loader2, X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { fetchAllCategories, deleteCategory, getCategoryProductCount, createCategory, updateCategory } from '../../services/categoryService';
import type { Category } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface CategoryWithCount extends Category {
  productCount: number;
  status: 'active' | 'inactive';
}

export const AdminCategories = () => {
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [useUrlInput, setUseUrlInput] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [editUseUrlInput, setEditUseUrlInput] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadCategories = async (append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const offset = append ? categories.length : 0;
      const response = await fetchAllCategories(10, offset);

      if (!response.success) {
        setError(response.error || 'Failed to fetch categories');
        if (!append) setCategories([]);
        return;
      }

      const rawCategories = response.data || [];
      const categoriesWithCounts: CategoryWithCount[] = [];

      for (const category of rawCategories) {
        const productCount = await getCategoryProductCount(category.id);
        categoriesWithCounts.push({
          ...category,
          productCount,
          status: 'active'
        });
      }

      if (append) {
        setCategories(prev => [...prev, ...categoriesWithCounts]);
      } else {
        setCategories(categoriesWithCounts);
      }

      setTotalCount(response.totalCount || 0);
      setHasMore(rawCategories.length === 10);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('An unexpected error occurred while fetching categories');
      if (!append) setCategories([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch categories with product counts on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCategory = (categoryId: string, category: CategoryWithCount) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(categoryToDelete.id);
      setError(null);
      
      const response = await deleteCategory(categoryToDelete.id);
      
      if (!response.success) {
        setError(response.error || 'Failed to delete category');
        return;
      }
      
      // Remove category from state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      
      success('Success', `Category "${categoryToDelete.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      
    } catch (err) {
      console.error('Error deleting category:', err);
      toastError('Error', 'An unexpected error occurred while deleting the category');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    setEditingCategoryId(categoryId);
    setEditCategoryName(category.name);
    setEditImageUrl(category.image_url || '');
    setEditImagePreview(category.image_url || '');
    setEditUseUrlInput(true);
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategoryId(null);
    setEditCategoryName('');
    setEditImageUrl('');
    setEditImageFile(null);
    setEditImagePreview('');
    setError(null);
  };

  const handleEditImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Error', 'Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toastError('Error', 'Image size must be less than 5MB');
        return;
      }
      setEditImageFile(file);
      const preview = URL.createObjectURL(file);
      setEditImagePreview(preview);
    }
  };

  const handleSubmitEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategoryId) return;
    
    if (!editCategoryName.trim()) {
      toastError('Error', 'Please enter a category name');
      return;
    }

    if (!editUseUrlInput && !editImageFile) {
      toastError('Error', 'Please select an image file');
      return;
    }

    if (editUseUrlInput && !editImageUrl.trim()) {
      toastError('Error', 'Please enter an image URL');
      return;
    }

    try {
      setEditLoading(true);
      setError(null);

      let finalImageUrl = editImageUrl.trim();

      // If file is uploaded, use placeholder URL
      if (!editUseUrlInput && editImageFile) {
        finalImageUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(editCategoryName)}`;
      }

      // Generate slug from category name
      const slug = editCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const response = await updateCategory(editingCategoryId, {
        name: editCategoryName.trim(),
        slug,
        description: '',
        image_url: finalImageUrl
      });

      if (!response.success) {
        toastError('Error', response.error || 'Failed to update category');
        return;
      }

      success('Success', 'Category updated successfully');
      
      // Refresh categories list
      await loadCategories();

      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating category:', err);
      toastError('Error', 'An unexpected error occurred');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setCategoryName('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setError(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Error', 'Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toastError('Error', 'Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleSubmitAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toastError('Error', 'Please enter a category name');
      return;
    }

    if (!useUrlInput && !imageFile) {
      toastError('Error', 'Please select an image file');
      return;
    }

    if (useUrlInput && !imageUrl.trim()) {
      toastError('Error', 'Please enter an image URL');
      return;
    }

    try {
      setAddLoading(true);
      setError(null);

      let finalImageUrl = imageUrl.trim();

      // If file is uploaded, convert to base64 or use a placeholder
      if (!useUrlInput && imageFile) {
        // For simplicity, we'll use a placeholder URL in production
        // In a real app, you would upload to Supabase Storage or another service
        finalImageUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(categoryName)}`;
      }

      // Generate slug from category name
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const response = await createCategory({
        name: categoryName.trim(),
        slug,
        description: '',
        image_url: finalImageUrl
      });

      if (!response.success) {
        toastError('Error', response.error || 'Failed to create category');
        return;
      }

      success('Success', 'Category created successfully');
      
      // Refresh categories list
      await loadCategories();

      handleCloseModal();
    } catch (err) {
      console.error('Error adding category:', err);
      toastError('Error', 'An unexpected error occurred');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600">Manage product categories and organization</p>
        </div>
        <button 
          onClick={handleAddCategory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Loader2 className="mx-auto w-8 h-8 text-primary-600 animate-spin mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading categories...</h3>
          <p className="text-gray-600">Please wait while we fetch your categories.</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Tag size={20} className="text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">/{category.slug}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{category.productCount} products</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        category.status === 'active' 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditCategory(category.id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deleteLoading === category.id}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id, category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deleteLoading === category.id}
                        >
                          {deleteLoading === category.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!loading && !error && filteredCategories.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {categories.length} of {totalCount || categories.length} categories
          </div>
          {hasMore && (
            <button
              onClick={() => loadCategories(true)}
              disabled={loadingMore}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCategories.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Tag size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {categories.length === 0 ? 'No categories found' : 'No matching categories'}
          </h3>
          <p className="text-gray-600">
            {categories.length === 0 
              ? 'Get started by creating your first category.' 
              : 'Try adjusting your search terms.'
            }
          </p>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Category</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitAddCategory} className="p-6 space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Summer Collection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Image Input Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Source
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseUrlInput(true);
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl border-2 transition-colors ${
                      useUrlInput
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <LinkIcon size={16} className="inline mr-2" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseUrlInput(false);
                      setImageUrl('');
                      setImagePreview('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl border-2 transition-colors ${
                      !useUrlInput
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Upload size={16} className="inline mr-2" />
                    Upload
                  </button>
                </div>
              </div>

              {/* Image URL Input */}
              {useUrlInput ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  {imageUrl && (
                    <div className="mt-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="image-upload"
                      required
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon size={32} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {imageFile ? imageFile.name : 'Click to upload image'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WebP (max 5MB)
                      </span>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={addLoading}
                >
                  {addLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Category</h2>
              <button
                onClick={handleCloseEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitEditCategory} className="p-6 space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="e.g., Summer Collection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Image Input Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Source
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditUseUrlInput(true);
                      setEditImageFile(null);
                      setEditImagePreview(editImageUrl);
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl border-2 transition-colors ${
                      editUseUrlInput
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <LinkIcon size={16} className="inline mr-2" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditUseUrlInput(false);
                      setEditImageUrl('');
                      setEditImagePreview('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl border-2 transition-colors ${
                      !editUseUrlInput
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Upload size={16} className="inline mr-2" />
                    Upload
                  </button>
                </div>
              </div>

              {/* Image URL Input */}
              {editUseUrlInput ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  {editImagePreview && (
                    <div className="mt-2">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleEditImageFileChange}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon size={32} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {editImageFile ? editImageFile.name : 'Click to upload image'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WebP (max 5MB)
                      </span>
                    </label>
                  </div>
                  {editImagePreview && (
                    <div className="mt-2">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Update Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete Category</h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  You are about to delete the category <strong>"{categoryToDelete.name}"</strong>.
                </p>
                {categoryToDelete.productCount > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ This category has {categoryToDelete.productCount} products associated with it.
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={deleteLoading === categoryToDelete.id}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleteLoading === categoryToDelete.id}
                >
                  {deleteLoading === categoryToDelete.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
