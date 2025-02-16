import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Upload, CheckCircle, XCircle, QrCode, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { PDFDocument } from 'pdf-lib';
import jsQR from 'jsqr';

interface VerificationResult {
  isAuthentic: boolean;
  diploma?: {
    libelle_titre: string;
    date_delivrance: string;
    lieu: string;
    domaine: string;
    annee_academique: string;
    fichier_url: string;
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
  };
}

export function DiplomaVerification() {
  const [qrCode, setQrCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let query = supabase
        .from('titre_academique')
        .select(`
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
        setResult({ isAuthentic: false });
      } else {
        setResult({
          isAuthentic: data.est_authentique,
          diploma: data,
        });
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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();
  
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
  
      if (!ctx) {
        console.error('Could not get canvas context');
        return null;
      }
  
      // Render the PDF page to the canvas
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;

      console.log(url)
  
      new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        };
      });
  
      // Extract the QR code
      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, width, height);
  
      if (code) {
        return code.data;
      } else {
        console.log('No QR code found');
        return null;
      }
    } catch (error) {
      console.error('Error extracting QR code from PDF:', error);
      return null;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
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
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
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

        {result && (
          <div className="p-6">
            <div
              className={`rounded-md ${
                result.isAuthentic ? 'bg-green-50' : 'bg-red-50'
              } p-4`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {result.isAuthentic ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${
                      result.isAuthentic ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.isAuthentic
                      ? 'Diplôme authentique'
                      : 'Diplôme non authentique'}
                  </h3>
                </div>
              </div>
            </div>

            {result.diploma && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900">
                  Détails du diplôme
                </h4>
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Titre</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {result.diploma.libelle_titre}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Date de délivrance
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(result.diploma.date_delivrance).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Lieu</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {result.diploma.lieu}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Domaine</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {result.diploma.domaine}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Informations de l'étudiant
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <p>
                        {result.diploma.etudiant.nom}{' '}
                        {result.diploma.etudiant.postnom}{' '}
                        {result.diploma.etudiant.prenom}
                      </p>
                      <p className="mt-1">
                        Né(e) le{' '}
                        {new Date(
                          result.diploma.etudiant.date_naissance
                        ).toLocaleDateString()}
                      </p>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}