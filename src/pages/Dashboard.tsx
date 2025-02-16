import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  FileText,
  BookOpen,
  Layers,
  Search,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface Stats {
  students: number;
  diplomas: number;
  faculties: number;
  departments: number;
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
  });
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (profile === null && !profileLoading) {
      navigate('/');
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

      if (profile?.role === 'university_staff' && profile?.universite_id) {
        // Filter queries based on the university ID
        const universityId = profile.universite_id;

        diplomasQuery = diplomasQuery.eq('universite_id', universityId);
        facultiesQuery = facultiesQuery.eq('universite_id', universityId);
        departmentsQuery = departmentsQuery.eq('universite_id', universityId);
        studentsQuery = studentsQuery.eq('universite_id', universityId);
      }

      const [students, diplomas, faculties, departments] = await Promise.all([
        studentsQuery,
        diplomasQuery,
        facultiesQuery,
        departmentsQuery,
      ]);

      setStats({
        students: students.count || 0,
        diplomas: diplomas.count || 0,
        faculties: faculties.count || 0,
        departments: departments.count || 0,
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}