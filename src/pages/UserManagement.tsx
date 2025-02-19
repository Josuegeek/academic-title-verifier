import React, { useEffect, useState } from 'react';
import { Edit2,Search, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface UserProfile {
  id: string;
  role: 'admin' | 'university_staff' | 'verifier'| 'esu_staff';
  nom: string;
  postnom: string;
  prenom: string;
  email: string;
  universite_id: string | null;
  created_at: string;
}

interface UserManagementProps {
  profile: Profile | null;
}

export function UserManagement({ profile }: UserManagementProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate(-1);
    }
  }, [profile, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(data);
      setError(null);
      // Flatten the structure to include email directly in the profile
      const usersWithEmail = data.map((profile: any) => ({
        ...profile,
        email: profile?.email || 'N/A', // Access email from auth.users
      }));
      setUsers(usersWithEmail as UserProfile[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('profiles')
        .update({ role: editingUser.role, universite_id: editingUser.universite_id })
        .eq('id', editingUser.id);

      if (error) throw error;
      setEditingUser(null);
      fetchUsers();
      toast.success('Utilisateur mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Erreur lors de la mise à jour de l\'utilisateur');
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchString = searchTerm.toLowerCase();
    return user.nom?.toLowerCase().includes(searchString) ||
      user.postnom?.toLowerCase().includes(searchString) ||
      user.prenom?.toLowerCase().includes(searchString) ||
      user.email?.toLowerCase().includes(searchString) ||
      user.role?.toLowerCase().includes(searchString);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <div className='flex gap-1'>
          <button
            onClick={() => fetchUsers()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Loader className="h-5 w-5" />
            
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Rechercher un utilisateur..."
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Noms
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date de création
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{`${user.nom} ${user.postnom} ${user.prenom}`}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser?.id === user.id ? (
                              <select
                                value={editingUser.role}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    role: e.target.value as 'admin' | 'university_staff' | 'verifier',
                                  })
                                }
                                className="p-2 border border-blue-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md"
                              >
                                <option value="admin">Admin</option>
                                <option value="university_staff">Agent de l'université</option>
                                <option value="esu_staff">Ministère de l'ESU</option>
                                <option value="verifier">Visiteur</option>
                              </select>
                            ) : (
                              <div className="text-sm text-gray-900">{user.role}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingUser?.id === user.id ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleUpdateUser}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? <div className="h-4 w-4 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" /> : <div className='flex items-center gap-1 text-white bg-blue-600 p-1 border rounded-lg'><Edit2 className="w-4" />Modifier</div>}
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="p-1 border rounded-lg text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
