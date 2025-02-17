import { useState, useEffect } from 'react';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { DiplomaJointStudent, Faculty, NewDiploma, StudentJointPromotion } from '../models/ModelsForUnivesity';
import { addDiploma, deleteDiploma, updateDiploma } from '../api/Diploma';
import { fetchStudentsJointPromotion } from '../api/Student';
import { toast } from 'react-toastify';
import { fetchFaculties } from '../api/Faculty';
import { supabase } from '../lib/supabase';
import AddDiplomaModal from '../components/AddDiplomaModal';
import type { Profile } from '../types';
import { useNavigate } from 'react-router-dom';

interface DiplomaManagementProps {
  profile: Profile | null;
}

export function DiplomaManagement({ profile }: DiplomaManagementProps) {
  const navigate = useNavigate();
  const [diplomas, setDiplomas] = useState<DiplomaJointStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentJointPromotion[]>([]);
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const [isAddingDiploma, setIsAddingDiploma] = useState(false);
  const [isEditingDiploma, setIsEditingDiploma] = useState(false);
  const [currentDiploma, setCurrentDiploma] = useState<NewDiploma | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'university_staff') {
      toast.error('Vous devez être membre de l\'université pour acceder à cette page.');
      navigate(-1);
    }
  }, [profile, navigate]);

  useEffect(() => {
    fetchDiplomas();
    fetchFaculty();
    fetchStudents();
  }, [profile]);

  async function fetchDiplomas() {
    setLoading(true);
    try {
      let query = supabase
        .from("titre_academique")
        .select<string, DiplomaJointStudent>(
          `
            id,
            libelle_titre,
            fichier_url,
            qr_code,
            date_delivrance,
            lieu,
            etudiant (
                id,
                nom,
                postnom,
                prenom
            ),
            est_authentique,
            annee_academique,
            signe_par
            `
        ).order('created_at', { ascending: false });

      if (profile?.role === 'university_staff' && profile?.universite_id) {
        query = query.eq('universite_id', profile.universite_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDiplomas(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudents() {
    try {
      const { data: studentData, error: studentError } = await fetchStudentsJointPromotion();

      if (studentError) throw studentError;
      setStudents(studentData || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des étudiants');
    } finally {
      //setLoading(false);
    }
  }

  async function fetchFaculty() {
    try {
      const { data: facultyData, error: facultyError } = await fetchFaculties();

      if (facultyError) throw facultyError;
      setFaculties(facultyData || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des facultés');
    } finally {
      setLoading(false);
    }
  }

  const handleAddDiplomaClick = () => {
    setCurrentDiploma(null);
    setIsAddingDiploma(true);
  };

  const handleEditDiplomaClick = (diploma: DiplomaJointStudent) => {
    setCurrentDiploma({
      libelle_titre: diploma.libelle_titre,
      etudiant_id: diploma.etudiant?.id || '',
      fichier_url: diploma.fichier_url,
      qr_code: diploma.qr_code,
      date_delivrance: diploma.date_delivrance,
      lieu: diploma.lieu,
      est_authentique: diploma.est_authentique,
      annee_academique: diploma.annee_academique,
      signe_par: diploma.signe_par
    });
    setIsEditingDiploma(true);
  };

  const handleCancelAddDiploma = () => {
    setIsAddingDiploma(false);
    setIsEditingDiploma(false);
  };

  const handleAddDiplomaSubmit = async (newDiploma: NewDiploma, selectedFile: File | null) => {
    setIsSubmitting(true);
    setSubmittingError(null);

    try {
      let fileUrl: string | null = null;

      if (selectedFile) {
        const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9]/g, '') + Date.now();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('diploma-files')
          .upload(`${newDiploma.etudiant_id}/${sanitizedFileName}`, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        console.log(uploadData);

        if (uploadError) throw uploadError;

        const { data, error: signedUrlError } = await supabase
          .storage
          .from('diploma-files')
          .createSignedUrl(uploadData.path, 60 * 60 * 24 * 100);
        console.log(data);
        if (signedUrlError) throw signedUrlError;

        fileUrl = data?.signedUrl || null;
      }

      const { error: diplomaError } = currentDiploma
        ? await updateDiploma(currentDiploma.etudiant_id, { ...newDiploma, fichier_url: fileUrl || "" })
        : await addDiploma({ ...newDiploma, fichier_url: fileUrl || "" });

      if (diplomaError) throw diplomaError;

      toast.success('Diplôme ajouté avec succès !');

      fetchDiplomas();

      setIsAddingDiploma(false); // Close modal
      setIsEditingDiploma(false); // Close modal
      setSubmittingError(null);
    } catch (error) {
      setSubmittingError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout du diplôme.');
      toast.error(error instanceof Error && error.message ? error.message : 'Une erreur est survenue lors de l\'ajout du diplôme.');
      console.log(error);
    } finally {
      setIsSubmitting(false);
      setSubmittingError(null);
    }
  };

  const handleShowDiplomaFileClick = (diploma: DiplomaJointStudent) => {
    window.open(diploma.fichier_url, '_blank');
  };

  const handleDeleteDiploma = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce diplôme ?')) {
      try {
        const { error } = await deleteDiploma(id);
        if (error) throw error;
        fetchDiplomas();
        toast.success('Diplôme supprimé avec succès !');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du diplôme.');
      }
    }
  };

  const filteredDiplomas = diplomas.filter((diploma) => {
    const searchString = searchTerm.toLowerCase();
    return (
      diploma.libelle_titre.toLowerCase().includes(searchString) ||
      diploma.etudiant?.nom.toLowerCase().includes(searchString) ||
      diploma.etudiant?.prenom.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des diplômes
        </h1>
        <button onClick={handleAddDiplomaClick} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau diplôme
        </button>
      </header>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-indigo-500 p-2 border focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher un diplôme..."
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
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
                            Titre
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Étudiant
                          </th>
                          <th
                            scope="col"
                            className="relative px-6 py-3"
                          >
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDiplomas.map((diploma) => (
                          <tr key={diploma.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {diploma.libelle_titre}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {`${diploma.etudiant?.nom} ${diploma.etudiant?.postnom} ${diploma.etudiant?.prenom}`}
                              </div>
                            </td>
                            <td>
                              {diploma.est_authentique ? (
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  Authentifié
                                </span>
                              ) :
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                  non Authentifié par l'ESU
                                </span>
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleShowDiplomaFileClick(diploma)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditDiplomaClick(diploma)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDiploma(diploma.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
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
        </div>
      </div>
      {/* Add/Edit Diploma Modal */}
      <AddDiplomaModal
        isSubmitting={isSubmitting}
        isOpen={isAddingDiploma || isEditingDiploma}
        onClose={handleCancelAddDiploma}
        onSubmit={handleAddDiplomaSubmit}
        faculties={faculties}
        students={students}
        error={submittingError}
        initialDiploma={currentDiploma}
      />
    </div>
  );
}
