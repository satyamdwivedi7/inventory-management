'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Select, Badge, Modal, Spinner, Pagination } from '@/components/ui';
import api from '@/lib/api';
import { formatCurrency, getCategoryLabel, getUnitLabel, TRANSACTION_TYPES } from '@/lib/constants';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    warehouse: '',
    lowStock: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Stock Modal
  const [stockModal, setStockModal] = useState({ open: false, item: null });
  const [stockForm, setStockForm] = useState({
    type: 'IN',
    quantity: '',
    reason: '',
  });
  const [stockLoading, setStockLoading] = useState(false);

  // Add Stock Modal (for new SKU in warehouse)
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    skuId: '',
    warehouse: '',
    type: 'IN',
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invResponse, whResponse, skuResponse] = await Promise.all([
        api.getInventory(filters),
        api.getWarehouses(),
        api.getSKUs({ limit: 100 }),
      ]);

      if (invResponse.success) {
        setInventory(invResponse.data);
        setPagination(invResponse.pagination || { total: 0, page: 1, pages: 1 });
      }
      if (whResponse.success) {
        setWarehouses(whResponse.data);
      }
      if (skuResponse.success) {
        setSKUs(skuResponse.data);
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

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setStockLoading(true);

    try {
      const response = await api.updateStock({
        skuId: stockModal.item.skuId._id,
        warehouse: stockModal.item.warehouse,
        type: stockForm.type,
        quantity: parseInt(stockForm.quantity),
        reason: stockForm.reason,
      });

      if (response.success) {
        setStockModal({ open: false, item: null });
        setStockForm({ type: 'IN', quantity: '', reason: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setStockLoading(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setStockLoading(true);

    try {
      const response = await api.updateStock({
        skuId: addForm.skuId,
        warehouse: addForm.warehouse,
        type: addForm.type,
        quantity: parseInt(addForm.quantity),
        reason: addForm.reason,
      });

      if (response.success) {
        setAddModal(false);
        setAddForm({ skuId: '', warehouse: '', type: 'IN', quantity: '', reason: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setStockLoading(false);
    }
  };

  const openStockModal = (item, type) => {
    setStockForm({ type, quantity: '', reason: '' });
    setStockModal({ open: true, item });
  };

  const getStockStatus = (item) => {
    if (!item.skuId) return { variant: 'default', text: 'Unknown' };
    if (item.quantity === 0) return { variant: 'danger', text: 'Out of Stock' };
    if (item.quantity <= item.skuId.reorderLevel) return { variant: 'warning', text: 'Low Stock' };
    return { variant: 'success', text: 'In Stock' };
  };

  return (
    <DashboardLayout title="Inventory Management">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-48">
              <Select
                label="Warehouse"
                value={filters.warehouse}
                onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                options={warehouses.map(w => ({ value: w.name, label: w.name }))}
                placeholder="All Warehouses"
              />
            </div>
            <div className="w-48">
              <Select
                label="Stock Status"
                value={filters.lowStock}
                onChange={(e) => handleFilterChange('lowStock', e.target.value)}
                options={[
                  { value: 'true', label: 'Low Stock Only' },
                  { value: 'false', label: 'Normal Stock' },
                ]}
                placeholder="All Status"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilters({ warehouse: '', lowStock: '', page: 1 })}
            >
              Clear Filters
            </Button>
            <div className="flex-1" />
            <Button onClick={() => setAddModal(true)}>
              Add Stock Entry
            </Button>
          </div>
        </Card>

        {/* Inventory Table */}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventory.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.skuId?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{item.skuId?.skuCode || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getCategoryLabel(item.skuId?.category)}
                          </td>
                          <td className="px-4 py-3 text-sm">{item.warehouse}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {item.quantity} {getUnitLabel(item.skuId?.unit)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(item.skuId?.unitPrice || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency((item.skuId?.unitPrice || 0) * item.quantity)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={status.variant}>{status.text}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => openStockModal(item, 'IN')}
                              >
                                + In
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => openStockModal(item, 'OUT')}
                                disabled={item.quantity === 0}
                              >
                                - Out
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {inventory.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No inventory items found
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

        {/* Stock Update Modal */}
        <Modal
          isOpen={stockModal.open}
          onClose={() => setStockModal({ open: false, item: null })}
          title={`Stock ${stockForm.type === 'IN' ? 'In' : 'Out'} - ${stockModal.item?.skuId?.name || ''}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setStockModal({ open: false, item: null })}>
                Cancel
              </Button>
              <Button
                variant={stockForm.type === 'IN' ? 'success' : 'danger'}
                onClick={handleStockUpdate}
                loading={stockLoading}
              >
                {stockForm.type === 'IN' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleStockUpdate} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Warehouse: <span className="font-medium">{stockModal.item?.warehouse}</span></p>
              <p className="text-sm text-gray-600">Current Quantity: <span className="font-medium">{stockModal.item?.quantity}</span></p>
            </div>

            <Select
              label="Transaction Type"
              value={stockForm.type}
              onChange={(e) => setStockForm(prev => ({ ...prev, type: e.target.value }))}
              options={TRANSACTION_TYPES}
            />

            <Input
              label="Quantity"
              type="number"
              min="1"
              max={stockForm.type === 'OUT' ? stockModal.item?.quantity : undefined}
              value={stockForm.quantity}
              onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
              required
            />

            <Input
              label="Reason (Optional)"
              value={stockForm.reason}
              onChange={(e) => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason for stock update"
            />
          </form>
        </Modal>

        {/* Add Stock Modal */}
        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          title="Add Stock Entry"
          footer={
            <>
              <Button variant="outline" onClick={() => setAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStock} loading={stockLoading}>
                Add Stock
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddStock} className="space-y-4">
            <Select
              label="SKU"
              value={addForm.skuId}
              onChange={(e) => setAddForm(prev => ({ ...prev, skuId: e.target.value }))}
              options={skus.map(s => ({ value: s._id, label: `${s.skuCode} - ${s.name}` }))}
              placeholder="Select a SKU"
              required
            />

            <Select
              label="Warehouse"
              value={addForm.warehouse}
              onChange={(e) => setAddForm(prev => ({ ...prev, warehouse: e.target.value }))}
              options={warehouses.map(w => ({ value: w.name, label: w.name }))}
              placeholder="Select a warehouse"
              required
            />

            <Select
              label="Transaction Type"
              value={addForm.type}
              onChange={(e) => setAddForm(prev => ({ ...prev, type: e.target.value }))}
              options={TRANSACTION_TYPES}
            />

            <Input
              label="Quantity"
              type="number"
              min="1"
              value={addForm.quantity}
              onChange={(e) => setAddForm(prev => ({ ...prev, quantity: e.target.value }))}
              required
            />

            <Input
              label="Reason (Optional)"
              value={addForm.reason}
              onChange={(e) => setAddForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason for stock entry"
            />
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
