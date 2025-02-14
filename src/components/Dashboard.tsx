import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ajouter un diplôme
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">
                      Nouveau titre
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/diplomas')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vérifier un diplôme
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">
                      Recherche
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/verify')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Vérifier
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Historique
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">
                      Activités récentes
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-indigo-600 hover:text-indigo-500">
                Voir tout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}