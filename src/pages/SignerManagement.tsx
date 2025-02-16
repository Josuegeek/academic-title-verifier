import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Faculty } from '../models/ModelsForUnivesity';
import { fetchFaculties } from '../api/Faculty';
import { fetchSigners, addSigner, updateSigner, deleteSigner, SignerM, Signer } from '../api/Signer';

interface SignerManagementProps {
    profile: Profile | null;
}

export function SignerManagement({ profile }: SignerManagementProps) {
    const navigate = useNavigate();
    const [signers, setSigners] = useState<SignerM[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newSigner, setNewSigner] = useState({
        nom: '',
        postnom: '',
        prenom: '',
        faculte_id: '' as string | null,
        role: 'Doyen de la faculté' as 'Doyen de la faculté' | 'Secrétaire générale académique',
    });
    const [editingSigner, setEditingSigner] = useState<Signer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (profile?.role !== 'university_staff' && profile?.role !== 'admin') {
            toast.error('Vous devez être membre de l\'université ou administrateur pour accéder à cette page.');
            navigate('/');
        }
    }, [profile, navigate]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [signersData, facultiesData] = await Promise.all([
                fetchSigners(),
                fetchFaculties(),
            ]);

            if (signersData.error) throw signersData.error;
            if (facultiesData.error) throw facultiesData.error;

            setSigners(signersData.data || []);
            setFaculties(facultiesData.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Erreur lors du chargement des données');
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSigner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSigner.nom.trim() || !newSigner.prenom.trim()) {
            toast.error('Le nom et le prénom sont requis.');
            return;
        }
        if (newSigner.role === 'Doyen de la faculté' && !newSigner.faculte_id) {
            toast.error('La faculté est requise pour le Doyen de la faculté.');
            return;
        }

        setIsAdding(true);
        try {
            console.log('newSigner', newSigner);

            if(newSigner.faculte_id===null || newSigner.faculte_id==='') {
                console.log('newSigner.faculte_id', newSigner.faculte_id);
                
                setNewSigner({ ...newSigner, faculte_id: null });

                console.log('newSigner', newSigner);
                
            }
            
            const { error } = await addSigner({ ...newSigner, faculte_id: newSigner.faculte_id || '' });

            if (error) throw error;
            setNewSigner({ nom: '', postnom: '', prenom: '', faculte_id: '', role: 'Doyen de la faculté' });
            fetchData();
            toast.success('Signataire ajouté avec succès !');
        } catch (error) {
            console.error('Error adding signer:', error);
            setError('Erreur lors de l\'ajout du signataire');
            toast.error('Erreur lors de l\'ajout du signataire');
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateSigner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSigner) return;

        setIsUpdating(true);
        try {
            const { error } = await updateSigner(editingSigner.id, {
                nom: editingSigner.nom,
                postnom: editingSigner.postnom,
                prenom: editingSigner.prenom,
                faculte_id: editingSigner.faculte_id,
                role: editingSigner.role,
            });

            if (error) throw error;
            setEditingSigner(null);
            fetchData();
            toast.success('Signataire mis à jour avec succès !');
        } catch (error) {
            console.error('Error updating signer:', error);
            setError('Erreur lors de la mise à jour du signataire');
            toast.error('Erreur lors de la mise à jour du signataire');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteSigner = async (id: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce signataire ?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const { error } = await deleteSigner(id);

            if (error) throw error;
            fetchData();
            toast.success('Signataire supprimé avec succès !');
        } catch (error) {
            console.error('Error deleting signer:', error);
            setError('Erreur lors de la suppression du signataire');
            toast.error('Erreur lors de la suppression du signataire');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSigners = signers.filter((signer) => {
        const searchString = searchTerm.toLowerCase();
        return (
            signer.nom.toLowerCase().includes(searchString) ||
            signer.postnom?.toLowerCase().includes(searchString) ||
            signer.prenom.toLowerCase().includes(searchString) ||
            signer.role.toLowerCase().includes(searchString) ||
            signer.faculte.libelle_fac.toLowerCase().includes(searchString)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des signataires</h1>
            </header>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Add Signer Form */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleAddSigner} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                                <input type="text" id="nom" value={newSigner.nom} onChange={(e) => setNewSigner({ ...newSigner, nom: e.target.value })} className="mt-1 p-2 border block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="postnom" className="block text-sm font-medium text-gray-700">Post-nom</label>
                                <input type="text" id="postnom" value={newSigner.postnom || ''} onChange={(e) => setNewSigner({ ...newSigner, postnom: e.target.value })} className="mt-1 p-2 border block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                                <input type="text" id="prenom" value={newSigner.prenom} onChange={(e) => setNewSigner({ ...newSigner, prenom: e.target.value })} className="mt-1 p-2 border block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="faculte_id" className="block text-sm font-medium text-gray-700">Faculté</label>
                                <select
                                    id="faculte_id"
                                    value={newSigner.faculte_id || ''}
                                    onChange={(e) => setNewSigner({ ...newSigner, faculte_id: e.target.value })}
                                    className="mt-1 p-2 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    disabled={newSigner.role === 'Secrétaire générale académique'}
                                    required={newSigner.role === 'Doyen de la faculté'}
                                >
                                    <option value="">Sélectionnez une faculté</option>
                                    {faculties.map((faculty) => (
                                        <option key={faculty.id} value={faculty.id}>{faculty.libelle_fac}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                                <select id="role" value={newSigner.role} onChange={(e) => setNewSigner({ ...newSigner, role: e.target.value as 'Doyen de la faculté' | 'Secrétaire générale académique' })} className="mt-1 p-2 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="Doyen de la faculté">Doyen de la faculté</option>
                                    <option value="Secrétaire générale académique">Secrétaire générale académique</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={isAdding} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                {isAdding ? (
                                    <div className="h-5 w-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="h-5 w-5 mr-2" />
                                        Ajouter
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Rechercher un signataire..."
                    />
                </div>
            </div>

            {/* Signers List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculté</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredSigners.map((signer) => (
                                                <tr key={signer.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingSigner?.id === signer.id ? (
                                                            <div className="flex space-x-2">
                                                                <input type="text" value={editingSigner.nom} onChange={(e) => setEditingSigner({ ...editingSigner, nom: e.target.value })} className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Nom" required />
                                                                <input type="text" value={editingSigner.postnom || ''} onChange={(e) => setEditingSigner({ ...editingSigner, postnom: e.target.value })} className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Post-nom" />
                                                                <input type="text" value={editingSigner.prenom} onChange={(e) => setEditingSigner({ ...editingSigner, prenom: e.target.value })} className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Prénom" required />
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-900">{signer.nom} {signer.postnom} {signer.prenom}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingSigner?.id === signer.id ? (
                                                            <select value={editingSigner.faculte_id} onChange={(e) => setEditingSigner({ ...editingSigner, faculte_id: e.target.value })} className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" disabled={editingSigner.role === 'Secrétaire générale académique'}>
                                                                <option value="">Sélectionnez une faculté</option>
                                                                {faculties.map((faculty) => (
                                                                    <option key={faculty.id} value={faculty.id}>{faculty.libelle_fac}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="text-sm text-gray-900">{signer.faculte?.libelle_fac}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingSigner?.id === signer.id ? (
                                                            <select value={editingSigner.role} onChange={(e) => setEditingSigner({ ...editingSigner, role: e.target.value as 'Doyen de la faculté' | 'Secrétaire générale académique' })} className="shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
                                                                <option value="Doyen de la faculté">Doyen de la faculté</option>
                                                                <option value="Secrétaire générale académique">Secrétaire générale académique</option>
                                                            </select>
                                                        ) : (
                                                            <div className="text-sm text-gray-900">{signer.role}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {editingSigner?.id === signer.id ? (
                                                            <div className="flex justify-end space-x-2">
                                                                <button onClick={handleUpdateSigner} disabled={isUpdating} className="text-indigo-600 hover:text-indigo-900">
                                                                    {isUpdating ? <div className="h-4 w-4 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" /> : <Edit2 className="h-4 w-4" />}
                                                                </button>
                                                                <button onClick={() => setEditingSigner(null)} className="text-gray-600 hover:text-gray-900">
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end space-x-2">
                                                                <button onClick={() => setEditingSigner(signer)} className="text-indigo-600 hover:text-indigo-900">
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={() => handleDeleteSigner(signer.id)} disabled={isDeleting} className="text-red-600 hover:text-red-900">
                                                                    {isDeleting ? <div className="h-4 w-4 border-t-2 border-red-600 border-solid rounded-full animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
