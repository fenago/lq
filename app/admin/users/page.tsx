"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/libs/supabase";
import toast from "react-hot-toast";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  platform_role: string | null;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("users")
      .select("id, email, full_name, platform_role, created_at")
      .order("created_at", { ascending: false });

    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    const supabase = createClient();
    const roleValue = selectedRole === "none" ? null : selectedRole;

    const { error } = await supabase
      .from("users")
      .update({ platform_role: roleValue })
      .eq("id", editingUser.id);

    if (error) {
      toast.error("Failed to update user role");
      console.error(error);
    } else {
      toast.success("User role updated successfully");
      setEditingUser(null);
      fetchUsers();
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.platform_role || "none");
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <span className="badge badge-ghost">Regular User</span>;
    if (role === "super_admin") return <span className="badge badge-primary">Super Admin</span>;
    if (role === "platform_admin") return <span className="badge badge-secondary">Platform Admin</span>;
    return <span className="badge">{role}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-base-content/60 mt-1">
            Manage platform users and their roles
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-base-100 rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <button onClick={fetchUsers} className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-base-100 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-medium text-primary">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.full_name || user.email?.split("@")[0] || "Unknown"}
                          </p>
                          <p className="text-xs text-base-content/60">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.platform_role)}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => openEditModal(user)}
                        className="btn btn-ghost btn-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit User Role</h3>
            <p className="py-2 text-base-content/60">
              Update the platform role for{" "}
              <span className="font-medium">{editingUser.email}</span>
            </p>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Platform Role</span>
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="none">Regular User (No Role)</option>
                <option value="platform_admin">Platform Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Super Admins have full access. Platform Admins can manage content.
                </span>
              </label>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setEditingUser(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setEditingUser(null)}
          ></div>
        </div>
      )}
    </div>
  );
}
