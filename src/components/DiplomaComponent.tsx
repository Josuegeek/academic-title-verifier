import { FileText } from "lucide-react";
import { DiplomaData } from "../pages/AuthenticateDiploma";

interface DiplomaComponentProps {
    diploma: DiplomaData;
    handleShowDiplomaDetails: (diploma: DiplomaData) => void;
    handleAuthentication: (id: string, qr_code: string) => void;
}

export function DiplomaComponent({ diploma, handleAuthentication, handleShowDiplomaDetails }: DiplomaComponentProps) {

    return (
        <div key={diploma.id} className="p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {diploma.libelle_titre}
                    </h3>
                    <div className='flex flex-row gap-2 flex-wrap'>
                        <p className="text-sm text-gray-500">
                            Étudiant: <b>{diploma.etudiant?.nom} {diploma.etudiant?.postnom} {diploma.etudiant?.prenom}</b>
                        </p>
                        <p className="text-sm text-gray-500">
                            Faculté: <b>{diploma.etudiant?.promotion?.departement?.faculte?.libelle_fac}</b>
                        </p>
                        <p className="text-sm text-gray-500">
                            Département: <b>{diploma.etudiant?.promotion?.departement?.libelle_dept}</b>
                        </p>
                        <p className="text-sm text-gray-500">
                            Promotion: <b>{diploma.etudiant?.promotion?.libelle_promotion}</b>
                        </p>
                    </div>

                    <b className="text-sm text-gray-500">
                        {`Signataire: ${diploma.deliver.nom} ${diploma.deliver.postnom} ${diploma.deliver.prenom} (${diploma.deliver.role})`}
                    </b>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleShowDiplomaDetails(diploma)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Détails
                    </button>
                    {diploma.est_authentique ? (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Authentifié
                        </span>
                    ) : (
                        <button
                            onClick={() => handleAuthentication(diploma.id, diploma.qr_code)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Authentifier
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

}