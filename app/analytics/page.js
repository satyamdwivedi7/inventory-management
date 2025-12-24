'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Select, Badge, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatCurrency, getCategoryLabel, CATEGORIES } from '@/lib/constants';

export default function AnalyticsPage() {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('performance');
  
  // Data
  const [skuPerformance, setSKUPerformance] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [stockAging, setStockAging] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    days: 30,
    category: '',
    warehouse: '',
  });

  useEffect(() => {
    if (!hasRole(['owner', 'manager'])) {
      setError('Access denied. Only owners and managers can view analytics.');
      setLoading(false);
      return;
    }
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.days) filterParams.days = filters.days;
      if (filters.category) filterParams.category = filters.category;
      if (filters.warehouse) filterParams.warehouse = filters.warehouse;

      const [perfResponse, valueResponse, agingResponse, whResponse] = await Promise.all([
        api.getSKUPerformance(filterParams),
        api.getInventoryValue(filterParams),
        api.getStockAging(filterParams),
        api.getWarehouses(),
      ]);

      if (perfResponse.success) setSKUPerformance(perfResponse.data);
      if (valueResponse.success) setInventoryValue(valueResponse.data);
      if (agingResponse.success) setStockAging(agingResponse.data);
      if (whResponse.success) setWarehouses(whResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole(['owner', 'manager'])) {
    return (
      <DashboardLayout title="Analytics">
        <Card>
          <div className="text-center py-12 text-red-600">
            Access denied. Only owners and managers can view analytics.
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-40">
              <Select
                label="Period"
                value={filters.days.toString()}
                onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                options={[
                  { value: '7', label: 'Last 7 days' },
                  { value: '14', label: 'Last 14 days' },
                  { value: '30', label: 'Last 30 days' },
                  { value: '60', label: 'Last 60 days' },
                  { value: '90', label: 'Last 90 days' },
                ]}
              />
            </div>
            <div className="w-48">
              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                options={CATEGORIES}
                placeholder="All Categories"
              />
            </div>
            <div className="w-48">
              <Select
                label="Warehouse"
                value={filters.warehouse}
                onChange={(e) => setFilters(prev => ({ ...prev, warehouse: e.target.value }))}
                options={warehouses.map(w => ({ value: w.name, label: w.name }))}
                placeholder="All Warehouses"
              />
            </div>
            <Button variant="outline" onClick={() => setFilters({ days: 30, category: '', warehouse: '' })}>
              Clear
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            SKU Performance
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'value'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('value')}
          >
            Inventory Value
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'aging'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('aging')}
          >
            Stock Aging
          </button>
        </div>

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
            {/* SKU Performance Tab */}
            {activeTab === 'performance' && skuPerformance && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total SKUs</p>
                      <p className="text-2xl font-bold">{skuPerformance.summary?.totalSKUs || 0}</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Fast Moving</p>
                      <p className="text-2xl font-bold text-green-600">{skuPerformance.summary?.fastMovingCount || 0}</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Slow Moving</p>
                      <p className="text-2xl font-bold text-yellow-600">{skuPerformance.summary?.slowMovingCount || 0}</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">No Movement</p>
                      <p className="text-2xl font-bold text-red-600">{skuPerformance.summary?.noMovementCount || 0}</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Avg Movement</p>
                      <p className="text-2xl font-bold">{skuPerformance.summary?.averageMovement?.toFixed(1) || 0}</p>
                    </div>
                  </Card>
                </div>

                {/* Fast Moving */}
                <Card title="🚀 Fast Moving SKUs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total In</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Out</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movement Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {skuPerformance.fastMoving?.slice(0, 10).map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{item.sku?.name}</p>
                                <p className="text-xs text-gray-500">{item.sku?.skuCode}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{getCategoryLabel(item.sku?.category)}</td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium">+{item.totalIn}</td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium">-{item.totalOut}</td>
                            <td className="px-4 py-3 text-sm">{item.transactionCount}</td>
                            <td className="px-4 py-3">
                              <Badge variant="success">{item.movementScore?.toFixed(1)}</Badge>
                            </td>
                          </tr>
                        ))}
                        {(!skuPerformance.fastMoving || skuPerformance.fastMoving.length === 0) && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              No fast-moving SKUs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Slow Moving */}
                <Card title="🐢 Slow Moving SKUs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total In</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Out</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movement Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {skuPerformance.slowMoving?.slice(0, 10).map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{item.sku?.name}</p>
                                <p className="text-xs text-gray-500">{item.sku?.skuCode}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{getCategoryLabel(item.sku?.category)}</td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium">+{item.totalIn}</td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium">-{item.totalOut}</td>
                            <td className="px-4 py-3 text-sm">{item.transactionCount}</td>
                            <td className="px-4 py-3">
                              <Badge variant="warning">{item.movementScore?.toFixed(1)}</Badge>
                            </td>
                          </tr>
                        ))}
                        {(!skuPerformance.slowMoving || skuPerformance.slowMoving.length === 0) && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              No slow-moving SKUs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Inventory Value Tab */}
            {activeTab === 'value' && inventoryValue && (
              <div className="space-y-6">
                {/* Overall Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Inventory Value</p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(inventoryValue.overall?.totalValue || 0)}
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Quantity</p>
                      <p className="text-3xl font-bold">
                        {(inventoryValue.overall?.totalQuantity || 0).toLocaleString()}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* By Category */}
                <Card title="Value by Category">
                  <div className="space-y-4">
                    {inventoryValue.byCategory?.map((item) => {
                      const percentage = inventoryValue.overall?.totalValue
                        ? ((item.totalValue / inventoryValue.overall.totalValue) * 100).toFixed(1)
                        : 0;
                      return (
                        <div key={item._id} className="flex items-center">
                          <div className="w-32 font-medium">{getCategoryLabel(item._id)}</div>
                          <div className="flex-1 mx-4">
                            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-32 text-right font-medium">{formatCurrency(item.totalValue)}</div>
                          <div className="w-16 text-right text-gray-500">{percentage}%</div>
                        </div>
                      );
                    })}
                    {(!inventoryValue.byCategory || inventoryValue.byCategory.length === 0) && (
                      <p className="text-center text-gray-500 py-4">No category data available</p>
                    )}
                  </div>
                </Card>

                {/* By Warehouse */}
                <Card title="Value by Warehouse">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventoryValue.byWarehouse?.map((item) => (
                      <div key={item._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900">{item._id}</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(item.totalValue)}</p>
                          <p className="text-sm text-gray-500">
                            {item.itemCount} items • {item.totalQuantity?.toLocaleString()} units
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!inventoryValue.byWarehouse || inventoryValue.byWarehouse.length === 0) && (
                      <p className="text-center text-gray-500 py-4 col-span-full">No warehouse data available</p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Stock Aging Tab */}
            {activeTab === 'aging' && stockAging && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { key: 'fresh', label: '🟢 Fresh (0-7 days)', color: 'text-green-600' },
                    { key: 'aging', label: '🟡 Aging (8-30 days)', color: 'text-yellow-600' },
                    { key: 'old', label: '🟠 Old (31-60 days)', color: 'text-orange-600' },
                    { key: 'deadStock', label: '🔴 Dead Stock (60+ days)', color: 'text-red-600' },
                  ].map(({ key, label, color }) => (
                    <Card key={key}>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>
                          {stockAging.summary?.[key]?.count || 0} items
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatCurrency(stockAging.summary?.[key]?.totalValue || 0)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Detailed Tables */}
                {['fresh', 'aging', 'old', 'deadStock'].map((category) => {
                  const items = stockAging.details?.[category]?.items || [];
                  const label = stockAging.details?.[category]?.label || category;
                  if (items.length === 0) return null;
                  
                  return (
                    <Card key={category} title={`${label} - ${items.length} items`}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Since Movement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {items.slice(0, 5).map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="font-medium">{item.sku?.name}</p>
                                    <p className="text-xs text-gray-500">{item.sku?.skuCode}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{item.warehouse}</td>
                                <td className="px-4 py-3 text-sm">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(item.value)}</td>
                                <td className="px-4 py-3">
                                  <Badge variant={category === 'deadStock' ? 'danger' : category === 'old' ? 'warning' : 'default'}>
                                    {item.daysSinceMovement} days
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
