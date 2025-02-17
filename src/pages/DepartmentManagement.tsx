import React, { useEffect, useState, useCallback } from 'react';
import { Edit2, Trash2, Search, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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

interface DepartementManagementProps {
  profile: Profile | null;
}

export function DepartmentManagement({ profile }: DepartementManagementProps) {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    libelle_dept: '',
    faculte_id: '',
  });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editFormData, setEditFormData] = useState({
    libelle_dept: '',
    faculte_id: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'university_staff') {
      toast.error('Vous devez être membre de l\'université pour acceder à cette page.');
      navigate('/');
    }
  }, [profile, navigate]);

  const fetchDepartments = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
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
      toast.error('Erreur lors du chargement des départements');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  const fetchFaculties = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faculte')
        .select('id, libelle_fac')
        .order('libelle_fac', { ascending: true });

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Erreur lors du chargement des facultés');
      toast.error('Erreur lors du chargement des facultés');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, [fetchDepartments, fetchFaculties]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.libelle_dept.trim() || !newDepartment.faculte_id) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('departement')
        .insert([{
          libelle_dept: newDepartment.libelle_dept.trim(),
          faculte_id: newDepartment.faculte_id,
        }]);

      if (error) throw error;
      setNewDepartment({ libelle_dept: '', faculte_id: '' });
      fetchDepartments();
      toast.success('Département ajouté avec succès !');
    } catch (error) {
      console.error('Error adding department:', error);
      setError('Erreur lors de l\'ajout du département');
      toast.error('Erreur lors de l\'ajout du département');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('departement')
        .update({
          libelle_dept: editFormData.libelle_dept,
          faculte_id: editFormData.faculte_id,
        })
        .eq('id', editingDepartment.id);

      if (error) throw error;
      setEditingDepartment(null);
      setEditFormData({ libelle_dept: '', faculte_id: '' });
      fetchDepartments();
      toast.success('Département mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Erreur lors de la mise à jour du département');
      toast.error('Erreur lors de la mise à jour du département');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('departement')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDepartments();
      toast.success('Département supprimé avec succès !');
    } catch (error) {
      console.error('Error deleting department:', error);
      setError('Erreur lors de la suppression du département');
      toast.error('Erreur lors de la suppression du département');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(department => {
    const searchString = tableSearchTerm.toLowerCase();
    return (
      department.libelle_dept.toLowerCase().includes(searchString) ||
      department.faculte.libelle_fac.toLowerCase().includes(searchString)
    );
  });

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setEditFormData({
      libelle_dept: department.libelle_dept,
      faculte_id: department.faculte_id,
    });
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setEditFormData({ libelle_dept: '', faculte_id: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingDepartment === null) {
      setNewDepartment({
        ...newDepartment,
        [e.target.name]: e.target.value,
      });
    }
    else {
      setEditFormData({
        ...editFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

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
          <form onSubmit={editingDepartment !== null ? handleUpdateDepartment : handleAddDepartment} className="space-y-4">
            <div>
              <label htmlFor="faculte" className="block text-sm font-medium text-gray-700">
                Faculté
              </label>
              <select
                id="faculte"
                value={(editingDepartment !== null) ? editFormData.faculte_id : newDepartment.faculte_id}
                name="faculte_id"
                onChange={handleFormChange}
                className="mt-1 p-2 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                disabled={isSubmitting}
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
                name="libelle_dept"
                value={(editingDepartment !== null) ? editFormData.libelle_dept : newDepartment.libelle_dept}
                onChange={handleFormChange}
                placeholder="Nom du département"
                className="flex-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  editingDepartment ? 'Modifier' : 'Ajouter'
                )}
              </button>
              {editingDepartment && (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Departments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="flex justify-end">
          <button
            onClick={() => fetchDepartments()}
            type="button"
            disabled={isRefreshing}
            className="inline-flex m-2 mr-4 items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-800 bg-indigo-200 hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isRefreshing ? <Loader className="h-5 w-5 animate-spin" /> : 'Actualiser'}
          </button>
        </div>
        <div className="px-4 pt-2 py-5">
          <div className="mb-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Rechercher un département..."
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex flex-col">
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
              </div>
            ) :
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
                        {filteredDepartments.map((department) => (
                          <tr key={department.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {department.libelle_dept}
                              </div>
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
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleEditClick(department)}
                                  className="text-indigo-600 hover:text-indigo-900 p-3 border"
                                  disabled={isSubmitting}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDepartment(department.id)}
                                  className="text-red-600 hover:text-red-900 p-3 border"
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    </div>
  );
}