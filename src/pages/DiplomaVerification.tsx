import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Upload, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';
import { Profile } from '../types';
import { DiplomaInfo } from '../components/DiplomaInfo';

// Import pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';
import { RenderParameters } from 'pdfjs-dist/types/src/display/api';
// Set workerSrc path
pdfjsLib.GlobalWorkerOptions.workerSrc = `cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.mjs`;

interface DiplomaData {
  id: string;
  libelle_titre: string;
  date_delivrance: string;
  lieu: string;
  domaine: string;
  annee_academique: string;
  fichier_url: string;
  est_authentique: boolean;
  etudiant: {
    nom: string;
    postnom: string;
    prenom: string;
    date_naissance: string;
    promotion: {
      libelle_promotion: string;
      departement: {
        libelle_dept: string;
        faculte: {
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
  }
}

interface DiplomaVerificationProps {
  profile: Profile | null;
}

export function DiplomaVerification({ profile }: DiplomaVerificationProps) {
  const [qrCode, setQrCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiploma, setSelectedDiploma] = useState<DiplomaData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedDiploma(null);

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
            nom,
            postnom,
            prenom,
            date_naissance,
            promotion (
              libelle_promotion,
              departement (
                libelle_dept,
                faculte (
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

      if (qrCode) {
        query = query.eq('qr_code', qrCode);
      } else if (file) {
        const qrCodeFromPdf = await extractQrCodeFromPdf(file);
        if (qrCodeFromPdf) {
          query = query.eq('qr_code', qrCodeFromPdf);
        } else {
          setError('Impossible de lire le QR code du fichier PDF.');
          toast.error('Impossible de lire le QR code du fichier PDF.');
          setLoading(false);
          return;
        }
      } else {
        setError('Veuillez entrer un code QR ou télécharger un fichier.');
        setLoading(false);
        return;
      }

      const { data, error } = await query.single();

      if (error) throw error;

      if (!data) {
        toast.error('Les informations rentrées ne correspondent pas à un diplôme enregistré.');
        setError('Les informations rentrées ne correspondent pas à un diplôme enregistré.');
      } else {
        setSelectedDiploma(data);
        toast.success("Diplôme vérifié avec succès.");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      toast.error('Les informations rentrées ne correspondent pas à un diplôme enregistré.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setQrCode('');
    }
  };

  const extractQrCodeFromPdf = async (file: File): Promise<string | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.mjs`;

      let pdf: pdfjsLib.PDFDocumentProxy;
      try {
        pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      } catch (pdfError: any) {
        console.error("Error loading PDF:", pdfError);
        setError("Erreur lors du chargement du PDF.");
        toast.error("Erreur lors du chargement du PDF.");
        return null;
      }

      let page: pdfjsLib.PDFPageProxy;
      try {
        page = await pdf.getPage(1);
      } catch (pageError: any) {
        console.error("Error getting page:", pageError);
        setError("Erreur lors de la récupération de la page PDF.");
        toast.error("Erreur lors de la récupération de la page PDF.");
        return null;
      }

      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        console.error("Could not get canvas context");
        setError("Impossible d'obtenir le contexte du canvas.");
        toast.error("Impossible d'obtenir le contexte du canvas.");
        return null;
      }
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext: RenderParameters = {
        canvasContext: context,
        viewport: viewport,
      };

      try {
        await page.render(renderContext).promise;
      } catch (renderError: any) {
        console.error("Error rendering PDF:", renderError);
        setError("Erreur lors du rendu du PDF.");
        toast.error("Erreur lors du rendu du PDF.");
        return null;
      }

      // Convert canvas to image
      const imageUrl = canvas.toDataURL("image/png");

      // Create an image element
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

      // Decode the QR code from the image
      const imgCanvas = document.createElement('canvas');
      imgCanvas.width = img.width;
      imgCanvas.height = img.height;
      const imgContext = imgCanvas.getContext('2d');
      if (!imgContext) {
        console.error("Could not get image canvas context");
        setError("Impossible d'obtenir le contexte du canvas de l'image.");
        toast.error("Impossible d'obtenir le contexte du canvas de l'image.");
        return null;
      }
      imgContext.drawImage(img, 0, 0);
      const imgData = imgContext.getImageData(0, 0, imgCanvas.width, imgCanvas.height);

      const code = jsQR(imgData.data, imgCanvas.width, imgCanvas.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        return code.data;
      } else {
        console.log('No QR code found');
        return null;
      }

    } catch (error: any) {
      console.error('Error extracting QR code from PDF:', error);
      setError(`Erreur lors de l'extraction du code QR du PDF: ${error.message}`);
      toast.error(`Erreur lors de l'extraction du code QR du PDF: ${error.message}`);
      return null;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDiploma(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Vérification de diplôme
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Vérifiez l'authenticité d'un diplôme en utilisant son code QR ou en uploadant le fichier
        </p>
      </header>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <form onSubmit={handleVerification} className="space-y-6">
            <div>
              <label
                htmlFor="qrCode"
                className="block text-sm font-medium text-gray-700"
              >
                Code QR du diplôme
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="qrCode"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="border focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                  placeholder="Entrez le code QR du diplôme"
                  disabled={!!file}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="diplomaFile"
                className="block text-sm font-medium text-gray-700"
              >
                Télécharger le fichier du diplôme
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <QrCode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="file"
                  id="diplomaFile"
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="border focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                  disabled={!!qrCode}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || (!qrCode && !file)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Vérifier le diplôme
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isModalOpen && selectedDiploma && (
          <DiplomaInfo result={{ isAuthentic: selectedDiploma.est_authentique, diploma: selectedDiploma }} closeModal={closeModal} />
        )}
      </div>
    </div>
  );
}