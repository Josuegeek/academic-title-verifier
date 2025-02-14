import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Department {
  id: string;
  libelle_dept: string;
  faculte_id: string;
  faculte: {
    libelle_fac: string;
  };
  created_at: string;
}

interface Faculty {
  id: string;
  libelle_fac: string;
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDepartment, setNewDepartment] = useState({
    libelle_dept: '',
    faculte_id: '',
  });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departement')
        .select(`
          *,
          faculte (
            libelle_fac
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculte')
        .select('id, libelle_fac')
        .order('libelle_fac', { ascending: true });

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Erreur lors du chargement des facultés');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.libelle_dept.trim() || !newDepartment.faculte_id) return;

    try {
      const { error } = await supabase
        .from('departement')
        .insert([{
          libelle_dept: newDepartment.libelle_dept.trim(),
          faculte_id: newDepartment.faculte_id,
        }]);

      if (error) throw error;
      setNewDepartment({ libelle_dept: '', faculte_id: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
      setError('Erreur lors de l\'ajout du département');
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    try {
      const { error } = await supabase
        .from('departement')
        .update({
          libelle_dept: editingDepartment.libelle_dept,
          faculte_id: editingDepartment.faculte_id,
        })
        .eq('id', editingDepartment.id);

      if (error) throw error;
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Erreur lors de la mise à jour du département');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('departement')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      setError('Erreur lors de la suppression du département');
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des départements</h1>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Department Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label htmlFor="faculte" className="block text-sm font-medium text-gray-700">
                Faculté
              </label>
              <select
                id="faculte"
                value={newDepartment.faculte_id}
                onChange={(e) => setNewDepartment({ ...newDepartment, faculte_id: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Sélectionnez une faculté</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.libelle_fac}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                value={newDepartment.libelle_dept}
                onChange={(e) => setNewDepartment({ ...newDepartment, libelle_dept: e.target.value })}
                placeholder="Nom du département"
                className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Departments List */}
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
                          Nom
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Faculté
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
                      {departments.map((department) => (
                        <tr key={department.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingDepartment?.id === department.id ? (
                              <form onSubmit={handleUpdateDepartment} className="flex gap-2">
                                <input
                                  type="text"
                                  value={editingDepartment.libelle_dept}
                                  onChange={(e) =>
                                    setEditingDepartment({
                                      ...editingDepartment,
                                      libelle_dept: e.target.value,
                                    })
                                  }
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                                <button
                                  type="submit"
                                  className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </form>
                            ) : (
                              <div className="text-sm text-gray-900">
                                {department.libelle_dept}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {department.faculte?.libelle_fac}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(department.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setEditingDepartment(department)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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