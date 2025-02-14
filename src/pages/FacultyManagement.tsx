import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Faculty {
  id: string;
  libelle_fac: string;
  created_at: string;
}

export function FacultyManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFaculty, setNewFaculty] = useState('');
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculte')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Erreur lors du chargement des facultés');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.trim()) return;

    try {
      const { error } = await supabase
        .from('faculte')
        .insert([{ libelle_fac: newFaculty.trim() }]);

      if (error) throw error;
      setNewFaculty('');
      fetchFaculties();
    } catch (error) {
      console.error('Error adding faculty:', error);
      setError('Erreur lors de l\'ajout de la faculté');
    }
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;

    try {
      const { error } = await supabase
        .from('faculte')
        .update({ libelle_fac: editingFaculty.libelle_fac })
        .eq('id', editingFaculty.id);

      if (error) throw error;
      setEditingFaculty(null);
      fetchFaculties();
    } catch (error) {
      console.error('Error updating faculty:', error);
      setError('Erreur lors de la mise à jour de la faculté');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette faculté ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('faculte')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFaculties();
    } catch (error) {
      console.error('Error deleting faculty:', error);
      setError('Erreur lors de la suppression de la faculté');
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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des facultés</h1>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Faculty Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleAddFaculty} className="flex gap-4">
            <input
              type="text"
              value={newFaculty}
              onChange={(e) => setNewFaculty(e.target.value)}
              placeholder="Nom de la faculté"
              className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter
            </button>
          </form>
        </div>
      </div>

      {/* Faculties List */}
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
                          Date de création
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {faculties.map((faculty) => (
                        <tr key={faculty.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingFaculty?.id === faculty.id ? (
                              <form onSubmit={handleUpdateFaculty} className="flex gap-2">
                                <input
                                  type="text"
                                  value={editingFaculty.libelle_fac}
                                  onChange={(e) =>
                                    setEditingFaculty({
                                      ...editingFaculty,
                                      libelle_fac: e.target.value,
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
                                {faculty.libelle_fac}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(faculty.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setEditingFaculty(faculty)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFaculty(faculty.id)}
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