import { useState, useEffect } from 'react';
import { X, Upload, Package, Banknote, FileText, Tag } from 'lucide-react';
import { createProduct, getCategories } from '../services/productService';
import type { ProductFormData, Category } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAppSelector } from '../store/hooks';

interface ProductCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
}

export const ProductCreationForm: React.FC<ProductCreationFormProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const { success, error } = useToast();
  const user = useAppSelector(state => state.auth.user);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    image_url: '',
    stock: undefined, // undefined means unlimited stock
    discount_price: undefined,
    sizes: [],
    colors: [],
    is_featured: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          error('Error', 'Failed to load categories');
        }
      } catch (err) {
        error('Error', 'Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, error]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.image_url.trim()) {
      newErrors.image_url = 'Product image is required';
    }

    if (formData.stock !== undefined && formData.stock !== null && formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (formData.discount_price !== undefined && formData.discount_price < 0) {
      newErrors.discount_price = 'Discount price cannot be negative';
    }

    if (formData.discount_price && formData.discount_price >= formData.price) {
      newErrors.discount_price = 'Discount price must be less than regular price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image_url: 'Please select an image file' }));
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image_url: 'Image size should be less than 5MB' }));
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev: ProductFormData) => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
      
      // Clear any existing image error
      if (errors.image_url) {
        setErrors((prev: Record<string, string>) => ({ ...prev, image_url: '' }));
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData((prev: ProductFormData) => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated and is admin
    if (!user) {
      error('Authentication Required', 'Please login to add products');
      return;
    }

    if (!user.is_admin) {
      error('Permission Denied', 'Only administrators can add products');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log('🛍️ Submitting product form:', formData);

      const result = await createProduct(formData);

      if (result.success) {
        success('Success', 'Product added successfully');
        handleClose();
        onProductCreated?.();
      } else {
        error('Failed to add product', result.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('❌ Form submission error:', err);
      error('Failed to add product', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category_id: '',
      image_url: '',
      stock: undefined, // undefined means unlimited stock
      discount_price: undefined,
      sizes: [],
      colors: [],
      is_featured: false,
    });
    setSelectedFile(null);
    setImagePreview('');
    setErrors({});
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'number') {
      // Handle discount_price and stock specially - empty should be undefined
      if (name === 'discount_price' || name === 'stock') {
        processedValue = value === '' ? undefined : parseFloat(value) || undefined;
      } else {
        processedValue = parseFloat(value) || 0;
      }
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev: ProductFormData) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product description"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Category and Price - Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Banknote className="w-4 h-4" />
                Price (Rs.) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Stock and Discount Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity <span className="text-gray-400 font-normal">(leave empty for unlimited stock)</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock || ''}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Leave empty for unlimited stock"
                disabled={isSubmitting}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Price (Rs.)
              </label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.discount_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Optional"
                disabled={isSubmitting}
              />
              {errors.discount_price && (
                <p className="mt-1 text-sm text-red-600">{errors.discount_price}</p>
              )}
            </div>
          </div>

          {/* Sizes and Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Sizes (comma-separated)
              </label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes?.join(', ') || ''}
                onChange={(e) => {
                  const sizes = e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                  setFormData((prev: ProductFormData) => ({ ...prev, sizes }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., S, M, L, XL"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">Enter sizes separated by commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Colors (comma-separated)
              </label>
              <input
                type="text"
                name="colors"
                value={formData.colors?.join(', ') || ''}
                onChange={(e) => {
                  const colors = e.target.value.split(',').map((c: string) => c.trim()).filter((c: string) => c !== '');
                  setFormData((prev: ProductFormData) => ({ ...prev, colors }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Red, Blue, Green"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">Enter colors separated by commas</p>
            </div>
          </div>

          {/* Featured Product */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_featured"
              id="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
              Feature this product on the homepage
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image *
            </label>
            <div className="space-y-3">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedFile?.name}
                  </div>
                </div>
              )}
              {errors.image_url && (
                <p className="text-sm text-red-600">{errors.image_url}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
