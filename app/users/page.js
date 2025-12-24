'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Select, Badge, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ROLES, formatDate, getRoleLabel } from '@/lib/constants';

export default function UsersPage() {
  const { hasRole, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ role: '', isActive: true });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!hasRole('owner')) {
      setError('Access denied. Only owners can manage users.');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditModal({ open: true, user });
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, user: null });
    setEditForm({ role: '', isActive: true });
  };

  const handleUpdateUser = async () => {
    setEditLoading(true);
    try {
      const response = await api.updateUserRole(editModal.user._id, editForm);
      if (response.success) {
        closeEditModal();
        fetchUsers();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      owner: 'danger',
      manager: 'warning',
      staff: 'info',
    };
    return (
      <Badge variant={variants[role] || 'default'}>
        {getRoleLabel(role)}
      </Badge>
    );
  };

  if (!hasRole('owner')) {
    return (
      <DashboardLayout title="User Management">
        <Card>
          <div className="text-center py-12 text-red-600">
            Access denied. Only owners can manage users.
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Manage user accounts and permissions</p>
          <Badge variant="primary">{users.length} Total Users</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Owners</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'owner').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Managers</p>
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.role === 'manager').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Staff</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'staff').length}
              </p>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                              {user._id === currentUser?._id && (
                                <span className="ml-2 text-xs text-blue-600">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3 text-sm">{user.warehouse || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(user)}
                          disabled={user._id === currentUser?._id}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={editModal.open}
          onClose={closeEditModal}
          title={`Edit User - ${editModal.user?.name}`}
          footer={
            <>
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} loading={editLoading}>
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Email: <span className="font-medium">{editModal.user?.email}</span></p>
            </div>

            <Select
              label="Role"
              value={editForm.role}
              onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              options={ROLES}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={editForm.isActive === true}
                    onChange={() => setEditForm(prev => ({ ...prev, isActive: true }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={editForm.isActive === false}
                    onChange={() => setEditForm(prev => ({ ...prev, isActive: false }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Changing user roles will affect their access permissions immediately.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
