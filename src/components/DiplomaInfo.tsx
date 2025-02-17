import { CheckCircle, X, XCircle } from 'lucide-react';

interface DiplomaInfoProps {
    result: {
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
            deliver: {
                id: string;
                nom: string;
                postnom: string;
                prenom: string;
                role: 'Doyen de la faculté' | 'Secrétaire générale académique';
            }
        };
    } | null;
    closeModal: () => void;
}

export function DiplomaInfo({ result, closeModal }: DiplomaInfoProps) {
    if (!result?.diploma) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col bg-white rounded-lg shadow-lg relative w-full max-w-3xl max-h-[80vh] mx-10">
                <div className='relative'>
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <X className={`h-6 w-6 ${result.isAuthentic ? '' : 'bg-red-800'} rounded-full p-1"`} />
                    </button>
                    <div className={`rounded-md ${result.isAuthentic ? 'bg-green-50' : 'bg-red-50'} p-4`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {result.isAuthentic ? (
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-400" />
                                )}
                            </div>
                            <div className="ml-3">
                                <h3 className={`text-sm font-medium ${result.isAuthentic ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.isAuthentic
                                        ? 'Diplôme authentique'
                                        : 'Diplôme enregistré mais non authentifié par le ministère de l\'enseignement supérieur et universitaire'}
                                </h3>
                            </div>
                            <div className="ml-3 flex justify-end">
                                <a
                                    href={result.diploma.fichier_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Voir le PDF
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="p-6 w-full overflow-y-auto">
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
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Année académique</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {result.diploma.annee_academique}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Promotion</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {result.diploma.etudiant.promotion.libelle_promotion}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Département</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {result.diploma.etudiant.promotion.departement.libelle_dept}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Faculté</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {result.diploma.etudiant.promotion.departement.faculte.libelle_fac}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Signé et délivré par</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {`${result.diploma.deliver?.nom} ${result.diploma.deliver?.postnom} ${result.diploma.deliver?.prenom} (${result.diploma.deliver?.role})`}
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
                                    {new Date(result.diploma.etudiant.date_naissance).toLocaleDateString()}
                                </p>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
