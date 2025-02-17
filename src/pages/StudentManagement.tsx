import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Student as StudentType, Promotion, StudentJointPromotion } from '../models/ModelsForUnivesity';
import { fetchPromotionsByDepartmentId } from '../api/Promotion';
import { fetchDepartmentsByFacultyId } from '../api/Department';
import { fetchFaculties } from '../api/Faculty';
import StudentModal from '../components/StudentModal';
import { fetchStudentsJointPromotion } from '../api/Student';

interface Faculty {
  id: string;
  libelle_fac: string;
}

interface Department {
  id: string;
  libelle_dept: string;
}

interface StudentManagementProps {
  profile: Profile | null;
}

export function StudentManagement({ profile }: StudentManagementProps) {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentJointPromotion[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({
    nom: '',
    postnom: '',
    prenom: '',
    date_naissance: new Date(),
    promotion_id: '',
  });
  const [editingStudent, setEditingStudent] = useState<StudentJointPromotion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [promotionSearchTerm, setPromotionSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<StudentJointPromotion[]>([]);

  useEffect(() => {
    if (profile?.role !== 'university_staff') {
      toast.error('Vous devez être membre de l\'université pour acceder à cette page.');
      navigate(-1);
    }
  }, [profile, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchFacultiesData(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      setError(null);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchStudentsJointPromotion();

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Erreur lors du chargement des étudiants');
      toast.error('Erreur lors du chargement des étudiants');
    }
    finally {
      setLoading(false);
      setError(null);
    }
  };

  const fetchFacultiesData = async () => {
    try {
      const { data, error } = await fetchFaculties();
      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Erreur lors du chargement des facultés');
      toast.error('Erreur lors du chargement des facultés');
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (selectedFaculty) {
        try {
          const { data, error } = await fetchDepartmentsByFacultyId(selectedFaculty);
          if (error) throw error;
          setDepartments(data || []);
          setPromotions([]);
          setSelectedDepartment('');
          setSelectedPromotion('');
        } catch (error) {
          console.error('Error fetching departments:', error);
          setError('Erreur lors du chargement des départements');
          toast.error('Erreur lors du chargement des départements');
        }
      } else {
        setDepartments([]);
        setPromotions([]);
        setSelectedDepartment('');
        setSelectedPromotion('');
      }
    };
    fetchDepartments();
  }, [selectedFaculty]);

  useEffect(() => {
    const fetchPromotions = async () => {
      if (selectedDepartment) {
        try {
          const { data, error } = await fetchPromotionsByDepartmentId(selectedDepartment);
          if (error) throw error;
          setPromotions(data || []);
        } catch (error) {
          console.error('Error fetching promotions:', error);
          setError('Erreur lors du chargement des promotions');
          toast.error('Erreur lors du chargement des promotions');
        }
      } else {
        setPromotions([]);
      }
    };
    fetchPromotions();
  }, [selectedDepartment]);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedFaculty, selectedDepartment, selectedPromotion]);

  const applyFilters = () => {
    let filtered = [...students];

    if (selectedFaculty) {
      filtered = filtered.filter(
        (student) => student.promotion.departement.faculte.id === selectedFaculty
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(
        (student) => student.promotion.departement.id === selectedDepartment
      );
    }

    if (selectedPromotion) {
      filtered = filtered.filter(
        (student) => student.promotion.id === selectedPromotion
      );
    }

    filtered = filtered.filter((student) => {
      const searchString = searchTerm.toLowerCase();
      return (
        student.nom.toLowerCase().includes(searchString) ||
        student.postnom.toLowerCase().includes(searchString) ||
        student.prenom.toLowerCase().includes(searchString)
      );
    });

    setFilteredStudents(filtered);
  };

  const handleAddStudent = async () => {
    setEditingStudent(null);
    setNewStudent({
      nom: '',
      postnom: '',
      prenom: '',
      date_naissance: new Date(),
      promotion_id: '',
    });
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: StudentJointPromotion) => {
    setEditingStudent(student);
    setNewStudent({
      nom: student.nom,
      postnom: student.postnom,
      prenom: student.prenom,
      date_naissance: student.date_naissance,
      promotion_id: student.promotion_id,
    });
    setSelectedFaculty(student.promotion.departement.faculte.id);
    setSelectedDepartment(student.promotion.departement.id);
    setSelectedPromotion(student.promotion.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setNewStudent({
      nom: '',
      postnom: '',
      prenom: '',
      date_naissance: new Date(),
      promotion_id: '',
    });
    setSelectedFaculty('');
    setSelectedDepartment('');
    setSelectedPromotion('');
    setPromotionSearchTerm('');
  };

  const handleSaveStudent = async (studentData: any) => {
    try {
      setLoading(true);
      if (editingStudent) {
        // Update existing student
        const { error } = await supabase
          .from('etudiant')
          .update({
            nom: studentData.nom,
            postnom: studentData.postnom,
            prenom: studentData.prenom,
            date_naissance: studentData.date_naissance,
            promotion_id: studentData.promotion_id,
          })
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast.success('Étudiant mis à jour avec succès !');
      } else {
        // Add new student
        const { error } = await supabase
          .from('etudiant')
          .insert([{
            nom: studentData.nom,
            postnom: studentData.postnom,
            prenom: studentData.prenom,
            date_naissance: studentData.date_naissance,
            promotion_id: studentData.promotion_id,
          }]);

        if (error) throw error;
        toast.success('Étudiant ajouté avec succès !');
      }
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      setError('Erreur lors de l\'enregistrement de l\'étudiant');
      toast.error('Erreur lors de l\'enregistrement de l\'étudiant');
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setEditingStudent(null);
      setNewStudent({
        nom: '',
        postnom: '',
        prenom: '',
        date_naissance: new Date(),
        promotion_id: '',
      });
      setSelectedFaculty('');
      setSelectedDepartment('');
      setSelectedPromotion('');
      setPromotionSearchTerm('');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('etudiant')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchStudents();
      toast.success('Étudiant supprimé avec succès !');
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Erreur lors de la suppression de l\'étudiant');
      toast.error('Erreur lors de la suppression de l\'étudiant');
    } finally {
      setLoading(false);
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    const searchString = promotionSearchTerm.toLowerCase();
    return promotion.libelle_promotion.toLowerCase().includes(searchString);
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des étudiants</h1>
        <div className='inline-flex space-x-2'>
          <button
            onClick={handleAddStudent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un étudiant
          </button>
          <button
            onClick={() => {
              fetchData()
            }}
            className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">Faculté</label>
            <select
              id="faculty"
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setSelectedDepartment('');
                setSelectedPromotion('');
                setPromotions([]);
              }}
              className="border p-2 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Toutes les facultés</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.libelle_fac}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Département</label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedPromotion('');
                setPromotions([]);
              }}
              className="border p-2 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Tous les départements</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.libelle_dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="promotion" className="block text-sm font-medium text-gray-700">Promotion</label>
            <select
              id="promotion"
              value={selectedPromotion}
              onChange={(e) => {
                setSelectedPromotion(e.target.value);
              }}
              className="border p-2 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Toutes les promotions</option>
              {promotions.map((promotion) => (
                <option key={promotion.id} value={promotion.id}>
                  {promotion.libelle_promotion}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="relative rounded-md shadow-sm">
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
        </div>
      ) : (
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
                          <div className="text-sm text-gray-900">
                            {student.nom} {student.postnom} {student.prenom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(student.date_naissance).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.promotion.libelle_promotion}
                            {student.promotion.option ? ` - ${student.promotion.option}` : ''}
                          </div>
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
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-indigo-600 hover:text-indigo-900 p-3 border"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900 ml-4 p-3 border"
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
      )}

      {/* Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveStudent}
        editingStudent={editingStudent}
        newStudent={newStudent}
        setNewStudent={setNewStudent}
        loading={loading}
      />
    </div>
  );
}