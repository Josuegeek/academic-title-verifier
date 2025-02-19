import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Faculty {
  id: string;
  libelle_fac: string;
  created_at: string;
}

interface FacultyManagementProps {
  profile: Profile | null;
}

export function FacultyManagement({ profile }: FacultyManagementProps) {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [newFaculty, setNewFaculty] = useState('');
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tableSearchTerm, setTableSearchTerm] = useState('');

  useEffect(() => {
    if (profile?.role !== 'university_staff') {
      toast.error('Vous devez être membre de l\'université pour acceder à cette page.');
      navigate(-1);
    }
  }, [profile, navigate]);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
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
    if (!newFaculty.trim()){
      toast.error('Le nom de la faculté ne peut pas être vide');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('faculte')
        .insert([{ libelle_fac: newFaculty.trim() }]);

      if (error) throw error;
      setNewFaculty('');
      fetchFaculties();
      toast.success('Faculté ajoutée avec succès !');
    } catch (error) {
      setSubmitting(false);
      console.error('Error adding faculty:', error);
      toast.error('Erreur lors de l\'ajout de la faculté');
      setError('Erreur lors de l\'ajout de la faculté');
    }
    finally{
      setSubmitting(false);
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
      toast.success('Faculté mise à jour avec succès !');
    } catch (error) {
      console.error('Error updating faculty:', error);
      setError('Erreur lors de la mise à jour de la faculté');
      toast.error('Erreur lors de la mise à jour de la faculté');
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
      toast.success('Faculté supprimée avec succès !');
    } catch (error) {
      console.error('Error deleting faculty:', error);
      setError('Erreur lors de la suppression de la faculté');
      toast.error('Erreur lors de la suppression de la faculté');
    }
  };

  const filteredFaculties = faculties.filter(faculty => {
    const searchString = tableSearchTerm.toLowerCase();
    return (
      faculty.libelle_fac.toLowerCase().includes(searchString)
    );
  });

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
              required
              onChange={(e) => setNewFaculty(e.target.value)}
              placeholder="Nom de la faculté"
              className="flex-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter
                </>

              )}
            </button>
          </form>
        </div>
      </div>

      {/* Faculties List */}
      <div className="bg-white shadow rounded-lg">
        <div className="flex justify-end">
          <button
            onClick={() => fetchFaculties()}
            type="submit"
            className="inline-flex m-2 mr-4 items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-800 bg-indigo-200 hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Loader className="h-5 w-5" />
            Actualiser
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
                placeholder="Rechercher une faculté..."
              />
            </div>
          </div>
          <div className="flex flex-col">
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
              </div>
            ) : (
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
                        {filteredFaculties.map((faculty) => (
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
                                className="text-indigo-600 hover:text-indigo-900 mr-4 p-3 border"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFaculty(faculty.id)}
                                className="text-red-600 hover:text-red-900 p-3 border"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}