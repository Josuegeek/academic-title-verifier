import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Loader, Edit, Edit2Icon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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

interface PromotionManagementProps {
  profile: Profile | null;
}

export function PromotionManagement({ profile }: PromotionManagementProps) {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    libelle_promotion: '',
    option: '',
    departement_id: '',
  });
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [editFormData, setEditFormData] = useState({
    libelle_promotion: '',
    option: '',
    departement_id: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'university_staff') {
      toast.error('Vous devez être membre de l\'université pour acceder à cette page.');
      navigate('/');
    }
  }, [profile, navigate]);

  const fetchPromotions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
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
      toast.error('Erreur lors du chargement des promotions');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departement')
        .select<string, Department>(`
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
      toast.error('Erreur lors du chargement des départements');
    } finally {
      setError(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
    fetchDepartments();
  }, [fetchPromotions, fetchDepartments]);

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromotion.libelle_promotion.trim() || !newPromotion.departement_id) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsSubmitting(true);
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
      toast.success('Promotion ajoutée avec succès !');
    } catch (error) {
      console.error('Error adding promotion:', error);
      setError('Erreur lors de l\'ajout de la promotion');
      toast.error('Erreur lors de l\'ajout de la promotion');
    } finally {
      setError(null);
      setIsSubmitting(false);
    }
  };

  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromotion) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('promotion')
        .update({
          libelle_promotion: editFormData.libelle_promotion,
          option: editFormData.option,
          departement_id: editFormData.departement_id,
        })
        .eq('id', editingPromotion.id);

      if (error) throw error;
      setEditingPromotion(null);
      setEditFormData({ libelle_promotion: '', option: '', departement_id: '' });
      fetchPromotions();
      toast.success('Promotion mise à jour avec succès !');
    } catch (error) {
      console.error('Error updating promotion:', error);
      setError('Erreur lors de la mise à jour de la promotion');
      toast.error('Erreur lors de la mise à jour de la promotion');
    } finally {
      setError(null);
      setIsSubmitting(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('promotion')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPromotions();
      toast.success('Promotion supprimée avec succès !');
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setError('Erreur lors de la suppression de la promotion');
      toast.error('Erreur lors de la suppression de la promotion');
    } finally {
      setError(null); 
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.libelle_dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  const filteredPromotions = promotions.filter(promotion => {
    const searchString = tableSearchTerm.toLowerCase();
    return (
      promotion.libelle_promotion.toLowerCase().includes(searchString) ||
      (promotion.option && promotion.option.toLowerCase().includes(searchString)) ||
      promotion.departement.libelle_dept.toLowerCase().includes(searchString) ||
      promotion.departement.faculte.libelle_fac.toLowerCase().includes(searchString)
    );
  });

  const handleEditClick = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setEditFormData({
      libelle_promotion: promotion.libelle_promotion,
      option: promotion.option || '',
      departement_id: promotion.departement_id,
    });
    // Scroll to the add promotion form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCancelEdit = () => {
    setEditingPromotion(null);
    setEditFormData({ libelle_promotion: '', option: '', departement_id: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingPromotion === null) {
      setNewPromotion({
        ...newPromotion,
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
          <form onSubmit={editingPromotion !== null ? handleUpdatePromotion : handleAddPromotion} className="space-y-4">
            <div>
              <label htmlFor="departement" className="block text-sm font-medium text-gray-700">
                Département
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={departmentSearchTerm}
                  onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                  placeholder="Rechercher un département..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <select
                id="departement"
                value={(editingPromotion!==null)? editFormData.departement_id : newPromotion.departement_id}
                name="departement_id"
                onChange={handleFormChange}
                className="border p-2 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Sélectionnez un département</option>
                {filteredDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.libelle_dept} - {department.faculte.libelle_fac}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="libelle_promotion" className="block text-sm font-medium text-gray-700">
                  Nom de la promotion
                </label>
                <input
                  required
                  type="text"
                  name="libelle_promotion"
                  value={(editingPromotion!==null)? editFormData.libelle_promotion : newPromotion.libelle_promotion}
                  onChange={handleFormChange}
                  placeholder="Nom de la promotion"
                  className="border p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="option" className="block text-sm font-medium text-gray-700">
                  Option
                </label>
                <input
                  type="text"
                  name="option"
                  value={(editingPromotion!==null)? editFormData.option : newPromotion.option}
                  onChange={handleFormChange}
                  placeholder="Option (facultatif)"
                  className="border p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className='flex items-center'>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <>
                    {editingPromotion ?
                      <>
                        <Edit2Icon className="h-5 w-5 mr-2" />
                        Modifier
                      </>
                      :
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter
                      </>
                    }
                  </>
                )}
              </button>
              {editingPromotion && (
                <button
                  type="button"
                  className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleCancelEdit}
                >
                  Annuler la modification
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="flex justify-end">
          <button
            onClick={() => fetchPromotions()}
            type="submit"
            className="inline-flex m-2 mr-4 items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-800 bg-indigo-200 hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Loader className="h-5 w-5" />
            Actualiser
          </button>
        </div>
        <div className="flex w-full justify-between items-center px-4">
          <div className="mb-4 w-full">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Rechercher une promotion..."
              />
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
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
                        {filteredPromotions.map((promotion) => (
                          <tr key={promotion.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {promotion.libelle_promotion}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {promotion.option || '-'}
                              </div>
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
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleEditClick(promotion)}
                                  className="text-indigo-600 hover:text-indigo-900 p-3 border"
                                  disabled={isSubmitting}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePromotion(promotion.id)}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}