'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Select, Badge, Spinner } from '@/components/ui';
import api from '@/lib/api';
import { formatCurrency, formatDate, getCategoryLabel } from '@/lib/constants';

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState({ alerts: [], totalAlerts: 0 });
  const [deadStock, setDeadStock] = useState({ alerts: [], totalItems: 0, totalValueBlocked: 0 });
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lowStock');
  
  // Filters
  const [filters, setFilters] = useState({
    warehouse: '',
    days: 30,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.warehouse) filterParams.warehouse = filters.warehouse;
      if (filters.days) filterParams.days = filters.days;

      const [lowResponse, deadResponse, whResponse] = await Promise.all([
        api.getLowStockAlerts(filterParams),
        api.getDeadStockAlerts(filterParams),
        api.getWarehouses(),
      ]);

      if (lowResponse.success) {
        setLowStock(lowResponse.data);
      }
      if (deadResponse.success) {
        setDeadStock(deadResponse.data);
      }
      if (whResponse.success) {
        setWarehouses(whResponse.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'default',
    };
    return (
      <Badge variant={variants[severity] || 'default'}>
        {severity?.toUpperCase()}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Alerts">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-orange-600">{lowStock.totalAlerts || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600">{lowStock.criticalCount || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Dead Stock Items</p>
              <p className="text-3xl font-bold text-gray-600">{deadStock.totalItems || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Value Blocked</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(deadStock.totalValueBlocked || 0)}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-48">
              <Select
                label="Warehouse"
                value={filters.warehouse}
                onChange={(e) => setFilters(prev => ({ ...prev, warehouse: e.target.value }))}
                options={warehouses.map(w => ({ value: w.name, label: w.name }))}
                placeholder="All Warehouses"
              />
            </div>
            <div className="w-48">
              <Select
                label="Dead Stock Threshold"
                value={filters.days.toString()}
                onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                options={[
                  { value: '7', label: '7 days' },
                  { value: '14', label: '14 days' },
                  { value: '30', label: '30 days' },
                  { value: '60', label: '60 days' },
                  { value: '90', label: '90 days' },
                ]}
              />
            </div>
            <Button variant="outline" onClick={() => setFilters({ warehouse: '', days: 30 })}>
              Clear
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'lowStock'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('lowStock')}
          >
            Low Stock ({lowStock.totalAlerts || 0})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'deadStock'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('deadStock')}
          >
            Dead Stock ({deadStock.totalItems || 0})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <div className="text-center py-12 text-red-600">{error}</div>
          </Card>
        ) : (
          <>
            {/* Low Stock Tab */}
            {activeTab === 'lowStock' && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deficit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lowStock.alerts?.map((alert, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{alert.sku?.name}</p>
                              <p className="text-xs text-gray-500">{alert.sku?.skuCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getCategoryLabel(alert.sku?.category)}
                          </td>
                          <td className="px-4 py-3 text-sm">{alert.warehouse}</td>
                          <td className="px-4 py-3 text-sm font-medium text-red-600">
                            {alert.currentQuantity}
                          </td>
                          <td className="px-4 py-3 text-sm">{alert.reorderLevel}</td>
                          <td className="px-4 py-3 text-sm font-medium text-orange-600">
                            -{alert.deficit}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={alert.status === 'OUT_OF_STOCK' ? 'danger' : 'warning'}>
                              {alert.status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{getSeverityBadge(alert.severity)}</td>
                        </tr>
                      ))}
                      {(!lowStock.alerts || lowStock.alerts.length === 0) && (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                            🎉 No low stock alerts - All items are well stocked!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Dead Stock Tab */}
            {activeTab === 'deadStock' && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value Blocked</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Movement</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Since</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deadStock.alerts?.map((alert, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{alert.sku?.name}</p>
                              <p className="text-xs text-gray-500">{alert.sku?.skuCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {getCategoryLabel(alert.sku?.category)}
                          </td>
                          <td className="px-4 py-3 text-sm">{alert.warehouse}</td>
                          <td className="px-4 py-3 text-sm font-medium">{alert.quantity}</td>
                          <td className="px-4 py-3 text-sm font-medium text-purple-600">
                            {formatCurrency(alert.valueBlocked)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {alert.lastMovementDate ? formatDate(alert.lastMovementDate) : 'Never'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="warning">{alert.daysSinceMovement} days</Badge>
                          </td>
                        </tr>
                      ))}
                      {(!deadStock.alerts || deadStock.alerts.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                            🎉 No dead stock - All inventory is moving!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
