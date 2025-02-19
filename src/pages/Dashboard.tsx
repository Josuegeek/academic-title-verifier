import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  FileText,
  BookOpen,
  Layers,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  User,
  Building2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface Stats {
  students: number;
  diplomas: number;
  faculties: number;
  departments: number;
  authenticatedDiplomas: number;
  unauthenticatedDiplomas: number;
  adminAccounts: number;
  universityStaffAccounts: number;
  esuStaffAccounts: number;
  visitorAccounts: number;
}

interface DashboardProps {
  profile: Profile | null;
}

export function Dashboard({ profile }: DashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    students: 0,
    diplomas: 0,
    faculties: 0,
    departments: 0,
    authenticatedDiplomas: 0,
    unauthenticatedDiplomas: 0,
    adminAccounts: 0,
    universityStaffAccounts: 0,
    esuStaffAccounts: 0,
    visitorAccounts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!profile && !profileLoading) {
      return;
    } else if (profile) {
      setProfileLoading(false);
    }
  }, [profile, profileLoading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let studentsQuery = supabase.from('etudiant').select('id', { count: 'exact' });
      let diplomasQuery = supabase.from('titre_academique').select('id', { count: 'exact' });
      let facultiesQuery = supabase.from('faculte').select('id', { count: 'exact' });
      let departmentsQuery = supabase.from('departement').select('id', { count: 'exact' });
      let authenticatedDiplomasQuery = supabase.from('titre_academique').select('id', { count: 'exact' }).eq('est_authentique', true);
      let unauthenticatedDiplomasQuery = supabase.from('titre_academique').select('id', { count: 'exact' }).eq('est_authentique', false);

      let adminAccountsQuery = supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'admin');
      let universityStaffAccountsQuery = supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'university_staff');
      let esuStaffAccountsQuery = supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'esu_staff');
      let visitorAccountsQuery = supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'verifier');

      if (profile?.role === 'university_staff' && profile?.universite_id) {
        // Filter queries based on the university ID
        const universityId = profile.universite_id;

        diplomasQuery = diplomasQuery.eq('universite_id', universityId);
        facultiesQuery = facultiesQuery.eq('universite_id', universityId);
        departmentsQuery = departmentsQuery.eq('universite_id', universityId);
        studentsQuery = studentsQuery.eq('universite_id', universityId);
        authenticatedDiplomasQuery = authenticatedDiplomasQuery.eq('universite_id', universityId);
        unauthenticatedDiplomasQuery = unauthenticatedDiplomasQuery.eq('universite_id', universityId);
      }

      const [students, diplomas, faculties, departments, authenticatedDiplomas, unauthenticatedDiplomas, adminAccounts, universityStaffAccounts, esuStaffAccounts, visitorAccounts] = await Promise.all([
        studentsQuery,
        diplomasQuery,
        facultiesQuery,
        departmentsQuery,
        authenticatedDiplomasQuery,
        unauthenticatedDiplomasQuery,
        adminAccountsQuery,
        universityStaffAccountsQuery,
        esuStaffAccountsQuery,
        visitorAccountsQuery,
      ]);

      setStats({
        students: students.count || 0,
        diplomas: diplomas.count || 0,
        faculties: faculties.count || 0,
        departments: departments.count || 0,
        authenticatedDiplomas: authenticatedDiplomas.count || 0,
        unauthenticatedDiplomas: unauthenticatedDiplomas.count || 0,
        adminAccounts: adminAccounts.count || 0,
        universityStaffAccounts: universityStaffAccounts.count || 0,
        esuStaffAccounts: esuStaffAccounts.count || 0,
        visitorAccounts: visitorAccounts.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-2 text-sm text-gray-600">
            Bienvenue, visiteur. Veuillez utiliser les options ci-dessous.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <Link
            to="/verify"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-blue-600 transition-all p-5 flex items-center justify-center"
          >
            <div className="text-center">
              <Search className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-lg font-semibold text-gray-900">
                Vérifier un diplôme
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-blue-600 transition-all p-5 flex items-center justify-center"
          >
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-lg font-semibold text-gray-900">
                Retour à l'accueil
              </p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      </header>

      {/* Admin Dashboard */}
      {profile.role === 'admin' && (
        <>
          <div className="grid grid-cols-1 max-sm:grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserPlus className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Comptes Admin
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.adminAccounts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Comptes Staff Université
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.universityStaffAccounts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Comptes Staff ESU
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.esuStaffAccounts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Comptes Visiteurs
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.visitorAccounts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* University Staff Dashboard */}
      {profile.role === 'university_staff' && (
        <>
          <div className="grid grid-cols-1 max-sm:grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Étudiants
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.students}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/students"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Voir tous les étudiants
                  </Link>
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
                        Diplômes
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.diplomas}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/diplomas"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Gérer les diplômes
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Facultés
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.faculties}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/faculties"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Gérer les facultés
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Layers className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Départements
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.departments}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/departments"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Gérer les départements
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actions rapides
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  to="/diplomas"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Ajouter un diplôme
                </Link>
                <Link
                  to="/verify"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Vérifier un diplôme
                </Link>
                <Link
                  to="/students"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Gérer les étudiants
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ESU Staff Dashboard */}
      {profile.role === 'esu_staff' && (
        <div className="grid grid-cols-1 max-sm:grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <Link to={'/authenticate-diploma'} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-blue-600 transition-all">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Titres Authentifiés
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.authenticatedDiplomas}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          <Link to={'/authenticate-diploma'} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-blue-600 transition-all">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldAlert className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Titres Non Authentifiés
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.unauthenticatedDiplomas}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Verifier Dashboard */}
      {profile.role === 'verifier' && (
        <div className="grid grid-cols-1 gap-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <Link
              to="/"
              className="block px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition-colors"
            >
              <dt className="text-sm font-medium text-gray-500">
                Retour à l'accueil
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-400" />
                  Revenir à la page d'accueil
                </div>
              </dd>
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <Link
              to="/verify"
              className="block px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition-colors"
            >
              <dt className="text-sm font-medium text-gray-500">
                Vérifier un diplôme
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-gray-400" />
                  Commencer la vérification d'un diplôme
                </div>
              </dd>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}