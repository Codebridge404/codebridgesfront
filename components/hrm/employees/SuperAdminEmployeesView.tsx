/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0146
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  UserPlus,
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getEmployeesApi,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
  getDepartmentsApi,
  getOutletsApi,
} from '@/lib/api';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeMetricsCards } from './EmployeeMetricsCards';
import { EmployeeCardGrid } from './EmployeeCardGrid';
import { UserDetailModal } from '@/components/security/users/UserDetailModal';

export const SuperAdminEmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    outlet_id: '',
    designation: 'Cashier',
    employment_type: 'Full-time',
    salary: '450',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadEmployees();
    loadOptions();
  }, [selectedDept]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await getEmployeesApi(
        selectedDept ? parseInt(selectedDept, 10) : undefined,
        search || undefined
      );
      setEmployees(res.data || []);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [deptRes, outletRes] = await Promise.all([getDepartmentsApi(), getOutletsApi()]);
      setDepartments(deptRes.data || []);
      setOutlets(outletRes.data || []);
    } catch (err: any) {
      console.error('Failed to load HRM options:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmployees();
  };

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department_id: departments[0]?.id ? departments[0].id.toString() : '',
      outlet_id: outlets[0]?.id ? outlets[0].id.toString() : '',
      designation: 'Cashier',
      employment_type: 'Full-time',
      salary: '450',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email || '',
      phone: emp.phone || '',
      department_id: emp.department_id ? emp.department_id.toString() : '',
      outlet_id: emp.outlet_id ? emp.outlet_id.toString() : '',
      designation: emp.designation || 'Staff Member',
      employment_type: emp.employment_type || 'Full-time',
      salary: emp.salary ? emp.salary.toString() : '0',
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotification(null);

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department_id ? parseInt(formData.department_id, 10) : undefined,
        outlet_id: formData.outlet_id ? parseInt(formData.outlet_id, 10) : undefined,
        designation: formData.designation,
        employment_type: formData.employment_type,
        salary: parseFloat(formData.salary) || 0,
      };

      if (editingEmployee) {
        await updateEmployeeApi(editingEmployee.id, payload);
        setNotification({ type: 'success', message: 'Employee profile updated' });
      } else {
        await createEmployeeApi(payload);
        setNotification({ type: 'success', message: 'New employee onboarded' });
      }

      setIsModalOpen(false);
      loadEmployees();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Operation failed. Check server connection.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async (emp: any) => {
    if (!confirm(`Are you sure you want to terminate/remove "${emp.first_name} ${emp.last_name}"?`)) return;

    try {
      setLoading(true);
      await deleteEmployeeApi(emp.id);
      setNotification({ type: 'success', message: 'Employee removed from records' });
      loadEmployees();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to remove employee.',
      });
      setLoading(false);
    }
  };

  const totalEmployees = employees.length;
  const activeStaff = employees.filter((e) => e.status === 'active').length;
  const totalPayroll = employees.reduce((acc, curr) => acc + (parseFloat(curr.salary) || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-brand" />
            Human Resources &amp; Employee Directory
          </h1>
          <p className="text-xs text-slate-500">
            Track staff profiles, payroll allocations, departmental structures, and store placement
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Onboard New Employee
        </motion.button>
      </motion.div>

      {/* Metrics Cards */}
      <EmployeeMetricsCards
        totalEmployees={totalEmployees}
        activeStaff={activeStaff}
        totalPayroll={totalPayroll}
      />

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Department Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            Department:
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <EmployeeCardGrid
        employees={employees}
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteEmployee}
        onView={(emp) => setViewingEmployee(emp)}
      />

      {/* Employee Profile Preview Modal */}
      {viewingEmployee && (
        <UserDetailModal
          user={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          onEdit={(emp) => {
            setViewingEmployee(null);
            handleOpenEditModal(emp);
          }}
          onDelete={(emp) => {
            handleDeleteEmployee(emp);
          }}
        />
      )}

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingEmployee={editingEmployee}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveEmployee}
        saving={saving}
        departments={departments}
        outlets={outlets}
      />
    </div>
  );
};
