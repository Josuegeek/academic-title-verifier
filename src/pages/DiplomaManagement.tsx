import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search } from 'lucide-react';

interface Diploma {
  id_titre: number;
  libelle_titre: string;
  etudiant: {
    nom: string;
    postnom: string;
    prenom: string;
  };
}

export function DiplomaManagement() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDiplomas();
  }, []);

  async function fetchDiplomas() {
    try {
      const { data, error } = await supabase
        .from('titre_academique')
        .select(`
          id,
          libelle_titre,
          etudiant:etudiant_id (
            nom,
            postnom,
            prenom
          )
        `);

      if (error) throw error;
      setDiplomas(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  const filteredDiplomas = diplomas.filter((diploma) => {
    const searchString = searchTerm.toLowerCase();
    return (
      diploma.libelle_titre.toLowerCase().includes(searchString) ||
      diploma.etudiant.nom.toLowerCase().includes(searchString) ||
      diploma.etudiant.prenom.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des diplômes
        </h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
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
                          <tr key={diploma.id_titre}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {diploma.libelle_titre}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {`${diploma.etudiant.nom} ${diploma.etudiant.postnom} ${diploma.etudiant.prenom}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                Voir
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
    </div>
  );
}