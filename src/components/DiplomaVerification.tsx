import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Upload, CheckCircle, XCircle } from 'lucide-react';

interface VerificationResult {
  isAuthentic: boolean;
  diploma?: {
    libelle_titre: string;
    date_delivrance: string;
    lieu: string;
    domaine: string;
    etudiant: {
      nom: string;
      postnom: string;
      prenom: string;
      date_naissance: string;
    };
  };
}

export function DiplomaVerification() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase
        .from('titre_academique')
        .select(`
          libelle_titre,
          date_delivrance,
          lieu,
          domaine,
          est_authentique,
          etudiant (
            nom,
            postnom,
            prenom,
            date_naissance
          )
        `)
        .eq('qr_code', qrCode)
        .single();

      if (error) throw error;

      if (!data) {
        setResult({ isAuthentic: false });
      } else {
        setResult({
          isAuthentic: data.est_authentique,
          diploma: data,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Vérification de diplôme
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Vérifiez l'authenticité d'un diplôme en utilisant son code QR
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
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Entrez le code QR du diplôme"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !qrCode}
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