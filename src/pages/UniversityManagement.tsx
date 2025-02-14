import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface University {
  id: string;
  libelle_univ: string;
  created_at: string;
}

export function UniversityManagement() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUniversity, setNewUniversity] = useState('');
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universite')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setError('Erreur lors du chargement des universités');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniversity.trim()) return;

    try {
      const { error } = await supabase
        .from('universite')
        .insert([{ libelle_univ: newUniversity.trim() }]);

      if (error) throw error;
      setNewUniversity('');
      fetchUniversities();
    } catch (error) {
      console.error('Error adding university:', error);
      setError('Erreur lors de l\'ajout de l\'université');
    }
  };

  const handleUpdateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity) return;

    try {
      const { error } = await supabase
        .from('universite')
        .update({ libelle_univ: editingUniversity.libelle_univ })
        .eq('id', editingUniversity.id);

      if (error) throw error;
      setEditingUniversity(null);
      fetchUniversities();
    } catch (error) {
      console.error('Error updating university:', error);
      setError('Erreur lors de la mise à jour de l\'université');
    }
  };

  const handleDeleteUniversity = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette université ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('universite')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchUniversities();
    } catch (error) {
      console.error('Error deleting university:', error);
      setError('Erreur lors de la suppression de l\'université');
    }
  };

  const filteredUniversities = universities.filter((university) => {
    const searchString = searchTerm.toLowerCase();
    return university.libelle_univ.toLowerCase().includes(searchString);
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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des universités</h1>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add University Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleAddUniversity} className="flex gap-4">
            <input
              type="text"
              value={newUniversity}
              onChange={(e) => setNewUniversity(e.target.value)}
              placeholder="Nom de l'université"
              className="flex-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
            placeholder="Rechercher une université..."
          />
        </div>
      </div>

      {/* Universities List */}
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
                      {filteredUniversities.map((university) => (
                        <tr key={university.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUniversity?.id === university.id ? (
                              <form onSubmit={handleUpdateUniversity} className="flex gap-2">
                                <input
                                  type="text"
                                  value={editingUniversity.libelle_univ}
                                  onChange={(e) =>
                                    setEditingUniversity({
                                      ...editingUniversity,
                                      libelle_univ: e.target.value,
                                    })
                                  }
                                  className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                                {university.libelle_univ}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(university.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setEditingUniversity(university)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUniversity(university.id)}
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
