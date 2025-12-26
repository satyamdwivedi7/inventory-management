'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Select, Badge, Modal, Spinner, Pagination } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { CATEGORIES, UNITS, formatCurrency, getCategoryLabel, getUnitLabel } from '@/lib/constants';

const emptySKU = {
  name: '',
  skuCode: '',
  category: 'other',
  description: '',
  reorderLevel: 10,
  unitPrice: 0,
  unit: 'pcs',
};

export default function SKUPage() {
  const { hasPermission } = useAuth();
  const [skus, setSKUs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Modal state
  const [modal, setModal] = useState({ open: false, mode: 'create', data: emptySKU });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, sku: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchSKUs();
  }, [filters]);

  const fetchSKUs = async () => {
    setLoading(true);
    try {
      const response = await api.getSKUs(filters);
      if (response.success) {
        setSKUs(response.data);
        setPagination(response.pagination || { total: 0, page: 1, pages: 1 });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const openCreateModal = () => {
    setModal({ open: true, mode: 'create', data: emptySKU });
    setFormError('');
  };

  const openEditModal = (sku) => {
    setModal({ open: true, mode: 'edit', data: { ...sku } });
    setFormError('');
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'create', data: emptySKU });
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setModal(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const formData = {
        ...modal.data,
        reorderLevel: parseInt(modal.data.reorderLevel),
        unitPrice: parseFloat(modal.data.unitPrice),
      };

      let response;
      if (modal.mode === 'create') {
        response = await api.createSKU(formData);
      } else {
        response = await api.updateSKU(modal.data._id, formData);
      }

      if (response.success) {
        closeModal();
        fetchSKUs();
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await api.deleteSKU(deleteModal.sku._id);
      if (response.success) {
        setDeleteModal({ open: false, sku: null });
        fetchSKUs();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout title="SKU Management">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 sm:items-end">
            <div className="w-full sm:flex-1 sm:min-w-[200px]">
              <Input
                label="Search"
                placeholder="Search by name or code..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={CATEGORIES}
                placeholder="All Categories"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto sm:flex-1 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ search: '', category: '', page: 1 })}
                className="flex-1 sm:flex-none"
              >
                Clear
              </Button>
              {hasPermission('canManageSKUs') && (
                <Button onClick={openCreateModal} className="flex-1 sm:flex-none">
                  Create SKU
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* SKU Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      {hasPermission('canManageSKUs') && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {skus.map((sku) => (
                      <tr key={sku._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-blue-600">
                          {sku.skuCode}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sku.name}</p>
                            {sku.description && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">{sku.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="info">{getCategoryLabel(sku.category)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{getUnitLabel(sku.unit)}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatCurrency(sku.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm">{sku.reorderLevel}</td>
                        <td className="px-4 py-3">
                          <Badge variant={sku.isActive ? 'success' : 'danger'}>
                            {sku.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        {hasPermission('canManageSKUs') && (
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(sku)}
                              >
                                Edit
                              </Button>
                              {hasPermission('canDeleteSKUs') && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setDeleteModal({ open: true, sku })}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {skus.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No SKUs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            </>
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modal.open}
          onClose={closeModal}
          title={modal.mode === 'create' ? 'Create New SKU' : 'Edit SKU'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={formLoading}>
                {modal.mode === 'create' ? 'Create SKU' : 'Save Changes'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SKU Code"
                name="skuCode"
                value={modal.data.skuCode}
                onChange={handleFormChange}
                placeholder="e.g., TILE-001"
                required
                disabled={modal.mode === 'edit'}
              />

              <Input
                label="Name"
                name="name"
                value={modal.data.name}
                onChange={handleFormChange}
                placeholder="Product name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                name="category"
                value={modal.data.category}
                onChange={handleFormChange}
                options={CATEGORIES}
                required
              />

              <Select
                label="Unit"
                name="unit"
                value={modal.data.unit}
                onChange={handleFormChange}
                options={UNITS}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Unit Price (₹)"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={modal.data.unitPrice}
                onChange={handleFormChange}
                required
              />

              <Input
                label="Reorder Level"
                name="reorderLevel"
                type="number"
                min="0"
                value={modal.data.reorderLevel}
                onChange={handleFormChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={modal.data.description}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description..."
              />
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, sku: null })}
          title="Delete SKU"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, sku: null })}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-medium">{deleteModal.sku?.name}</span>?
            This action cannot be undone.
          </p>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
