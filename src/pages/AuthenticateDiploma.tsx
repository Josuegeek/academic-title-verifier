import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { DiplomaInfo } from '../components/DiplomaInfo';
import { Faculty, Department, Promotion } from '../models/ModelsForUnivesity';
import { fetchFaculties } from '../api/Faculty';
import { fetchDepartmentByFacultyId } from '../api/Department';
import { fetchPromotionByDepartmentId } from '../api/Promotion';
import { DiplomaComponent } from '../components/DiplomaComponent';

export interface DiplomaData {
    id: string;
    libelle_titre: string;
    date_delivrance: string;
    lieu: string;
    qr_code: string;
    domaine: string;
    annee_academique: string;
    fichier_url: string;
    est_authentique: boolean;
    etudiant: {
        id: string;
        nom: string;
        postnom: string;
        prenom: string;
        date_naissance: string;
        promotion: {
            id: string;
            libelle_promotion: string;
            departement: {
                id: string;
                libelle_dept: string;
                faculte: {
                    id: string;
                    libelle_fac: string;
                };
            };
        };
    };
    deliver: {
        id: string;
        nom: string;
        postnom: string;
        prenom: string;
        role: 'Doyen de la faculté' | 'Secrétaire générale académique';
    };
}

interface AuthenticateDiplomaProps {
    profile: Profile | null;
}

export function AuthenticateDiploma({ profile }: AuthenticateDiplomaProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDiploma, setSelectedDiploma] = useState<DiplomaData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [diplomas, setDiplomas] = useState<DiplomaData[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (profile?.role !== 'esu_staff') {
            toast.error('Vous devez être membre de l\'ESU pour accéder à cette page.');
            navigate('/');
        } else {
            fetchDiplomas();
            fetchFacultiess();
        }
    }, [profile, navigate]);

    useEffect(() => {
        const fetchDepartments = async () => {
            if (selectedFaculty) {
                const { data, error } = await fetchDepartmentByFacultyId(selectedFaculty);
                if (error) {
                    console.error("Error fetching departments:", error);
                    return;
                }
                setDepartments(data || []);
            } else {
                setDepartments([]);
            }
            setSelectedDepartment('');
            setSelectedPromotion('');
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
            } else {
                setPromotions([]);
            }
            setSelectedPromotion('');
        };

        fetchPromotions();
    }, [selectedDepartment]);

    const fetchDiplomas = async () => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('titre_academique')
                .select<string, DiplomaData>(`
                    id,
                    libelle_titre,
                    date_delivrance,
                    lieu,
                    qr_code,
                    est_authentique,
                    annee_academique,
                    fichier_url,
                    etudiant (
                        id,
                        nom,
                        postnom,
                        prenom,
                        date_naissance,
                        promotion (
                            id,
                            libelle_promotion,
                            departement (
                                id,
                                libelle_dept,
                                faculte (
                                id,
                                libelle_fac
                                )
                            )
                        )
                    ),
                    deliver(
                        id,
                        nom,
                        postnom,
                        prenom,
                        role
                    )
                `);

            if (selectedFaculty) {
                query = query.eq('etudiant.promotion.departement.faculte.id', selectedFaculty);
            }
            if (selectedDepartment) {
                query = query.eq('etudiant.promotion.departement.id', selectedDepartment);
            }
            if (selectedPromotion) {
                query = query.eq('etudiant.promotion.id', selectedPromotion);
            }

            const { data, error } = await query;

            if (error) throw error;
            console.log(data);
            
            setDiplomas(data || []);
        } catch (error) {
            console.error('Error fetching diplomas:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des diplômes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiplomas();
    }, [selectedFaculty, selectedDepartment, selectedPromotion]);

    const fetchFacultiess = async () => {
        try {
            const { data, error } = await fetchFaculties();
            if (error) throw error;
            setFaculties(data || []);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            setError('Erreur lors du chargement des facultés');
        }
    };

    const handleAuthentication = async (diplomaId: string, qrCodeValue: string) => {
        setLoading(true);
        setError(null);

        try {
            let authenticatedFile = null;
            const { data: diplomaData, error: diplomaError } = await supabase
                .from('titre_academique')
                .select<string, DiplomaData>(`
                    id,
                    libelle_titre,
                    date_delivrance,
                    lieu,
                    qr_code,
                    est_authentique,
                    annee_academique,
                    fichier_url,
                    etudiant (
                      id,
                      nom,
                      postnom,
                      prenom,
                      date_naissance,
                      promotion (
                        id,
                        libelle_promotion,
                        departement (
                          id,
                          libelle_dept,
                          faculte (
                            id,
                            libelle_fac
                          )
                        )
                      )
                    ),
                    signe_par
                  `)
                .eq('id', diplomaId)
                .single();

            if (diplomaError) throw diplomaError;

            if (diplomaData?.fichier_url) {
                // Fetch the file from the URL
                const response = await fetch(diplomaData.fichier_url);
                const blob = await response.blob();
                authenticatedFile = new File([blob], 'diploma.pdf', { type: 'application/pdf' });
            } else {
                throw new Error('Fichier PDF non trouvé pour ce diplôme.');
            }

            if (!authenticatedFile) {
                throw new Error('Fichier PDF non trouvé.');
            }

            const authenticatedFileWithPage = await addAuthenticationPage(authenticatedFile, qrCodeValue);
            if (authenticatedFileWithPage) {
                const fileName = diplomaData.etudiant.id + "/" + (diplomaData.fichier_url?.split('/').pop()?.split('?')[0] || 'diploma.pdf');
                console.log("filename 1 :", fileName);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('diploma-files')
                    .update(fileName, authenticatedFileWithPage, {
                        upsert: true
                    });

                console.log("File name-> :", fileName, uploadData);

                if (uploadError) throw uploadError;

                // Update the 'est_authentique' attribute to TRUE
                const { error: updateError } = await supabase
                    .from('titre_academique')
                    .update({ est_authentique: true })
                    .eq('id', diplomaId);


                if (updateError) {
                    console.error('Error updating est_authentique:', updateError);
                    toast.error('Erreur lors de la mise à jour du statut d\'authentification.');
                } else {
                    toast.success('Diplôme authentifié avec succès !');
                    fetchDiplomas();
                    diplomaData.est_authentique = true;
                    setSelectedDiploma(diplomaData);
                    setIsModalOpen(true);
                }
            } else {
                toast.error('Erreur lors de l\'ajout de la page d\'authentification.');
            }
        } catch (error) {
            console.error('Error authenticating diploma:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'authentification du diplôme.');
            toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'authentification du diplôme.');
        } finally {
            setLoading(false);
        }
    };

    const addAuthenticationPage = async (file: File, qrCodeValue: string): Promise<File | null> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Add a new page at the beginning
            const page = pdfDoc.insertPage(0, PageSizes.A4);

            // Embed the ESU logo
            const esuLogoUrl = '/imgs/logo_esu.png';
            const esuLogoBytes = await fetch(esuLogoUrl).then(r => r.arrayBuffer());
            const esuLogoImage = await pdfDoc.embedPng(esuLogoBytes);

            // Embed the DRC flag
            const flagDrcUrl = '/imgs/flag_drc.png';
            const flagDrcBytes = await fetch(flagDrcUrl).then(r => r.arrayBuffer());
            const flagDrcImage = await pdfDoc.embedPng(flagDrcBytes);

            // Embed the QR code
            const qrCodeDataUrl = await QRCode.toDataURL(qrCodeValue, { errorCorrectionLevel: 'H' });
            const qrCodeBytes = await fetch(qrCodeDataUrl).then(r => r.arrayBuffer());
            const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);

            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Page dimensions
            const pageWidth = page.getWidth();
            const pageHeight = page.getHeight();

            const text1 = 'République Démocratique du Congo';
            const text2 = 'Ministère de l\'Enseignement Supérieur et Universitaire';

            const text1Width = font.widthOfTextAtSize(text1, 16);
            const text2Width = font.widthOfTextAtSize(text2, 16);

            page.drawText(text1, {
                x: (pageWidth - text1Width) / 2,
                y: pageHeight - 50,
                font,
                size: 16,
                color: rgb(0, 0, 0),
            });

            page.drawText(text2, {
                x: (pageWidth - text2Width) / 2,
                y: pageHeight - 70,
                font,
                size: 16,
                color: rgb(0, 0, 0),
            });

            // Header
            const totalImageWidth = 250;
            const startX = (pageWidth - totalImageWidth) / 2;

            page.drawImage(flagDrcImage, {
                x: startX,
                y: pageHeight - 150,
                width: 80,
                height: 50,
            });

            page.drawImage(esuLogoImage, {
                x: startX + 50 + 20, // 50 is the width of flagDrcImage
                y: pageHeight - 150,
                width: 150,
                height: 50,
            });

            page.drawImage(qrCodeImage, {
                x: (pageWidth - 150) / 2,
                y: (pageHeight - 200) / 2 + 60,
                width: 150,
                height: 150,
            });

            const text3 = 'Document authentifié par :';
            const text4 = 'Mohindo Nzangi';
            const text5 = "Ministre de l'enseignement Supérieur et Universitaire";

            const text3Width = font.widthOfTextAtSize(text3, 14);
            const text4Width = font.widthOfTextAtSize(text4, 18);
            const text5Width = font.widthOfTextAtSize(text5, 11);

            page.drawText(text3, {
                x: (pageWidth - text3Width) / 2,
                y: (pageHeight - 200) / 2 - 20,
                font,
                size: 14,
                color: rgb(0, 0, 0),
            });

            page.drawText(text4, {
                x: (pageWidth - text4Width) / 2,
                y: (pageHeight - 200) / 2 - 80,
                font,
                size: 18,
                color: rgb(0, 0, 0),
            });

            page.drawText(text5, {
                x: (pageWidth - text5Width) / 2,
                y: (pageHeight - 200) / 2 - 100,
                font,
                size: 11,
                color: rgb(0, 0, 0),
            });

            const modifiedPdfBytes = await pdfDoc.save();
            const modifiedPdfFile = new File([modifiedPdfBytes], file.name, { type: 'application/pdf' });
            return modifiedPdfFile;
        } catch (error) {
            console.error('Error adding authentication page:', error);
            return null;
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDiploma(null);
    };

    const handleShowDiplomaDetails = (diploma: DiplomaData) => {
        setSelectedDiploma(diploma);
        setIsModalOpen(true);
    };

    const handleRefresh = () => {
        fetchDiplomas();
        setSelectedFaculty('');
        setSelectedDepartment('');
        setSelectedPromotion('');
        setSearchTerm('');
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
                    Authentification de diplôme
                </h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">Faculté</label>
                        <select
                            id="faculty"
                            value={selectedFaculty}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border p-2"
                            onChange={(e) => {
                                setSelectedFaculty(e.target.value);
                                setSelectedDepartment('');
                                setSelectedPromotion('');
                            }}
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
                            }}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border p-2"
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
                            onChange={(e) => setSelectedPromotion(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border p-2"
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
                <div className="mt-4 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                        placeholder="Rechercher un diplôme..."
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                    {filteredDiplomas.map((diploma) => (
                        DiplomaComponent({ diploma, handleAuthentication, handleShowDiplomaDetails })
                    ))}
                </div>
            )}

            {isModalOpen && selectedDiploma && (
                <DiplomaInfo result={{ isAuthentic: selectedDiploma.est_authentique, diploma: selectedDiploma }} closeModal={closeModal} />
            )}
        </div>
    );
}
