import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  nom: string;
  postnom: string;
  prenom: string;
  date_naissance: string;
  promotion_id: string;
  promotion: {
    libelle_promotion: string;
    option: string | null;
    departement: {
      libelle_dept: string;
      faculte: {
        libelle_fac: string;
      };
    };
  };
  created_at: string;
}

interface Promotion {
  id: string;
  libelle_promotion: string;
  option: string | null;
  departement: {
    libelle_dept: string;
    faculte: {
      libelle_fac: string;
    };
  };
}

interface StudentManagementProps {
  profile: Profile | null;
}

export function StudentManagement({ profile }: StudentManagementProps) {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({
    nom: '',
    postnom: '',
    prenom: '',
    date_naissance: '',
    promotion_id: '',
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== 'university_staff') {
      toast.error('Vous devez être membre de l\'université pour acceder à cette page.');
      navigate(-1);
    }
  }, [profile, navigate]);

  useEffect(() => {
    fetchStudents();
    fetchPromotions();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('etudiant')
        .select(`
          *,
          promotion (
            libelle_promotion,
            option,
            departement (
              libelle_dept,
              faculte (
                libelle_fac
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotion')
        .select(`
          id,
          libelle_promotion,
          option,
          departement (
            libelle_dept,
            faculte (
              libelle_fac
            )
          )
        `)
        .order('libelle_promotion', { ascending: true });

      if (error) throw error;
      setPromotions(data.map((promotion: any) => ({
        id: promotion.id,
        libelle_promotion: promotion.libelle_promotion,
        option: promotion.option,
        departement: {
          libelle_dept: promotion.departement.libelle_dept,
          faculte: {
            libelle_fac: promotion.departement.faculte.libelle_fac,
          },
        },
      })) || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError('Erreur lors du chargement des promotions');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.nom.trim() || !newStudent.prenom.trim() || !newStudent.date_naissance || !newStudent.promotion_id) return;

    try {
      const { error } = await supabase
        .from('etudiant')
        .insert([{
          nom: newStudent.nom.trim(),
          postnom: newStudent.postnom.trim(),
          prenom: newStudent.prenom.trim(),
          date_naissance: newStudent.date_naissance,
          promotion_id: newStudent.promotion_id,
        }]);

      if (error) throw error;
      setNewStudent({
        nom: '',
        postnom: '',
        prenom: '',
        date_naissance: '',
        promotion_id: '',
      });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Erreur lors de l\'ajout de l\'étudiant');
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const { error } = await supabase
        .from('etudiant')
        .update({
          nom: editingStudent.nom,
          postnom: editingStudent.postnom,
          prenom: editingStudent.prenom,
          date_naissance: editingStudent.date_naissance,
          promotion_id: editingStudent.promotion_id,
        })
        .eq('id', editingStudent.id);

      if (error) throw error;
      setEditingStudent(null);
      //fetch Continuing with the StudentManagement.tsx file content exactly where we left off:

      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      setError('Erreur lors de la mise à jour de l\'étudiant');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('etudiant')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Erreur lors de la suppression de l\'étudiant');
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.nom.toLowerCase().includes(searchString) ||
      student.postnom.toLowerCase().includes(searchString) ||
      student.prenom.toLowerCase().includes(searchString)
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des étudiants</h1>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Student Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  value={newStudent.nom}
                  onChange={(e) => setNewStudent({ ...newStudent, nom: e.target.value })}
                  className="mt-1 p-2 border block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="postnom" className="block text-sm font-medium text-gray-700">
                  Post-nom
                </label>
                <input
                  type="text"
                  id="postnom"
                  value={newStudent.postnom}
                  onChange={(e) => setNewStudent({ ...newStudent, postnom: e.target.value })}
                  className="mt-1 p-2 border block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  id="prenom"
                  value={newStudent.prenom}
                  onChange={(e) => setNewStudent({ ...newStudent, prenom: e.target.value })}
                  className="mt-1 p-2 border block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700">
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="date_naissance"
                  value={newStudent.date_naissance}
                  onChange={(e) => setNewStudent({ ...newStudent, date_naissance: e.target.value })}
                  className="mt-1 p-2 border block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="promotion" className="block text-sm font-medium text-gray-700">
                  Promotion
                </label>
                <select
                  id="promotion"
                  value={newStudent.promotion_id}
                  onChange={(e) => setNewStudent({ ...newStudent, promotion_id: e.target.value })}
                  className="mt-1 p-2 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Sélectionnez une promotion</option>
                  {promotions.map((promotion) => (
                    <option key={promotion.id} value={promotion.id}>
                      {promotion.libelle_promotion}
                      {promotion.option ? ` - ${promotion.option}` : ''} ({promotion.departement.libelle_dept})
                    </option>
                  ))}
                </select>
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
            placeholder="Rechercher un étudiant..."
          />
        </div>
      </div>

      {/* Students List */}
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
                          Nom complet
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date de naissance
                        </th>
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
                          Département
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent?.id === student.id ? (
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={editingStudent.nom}
                                  onChange={(e) =>
                                    setEditingStudent({
                                      ...editingStudent,
                                      nom: e.target.value,
                                    })
                                  }
                                  className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Nom"
                                />
                                <input
                                  type="text"
                                  value={editingStudent.postnom}
                                  onChange={(e) =>
                                    setEditingStudent({
                                      ...editingStudent,
                                      postnom: e.target.value,
                                    })
                                  }
                                  className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Post-nom"
                                />
                                <input
                                  type="text"
                                  value={editingStudent.prenom}
                                  onChange={(e) =>
                                    setEditingStudent({
                                      ...editingStudent,
                                      prenom: e.target.value,
                                    })
                                  }
                                  className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Prénom"
                                />
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">
                                {student.nom} {student.postnom} {student.prenom}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent?.id === student.id ? (
                              <input
                                type="date"
                                value={editingStudent.date_naissance}
                                onChange={(e) =>
                                  setEditingStudent({
                                    ...editingStudent,
                                    date_naissance: e.target.value,
                                  })
                                }
                                className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {new Date(student.date_naissance).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent?.id === student.id ? (
                              <select
                                value={editingStudent.promotion_id}
                                onChange={(e) =>
                                  setEditingStudent({
                                    ...editingStudent,
                                    promotion_id: e.target.value,
                                  })
                                }
                                className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                {promotions.map((promotion) => (
                                  <option key={promotion.id} value={promotion.id}>
                                    {promotion.libelle_promotion}
                                    {promotion.option ? ` - ${promotion.option}` : ''}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-sm text-gray-900">
                                {student.promotion.libelle_promotion}
                                {student.promotion.option ? ` - ${student.promotion.option}` : ''}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.promotion.departement.libelle_dept}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.promotion.departement.faculte.libelle_fac}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingStudent?.id === student.id ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleUpdateStudent}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingStudent(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingStudent(student)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student.id)}
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