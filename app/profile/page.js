'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Select, Badge, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDate, getRoleLabel } from '@/lib/constants';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', warehouse: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileResponse, whResponse] = await Promise.all([
        api.getProfile(),
        api.getWarehouses(),
      ]);

      if (profileResponse.success) {
        setProfileData(profileResponse.data);
        setFormData({
          name: profileResponse.data.name || '',
          warehouse: profileResponse.data.warehouse || '',
        });
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.updateProfile(formData);
      if (response.success) {
        setProfileData(response.data);
        updateUser(response.data);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData?.name || '',
      warehouse: profileData?.warehouse || '',
    });
    setIsEditing(false);
    setError('');
  };

  const getRoleBadge = (role) => {
    const variants = {
      owner: 'danger',
      manager: 'warning',
      staff: 'info',
    };
    return (
      <Badge variant={variants[role] || 'default'} size="lg">
        {getRoleLabel(role)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Profile">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0">
              {profileData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profileData?.name}</h2>
              <p className="text-gray-500 text-sm sm:text-base">{profileData?.email}</p>
              <div className="mt-2">{getRoleBadge(profileData?.role)}</div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                Edit Profile
              </Button>
            )}
          </div>
        </Card>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Profile Details */}
        <Card title="Profile Information">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Your full name"
              />

              <Select
                label="Assigned Warehouse"
                name="warehouse"
                value={formData.warehouse}
                onChange={handleFormChange}
                options={warehouses.map(w => ({ value: w.name, label: w.name }))}
                placeholder="Select a warehouse"
              />

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button onClick={handleSave} loading={saveLoading} className="w-full sm:w-auto">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{profileData?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profileData?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{getRoleLabel(profileData?.role)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Warehouse</p>
                  <p className="font-medium">{profileData?.warehouse || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <Badge variant={profileData?.isActive ? 'success' : 'danger'}>
                    {profileData?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(profileData?.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Role Permissions */}
        <Card title="Your Permissions">
          <div className="space-y-3">
            {profileData?.role === 'owner' && (
              <>
                <PermissionItem label="Full access to all features" allowed />
                <PermissionItem label="Manage users and roles" allowed />
                <PermissionItem label="Manage warehouses" allowed />
                <PermissionItem label="Manage SKUs (Create, Edit, Delete)" allowed />
                <PermissionItem label="View analytics and reports" allowed />
                <PermissionItem label="Update inventory" allowed />
              </>
            )}
            {profileData?.role === 'manager' && (
              <>
                <PermissionItem label="Manage users and roles" allowed={false} />
                <PermissionItem label="Manage warehouses" allowed={false} />
                <PermissionItem label="Manage SKUs (Create, Edit)" allowed />
                <PermissionItem label="Delete SKUs" allowed={false} />
                <PermissionItem label="View analytics and reports" allowed />
                <PermissionItem label="Update inventory" allowed />
                <PermissionItem label="Set inventory levels" allowed />
              </>
            )}
            {profileData?.role === 'staff' && (
              <>
                <PermissionItem label="Manage users and roles" allowed={false} />
                <PermissionItem label="Manage warehouses" allowed={false} />
                <PermissionItem label="Manage SKUs" allowed={false} />
                <PermissionItem label="View analytics and reports" allowed={false} />
                <PermissionItem label="View dashboard" allowed />
                <PermissionItem label="View inventory" allowed />
                <PermissionItem label="Update stock (In/Out)" allowed />
                <PermissionItem label="View transactions" allowed />
                <PermissionItem label="View alerts" allowed />
              </>
            )}
          </div>
        </Card>

        {/* Account Actions */}
        <Card title="Account Actions">
          <div className="flex gap-3">
            <Button variant="danger" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function PermissionItem({ label, allowed }) {
  return (
    <div className="flex items-center gap-3">
      {allowed ? (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className={allowed ? 'text-gray-900' : 'text-gray-400'}>{label}</span>
    </div>
  );
}
