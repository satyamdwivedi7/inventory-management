'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Badge, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDate } from '@/lib/constants';

const emptyWarehouse = {
  name: '',
  location: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
};

export default function WarehousesPage() {
  const { hasRole } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modal, setModal] = useState({ open: false, mode: 'create', data: emptyWarehouse });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, warehouse: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Check if user has access
    if (!hasRole('owner')) {
      setError('Access denied. Only owners can manage warehouses.');
      setLoading(false);
      return;
    }
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await api.getWarehouses();
      if (response.success) {
        setWarehouses(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModal({ open: true, mode: 'create', data: emptyWarehouse });
    setFormError('');
  };

  const openEditModal = (warehouse) => {
    setModal({ open: true, mode: 'edit', data: { ...warehouse } });
    setFormError('');
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'create', data: emptyWarehouse });
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
      let response;
      if (modal.mode === 'create') {
        response = await api.createWarehouse(modal.data);
      } else {
        response = await api.updateWarehouse(modal.data._id, modal.data);
      }

      if (response.success) {
        closeModal();
        fetchWarehouses();
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
      const response = await api.deleteWarehouse(deleteModal.warehouse._id);
      if (response.success) {
        setDeleteModal({ open: false, warehouse: null });
        fetchWarehouses();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!hasRole('owner')) {
    return (
      <DashboardLayout title="Warehouses">
        <Card>
          <div className="text-center py-12 text-red-600">
            Access denied. Only owners can manage warehouses.
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Warehouse Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-gray-600">Manage your warehouse locations</p>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Add Warehouse
          </Button>
        </div>

        {/* Warehouse Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <div className="text-center py-12 text-red-600">{error}</div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {warehouses.map((warehouse) => (
              <Card key={warehouse._id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{warehouse.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{warehouse.location}</p>
                    </div>
                    <Badge variant={warehouse.isActive ? 'success' : 'danger'}>
                      {warehouse.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {warehouse.address && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Address</p>
                      <p className="text-sm text-gray-700">{warehouse.address}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {warehouse.contactPerson && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Contact</p>
                        <p className="text-sm text-gray-700">{warehouse.contactPerson}</p>
                      </div>
                    )}
                    {warehouse.contactPhone && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Phone</p>
                        <p className="text-sm text-gray-700">{warehouse.contactPhone}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(warehouse.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(warehouse)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDeleteModal({ open: true, warehouse })}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {warehouses.length === 0 && (
              <Card className="col-span-full">
                <div className="text-center py-12 text-gray-500">
                  <p>No warehouses found</p>
                  <Button className="mt-4" onClick={openCreateModal}>
                    Add Your First Warehouse
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modal.open}
          onClose={closeModal}
          title={modal.mode === 'create' ? 'Add New Warehouse' : 'Edit Warehouse'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={formLoading}>
                {modal.mode === 'create' ? 'Create Warehouse' : 'Save Changes'}
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

            <Input
              label="Warehouse Name"
              name="name"
              value={modal.data.name}
              onChange={handleFormChange}
              placeholder="e.g., Main Warehouse"
              required
            />

            <Input
              label="Location"
              name="location"
              value={modal.data.location}
              onChange={handleFormChange}
              placeholder="e.g., Mumbai, Maharashtra"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={modal.data.address}
                onChange={handleFormChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full address..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Person"
                name="contactPerson"
                value={modal.data.contactPerson}
                onChange={handleFormChange}
                placeholder="Name"
              />

              <Input
                label="Contact Phone"
                name="contactPhone"
                value={modal.data.contactPhone}
                onChange={handleFormChange}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, warehouse: null })}
          title="Delete Warehouse"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, warehouse: null })}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-medium">{deleteModal.warehouse?.name}</span>?
            This will remove all associated inventory data. This action cannot be undone.
          </p>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
