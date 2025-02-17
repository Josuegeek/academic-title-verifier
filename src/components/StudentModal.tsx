import React, { useState, useEffect } from 'react';
import { fetchPromotionsByDepartmentId } from '../api/Promotion';
import { Department, Faculty, Promotion } from '../models/ModelsForUnivesity';
import { fetchFaculties } from '../api/Faculty';
import { fetchDepartmentsByFacultyId } from '../api/Department';

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (studentData: any) => void;
    editingStudent: any | null;
    newStudent: any;
    setNewStudent: (student: any) => void;
    loading: boolean;
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSubmit, editingStudent, newStudent, setNewStudent, loading }) => {

    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [promotionSearchTerm, setPromotionSearchTerm] = useState('');

    const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const facultiesData = (await fetchFaculties()).data;
            setFaculties(facultiesData || []);
            console.log(selectedPromotion);
            

            if (selectedFaculty) {
                const departmentsData = (await fetchDepartmentsByFacultyId(selectedFaculty)).data;
                setDepartments(departmentsData || []);
            } else {
                setDepartments([]);
            }

            if (selectedDepartment) {
                const promotionsData = (await fetchPromotionsByDepartmentId(selectedDepartment)).data;
                setPromotions(promotionsData || []);
                setFilteredPromotions(promotionsData || []);
            } else {
                setPromotions([]);
                setFilteredPromotions([]);
            }
        };

        loadData();
    }, [selectedFaculty, selectedDepartment]);

    useEffect(() => {
        const filtered = promotions?.filter(promotion =>
            promotion.libelle_promotion.toLowerCase().includes(promotionSearchTerm.toLowerCase())
        );
        setFilteredPromotions(filtered || []);
    }, [promotions, promotionSearchTerm]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(newStudent);
    };

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ maxWidth: '600px' }}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            {editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
                        </h3>
                        <form onSubmit={handleSubmit} className="mt-3 space-y-4">

                            <div className='max-h-[400px] overflow-y-auto'>
                                <div>
                                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                                    <input
                                        type="text"
                                        id="nom"
                                        value={newStudent.nom}
                                        onChange={(e) => setNewStudent({ ...newStudent, nom: e.target.value })}
                                        required
                                        className="mt-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="postnom" className="block text-sm font-medium text-gray-700">Post-nom</label>
                                    <input
                                        type="text"
                                        id="postnom"
                                        value={newStudent.postnom}
                                        onChange={(e) => setNewStudent({ ...newStudent, postnom: e.target.value })}
                                        className="mt-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                                    <input
                                        type="text"
                                        id="prenom"
                                        value={newStudent.prenom}
                                        onChange={(e) => setNewStudent({ ...newStudent, prenom: e.target.value })}
                                        required
                                        className="mt-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700">Date de naissance</label>
                                    <input
                                        type="date"
                                        id="date_naissance"
                                        value={newStudent.date_naissance}
                                        onChange={(e) => setNewStudent({ ...newStudent, date_naissance: e.target.value })}
                                        required
                                        className="mt-1 p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">Faculté</label>
                                    <select
                                        id="faculty"
                                        value={selectedFaculty}
                                        onChange={(e) => {
                                            setSelectedFaculty(e.target.value);
                                            setSelectedDepartment('');
                                            setSelectedPromotion('');
                                        }}
                                        className="mt-1 p-2 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        disabled={faculties.length === 0}
                                    >
                                        <option value="">Sélectionnez une faculté</option>
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
                                        className="mt-1 p-2 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        disabled={departments.length === 0}
                                    >
                                        <option value="">Sélectionnez un département</option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.id}>
                                                {department.libelle_dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="promotion_id" className="block text-sm font-medium text-gray-700">Promotion</label>
                                    <input
                                        type="text"
                                        value={promotionSearchTerm}
                                        onChange={(e) => setPromotionSearchTerm(e.target.value)}
                                        className="p-2 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Rechercher une promotion..."
                                        disabled={promotions.length === 0}
                                    />
                                    <select
                                        id="promotion_id"
                                        value={newStudent.promotion_id}
                                        onChange={(e) => setNewStudent({ ...newStudent, promotion_id: e.target.value })}
                                        required
                                        className="mt-1 p-2 border block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        disabled={promotions.length === 0}
                                    >
                                        <option value="">Sélectionnez une promotion</option>
                                        {filteredPromotions.map((promotion) => (
                                            <option key={promotion.id} value={promotion.id}>
                                                {promotion.libelle_promotion}
                                                {promotion.option ? ` - ${promotion.option}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ): (editingStudent)? "Modifier" : 'Enregistrer'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={onClose}
                                >
                                    Annuler
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentModal;