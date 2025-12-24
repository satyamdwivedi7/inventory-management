'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Select, Badge, Spinner, Pagination } from '@/components/ui';
import api from '@/lib/api';
import { formatDateTime, getCategoryLabel, TRANSACTION_TYPES } from '@/lib/constants';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    warehouse: '',
    type: '',
    startDate: '',
    endDate: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filterParams = { ...filters };
      Object.keys(filterParams).forEach(key => {
        if (!filterParams[key]) delete filterParams[key];
      });

      const [txResponse, whResponse] = await Promise.all([
        api.getTransactions(filterParams),
        api.getWarehouses(),
      ]);

      if (txResponse.success) {
        setTransactions(txResponse.data);
        setPagination(txResponse.pagination || { total: 0, page: 1, pages: 1 });
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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      warehouse: '',
      type: '',
      startDate: '',
      endDate: '',
      page: 1,
    });
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'SKU Code', 'SKU Name', 'Category', 'Warehouse', 'Type', 'Quantity', 'Reason', 'Performed By'];
    const rows = transactions.map(tx => [
      formatDateTime(tx.date),
      tx.skuId?.skuCode || 'N/A',
      tx.skuId?.name || 'N/A',
      getCategoryLabel(tx.skuId?.category),
      tx.warehouse,
      tx.type,
      tx.quantity,
      tx.reason || '',
      tx.performedBy?.name || 'N/A',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout title="Transactions">
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
            <div className="w-40">
              <Select
                label="Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                options={TRANSACTION_TYPES}
                placeholder="All Types"
              />
            </div>
            <div className="w-44">
              <Input
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="w-44">
              <Input
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={exportToCSV} disabled={transactions.length === 0}>
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Stock In</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Stock Out</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.quantity, 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Transactions Table */}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDateTime(tx.date)}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{tx.skuId?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{tx.skuId?.skuCode || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{tx.warehouse}</td>
                        <td className="px-4 py-3">
                          <Badge variant={tx.type === 'IN' ? 'success' : 'danger'}>
                            {tx.type === 'IN' ? '↑ IN' : '↓ OUT'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <span className={tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                            {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                          {tx.reason || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {tx.performedBy?.name || 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                          No transactions found
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
      </div>
    </DashboardLayout>
  );
}
