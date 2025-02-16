import React, { useState, useEffect, useRef } from 'react';
import { Department, Faculty, NewDiploma, Promotion, StudentJointPromotion } from '../models/ModelsForUnivesity';
import { fetchDepartmentByFacultyId } from '../api/Department';
import { fetchPromotionByDepartmentId } from '../api/Promotion';
import { v4 as uuidv4 } from 'uuid';
import { CustomInput } from './Input';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import { toast } from 'react-toastify';

interface AddDiplomaModalProps {
  isSubmitting: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (diploma: NewDiploma, selectedFile: File | null) => void;
  faculties: Faculty[];
  students: StudentJointPromotion[];
  error: string | null;
  initialDiploma: NewDiploma | null;
}

const AddDiplomaModal: React.FC<AddDiplomaModalProps> = ({ isSubmitting, isOpen, onClose, onSubmit, faculties, students, error, initialDiploma }) => {
  const [newDiploma, setNewDiploma] = useState<NewDiploma>({
    libelle_titre: '',
    etudiant_id: '',
    fichier_url: '',
    qr_code: uuidv4(),
    date_delivrance: new Date().toISOString(),
    lieu: 'Kinshasa'
  });
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [initialStudent, setInitialStudent] = useState<StudentJointPromotion | null>();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [fileError, setFileError] = useState(false);
  const fileInputRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const applyInitialDiploma = () => {
    if (initialDiploma) {
      setNewDiploma(initialDiploma);
      const student = students.find(s => s.id === initialDiploma.etudiant_id);
      if (student) {
        setInitialStudent(student);
        setSelectedFaculty(student.promotion.departement.faculte.id);
        setSelectedDepartment(student.promotion.departement.id);
        setSelectedPromotion(student.promotion.id);
      }
      setSelectedFile(null);
      setStudentSearchTerm('');
      setFileError(false);
    }
  }

  useEffect(() => {
    applyInitialDiploma();
  }, [initialDiploma, students]);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (selectedFaculty) {
        const { data, error } = await fetchDepartmentByFacultyId(selectedFaculty);

        if (error) {
          console.error("Error fetching departments:", error);
          return;
        }
        setDepartments(data || []);
        setPromotions([]); // Reset promotions when department changes
        setSelectedDepartment('');
        setSelectedPromotion('');
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
        const { data, error } = await fetchPromotionByDepartmentId(selectedDepartment);

        if (error) {
          console.error("Error fetching promotions:", error);
          return;
        }
        setPromotions(data || []);
        setSelectedPromotion('');
      } else {
        setPromotions([]);
        setSelectedPromotion('');
      }
    };

    fetchPromotions();
  }, [selectedDepartment]);

  useEffect(() => {
    QRCode.toDataURL(newDiploma.qr_code, { errorCorrectionLevel: 'H' }, function (err, url) {
      if (err) {
        console.error(err);
        toast.error('Erreur lors de la génération du code QR');
        return;
      }
      setQrCodeDataUrl(url);
    });
  }, [newDiploma.qr_code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDiploma((prevDiploma) => ({
      ...prevDiploma,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];
    if (!files) return;

    try {
      const fileData = await files.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileData);
      const firstPage = pdfDoc.insertPage(0);

      const qrImageBytes = await fetch(qrCodeDataUrl).then(r => r.arrayBuffer());
      const qrImage = await pdfDoc.embedPng(qrImageBytes);

      const pageWidth = firstPage.getWidth();
      const pageHeight = firstPage.getHeight();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      firstPage.drawImage(qrImage, {
        x: pageWidth - 150,
        y: pageHeight - 150,
        width: 100,
        height: 100,
      });

      const logoUrl = '/imgs/logo_unikin.png';
      const logoImageBytes = await fetch(logoUrl).then(r => r.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoImageBytes);

      firstPage.drawImage(logoImage, {
        x: 20,
        y: pageHeight - 50,
        width: 100,
        height: 100,
      });

      firstPage.drawText('Université de Kinshasa', {
        x: 20,
        y: pageHeight - 50,
        font,
        size: 20,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText('Système de vérification sécurisé des diplômes', {
        x: 20,
        y: pageHeight - 70,
        font,
        size: 14,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText('@Copyright Danisi Kibeye', {
        x: 20,
        y: pageHeight - 150,
        font,
        size: 14,
        color: rgb(0, 0, 0),
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedPdfFile = new File([modifiedPdfBytes], files.name, { type: 'application/pdf' });

      setSelectedFile(modifiedPdfFile);
      setFileError(false);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setFileError(true);
      toast.error('Erreur lors du traitement du fichier PDF');
      return;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError(true);
      fileInputRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    onSubmit(newDiploma, selectedFile);
    resetForm();
  };

  const resetForm = () => {
    setNewDiploma({
      libelle_titre: '',
      etudiant_id: '',
      fichier_url: '',
      qr_code: uuidv4(),
      date_delivrance: new Date().toISOString(),
      lieu: 'Kinshasa'
    });
    setSelectedFaculty('');
    setSelectedDepartment('');
    setSelectedPromotion('');
    setInitialStudent(null);
    setDepartments([]);
    setPromotions([]);
    setSelectedFile(null);
    setStudentSearchTerm('');
    setFileError(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const filteredStudents = students.filter((student) => {
    const { promotion } = student;
    const studentName = `${student.nom} ${student.postnom || ''} ${student.prenom}`.toLowerCase();
    const searchTermLower = studentSearchTerm.toLowerCase();

    if (selectedFaculty && promotion.departement.faculte.id !== selectedFaculty) {
      return false;
    }
    if (selectedDepartment && promotion.departement.id !== selectedDepartment) {
      return false;
    }
    if (selectedPromotion && student.promotion.id !== selectedPromotion) {
      return false;
    }

    return studentName.includes(searchTermLower);
  });

  return (
    isOpen && (
      <div className="fixed z-10 inset-0" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white overflow-hidden rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ maxHeight: '80vh' }}>
            <div className="bg-white h-full sm:p-6 sm:pb-4">
              <h3 className="sticky bg-gray-50 text-lg leading-6 font-medium text-gray-900 p-5" id="modal-title">
                {(initialDiploma == null) ? 'Ajouter un nouveau diplôme' : 'Modifier le diplôme de ' + initialStudent?.nom}
              </h3>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-2">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <form onSubmit={handleFormSubmit} className="flex flex-col space-y-4 relative">
                <div className='overflow-y-scroll max-h-[50vh] px-1'>
                  <div>
                    <CustomInput idName='libelle_titre' value={newDiploma.libelle_titre} label='Titre du diplôme' onChange={handleInputChange} className='' type='text' options={[]}
                    />
                  </div>

                  <div>
                    <CustomInput idName='selectedFaculty' value={selectedFaculty} label='Faculté'
                      onChange={(e) => {
                        setSelectedFaculty(e.target.value);
                        setSelectedDepartment('');
                        setSelectedPromotion('');
                      }} className='' type='select' options={faculties}
                    />
                  </div>

                  <div>
                    <CustomInput idName='selectedDepartment' value={selectedDepartment} label='Département'
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setSelectedPromotion('');
                      }} className='' type='select' options={departments}
                    />
                  </div>

                  <div>
                    <CustomInput idName='selectedPromotion' value={selectedPromotion} label='Promotion'
                      onChange={(e) => {
                        setSelectedPromotion(e.target.value);
                      }} className='' type='select' options={promotions}
                    />
                  </div>

                  <div className='border p-2 border-gray-500 rounded-lg'>
                    <CustomInput idName='studentSearch' value={studentSearchTerm} label='Chercher un étudiant' onChange={(e) => setStudentSearchTerm(e.target.value)} className='' type='text' options={[]}
                    />
                    <CustomInput idName='etudiant_id' value={newDiploma.etudiant_id} label='Étudiant' onChange={handleInputChange} className='' type='select' options={filteredStudents} isStudentSelect={true}
                    />
                  </div>

                  <div ref={fileInputRef}>
                    <label htmlFor="diplomaFile" className="block text-sm font-medium text-gray-700">
                      Fichier du diplôme
                    </label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${fileError ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 24m0 0l4-4m4-4l3.172-3.172a4 4 0 015.656 0L40 8z"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="diplomaFile"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Télécharger un fichier</span>
                            <input id="diplomaFile" name="diplomaFile" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF jusqu'à 10MB
                        </p>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Fichier sélectionné: {selectedFile.name}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="qrCodeDataUrl" className="block text-sm font-medium text-gray-700">
                      Aperçu du code QR
                    </label>
                    {qrCodeDataUrl && (
                      <img src={qrCodeDataUrl} alt="QR Code" className="mt-1" />
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse w-full">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      'Ajouter'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AddDiplomaModal;
