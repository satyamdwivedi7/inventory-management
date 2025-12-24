'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Badge, Spinner } from '@/components/ui';
import api from '@/lib/api';
import { formatCurrency, formatDateTime, getCategoryLabel } from '@/lib/constants';

function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">{icon}</div>
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </span>
        </div>
      )}
    </Card>
  );
}

function AlertCard({ type, count, severity }) {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[severity] || colors.medium}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{type}</span>
        <span className="text-xl font-bold">{count}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.getDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="text-center py-12 text-red-600">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total SKUs"
            value={data?.overview?.totalSKUs || 0}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <StatCard
            title="Inventory Items"
            value={data?.overview?.totalInventoryItems || 0}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatCard
            title="Total Quantity"
            value={data?.overview?.totalQuantity?.toLocaleString() || 0}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(data?.overview?.totalValue || 0)}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Alerts Section */}
        <Card title="Alerts Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AlertCard
              type="Low Stock Items"
              count={data?.alerts?.lowStock || 0}
              severity="high"
            />
            <AlertCard
              type="Out of Stock"
              count={data?.alerts?.outOfStock || 0}
              severity="critical"
            />
            <AlertCard
              type="Dead Stock"
              count={data?.alerts?.deadStock || 0}
              severity="medium"
            />
          </div>
        </Card>

        {/* Warehouse Summary */}
        <Card title="Warehouse Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.warehouses?.map((warehouse) => (
              <div
                key={warehouse._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h4 className="font-medium text-gray-900">{warehouse._id}</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Items: <span className="font-medium">{warehouse.itemCount}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: <span className="font-medium">{warehouse.totalQuantity?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
            {(!data?.warehouses || data.warehouses.length === 0) && (
              <p className="text-gray-500 col-span-full">No warehouses found</p>
            )}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card title="Recent Transactions">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.recentTransactions?.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{tx.skuId?.name}</p>
                        <p className="text-gray-500 text-xs">{tx.skuId?.skuCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{tx.warehouse}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={tx.type === 'IN' ? 'success' : 'danger'}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{tx.quantity}</td>
                    <td className="px-4 py-3 text-sm">{tx.performedBy?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(tx.date)}</td>
                  </tr>
                ))}
                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
