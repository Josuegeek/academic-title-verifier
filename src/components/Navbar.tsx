import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
  Building2,
  BookOpen,
  Layers,
  GraduationCap as GraduationIcon,
  FileText,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface NavbarProps {
  profile: Profile;
}

export function Navbar({ profile }: NavbarProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="bg-white shadow-sm md:h-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 max-[1200px]:px-1">
        <div className="flex flex-col md:h-screen max-md:w-auto max-md:overflow-visible max-[1200px]:w-12 max-[1200px]:overflow-hidden">
          {/* Top Bar (Burger Menu, Logo, and User Dropdown) */}
          <div className="flex items-center justify-between h-16">
            {/* Burger menu button (show on small screens) */}
            <div className="md:hidden">
              <button
                onClick={() => setBurgerOpen(!burgerOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open menu</span>
                {burgerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Logo (hide on small screens when burger is active) */}
            <div className={`flex items-center ${burgerOpen ? '' : 'md:flex'}`}>
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DiplomaVerify</span>
            </div>

            {/* User Dropdown (always on top right on small screens) */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <User className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 hidden md:inline">{profile.role}</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              <div
                className={`absolute right-0 w-48 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownOpen ? '' : 'hidden'}`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex={-1}
              >
                <div className="py-1" role="none">
                  {/* Profile option */}
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    tabIndex={-1}
                    id="user-menu-item-0"
                  >
                    Profile
                  </a>
                  {/* Sign out option */}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    tabIndex={-1}
                    id="user-menu-item-2"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation links (show on medium+ screens, or when burger menu is open) */}
          <div className={`flex-grow flex flex-col max-md:shadow-lg max-md:h-screen md:flex md:flex-row transition-transform duration-300 ease-in-out ${burgerOpen ? 'translate-x-0' : '-translate-x-full'} 
                            md:translate-x-0 absolute md:relative top-16 left-0 w-64 md:w-auto h-full md:h-auto bg-white z-40 md:z-0`}>
            <nav className="flex-1 px-2 bg-white space-y-1" aria-label="Sidebar">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <LayoutDashboard className="mr-3 h-6 w-6" aria-hidden="true" />
                Tableau de bord
              </NavLink>

              {(profile.role === 'admin') && (
                <>
                  <NavLink
                    to="/universities"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Building2 className="mr-3 h-6 w-6" aria-hidden="true" />
                    Universités
                  </NavLink>
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Users className="mr-3 h-6 w-6" aria-hidden="true" />
                    Utilisateurs
                  </NavLink>
                </>
              )}

              {(profile.role === 'admin' || profile.role === 'university_staff') && (
                <>
                  <NavLink
                    to="/diplomas"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <FileText className="mr-3 h-6 w-6" aria-hidden="true" />
                    Diplômes
                  </NavLink>
                  <NavLink
                    to="/faculties"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <BookOpen className="mr-3 h-6 w-6" aria-hidden="true" />
                    Facultés
                  </NavLink>
                  <NavLink
                    to="/departments"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Layers className="mr-3 h-6 w-6" aria-hidden="true" />
                    Départements
                  </NavLink>
                  <NavLink
                    to="/students"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <GraduationIcon className="mr-3 h-6 w-6" aria-hidden="true" />
                    Étudiants
                  </NavLink>
                </>
              )}

              <NavLink
                to="/verify"
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Search className="mr-3 h-6 w-6" aria-hidden="true" />
                Vérifier
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
