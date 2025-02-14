import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Promotion {
  id: string;
  libelle_promotion: string;
  option: string | null;
  departement_id: string;
  departement: {
    libelle_dept: string;
    faculte: {
      libelle_fac: string;
    };
  };
  created_at: string;
}

interface Department {
  id: string;
  libelle_dept: string;
  faculte: {
    libelle_fac: string;
  };
}

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPromotion, setNewPromotion] = useState({
    libelle_promotion: '',
    option: '',
    departement_id: '',
  });
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
    fetchDepartments();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotion')
        .select(`
          *,
          departement (
            libelle_dept,
            faculte (
              libelle_fac
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departement')
        .select(`
          id,
          libelle_dept,
          faculte (
            libelle_fac
          )
        `)
        .order('libelle_dept', { ascending: true });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Erreur lors du chargement des départements');
    }
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromotion.libelle_promotion.trim() || !newPromotion.departement_id) return;

    try {
      const { error } = await supabase
        .from('promotion')
        .insert([{
          libelle_promotion: newPromotion.libelle_promotion.trim(),
          option: newPromotion.option.trim() || null,
          departement_id: newPromotion.departement_id,
        }]);

      if (error) throw error;
      setNewPromotion({ libelle_promotion: '', option: '', departement_id: '' });
      fetchPromotions();
    } catch (error) {
      console.error('Error adding promotion:', error);
      setError('Erreur lors de l\'ajout de la promotion');
    }
  };

  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromotion) return;

    try {
      const { error } = await supabase
        .from('promotion')
        .update({
          libelle_promotion: editingPromotion.libelle_promotion,
          option: editingPromotion.option,
          departement_id: editingPromotion.departement_id,
        })
        .eq('id', editingPromotion.id);

      if (error) throw error;
      setEditingPromotion(null);
      fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      setError('Erreur lors de la mise à jour de la promotion');
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('promotion')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setError('Erreur lors de la suppression de la promotion');
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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des promotions</h1>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Promotion Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleAddPromotion} className="space-y-4">
            <div>
              <label htmlFor="departement" className="block text-sm font-medium text-gray-700">
                Département
              </label>
              <select
                id="departement"
                value={newPromotion.departement_id}
                onChange={(e) => setNewPromotion({ ...newPromotion, departement_id: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Sélectionnez un département</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.libelle_dept} - {department.faculte.libelle_fac}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={newPromotion.libelle_promotion}
                  onChange={(e) => setNewPromotion({ ...newPromotion, libelle_promotion: e.target.value })}
                  placeholder="Nom de la promotion"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newPromotion.option}
                  onChange={(e) => setNewPromotion({ ...newPromotion, option: e.target.value })}
                  placeholder="Option (facultatif)"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
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

      {/* Promotions List */}
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
                          Promotion
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Option
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Département
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Faculté
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {promotions.map((promotion) => (
                        <tr key={promotion.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPromotion?.id === promotion.id ? (
                              <input
                                type="text"
                                value={editingPromotion.libelle_promotion}
                                onChange={(e) =>
                                  setEditingPromotion({
                                    ...editingPromotion,
                                    libelle_promotion: e.target.value,
                                  })
                                }
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {promotion.libelle_promotion}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPromotion?.id === promotion.id ? (
                              <input
                                type="text"
                                value={editingPromotion.option || ''}
                                onChange={(e) =>
                                  setEditingPromotion({
                                    ...editingPromotion,
                                    option: e.target.value,
                                  })
                                }
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {promotion.option || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {promotion.departement.libelle_dept}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {promotion.departement.faculte.libelle_fac}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingPromotion?.id === promotion.id ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleUpdatePromotion}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingPromotion(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingPromotion(promotion)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePromotion(promotion.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
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