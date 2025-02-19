
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { DiplomaJointStudent } from '../models/ModelsForUnivesity';
import { Loader } from 'lucide-react';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendEmail: (emailAddress: string) => void;
    diploma: DiplomaJointStudent | null;
    isSubmitting?: boolean;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSendEmail, diploma, isSubmitting }) => {
    const [emailAddress, setEmailAddress] = useState('');

    const handleSend = () => {
        if (!emailAddress) {
            toast.error('Veuillez entrer une adresse email.');
            return;
        }
        onSendEmail(emailAddress);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Envoyer le lien du diplôme par email</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Veuillez entrer l'adresse email à laquelle envoyer le lien du diplôme de {diploma?.etudiant?.nom} {diploma?.etudiant?.prenom}.
                </p>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
                    <input
                        type="email"
                        id="email"
                        className="mt-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="exemple@email.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700 focus:outline-none"
                        onClick={onClose}
                    >
                        Annuler
                    </button>
                    <button
                        disabled={isSubmitting}
                        type="button"
                        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white focus:outline-none"
                        onClick={handleSend}
                    >
                        {isSubmitting ? <Loader className="w-6 h-6 animate-spin" /> 
                                      : 
                                      'Envoyer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailModal;
