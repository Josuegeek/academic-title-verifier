import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  GraduationCap as GraduationIcon,
  FileText,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  Hand,
  Grid2x2Icon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        burgerRef.current && !burgerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setBurgerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white shadow-sm md:h-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 max-[1200px]:px-1 h-full">
        <div className="flex flex-col max-md:w-auto max-md:overflow-visible max-[1200px]:w-12 max-[1200px]:h-full max-[1200px]:overflow-hidden">
          {/* Top Bar (Burger Menu, Logo, and User Dropdown) */}
          <div className="flex justify-between min-[1200px]:flex-col items-center p-3 rounded-lg bg-gray-200 h-fit lg:max-w-56">
            {/* Burger menu button (show on small screens) */}
            <div className="md:hidden">
              <button
                ref={burgerRef}
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
              <Link className='flex' to="/">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">DiplomaVerify</span>
              </Link>
            </div>

            {/* User Dropdown (always on top right on small screens) */}
            <div ref={dropdownRef} className="min-[1200px]:w-full max-[1200px]:absolute max-md:relative max-md:bottom-0 max-[1200px]:bottom-7 z-20">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <User className="h-6 w-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700 max-[1200px]:hidden ">{profile?.nom} {profile?.postnom} ({profile?.role})</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              <div
                className={`absolute right-0 w-48 mt-2 rounded-md shadow-lg z-20 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownOpen ? '' : 'hidden'} ${dropdownOpen && 'max-[1200px]:-top-24 max-[1200px]:-right-36 max-md:right-0 max-md:top-10'}`}
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
          <div className={`flex-grow max-md:h-[91vh] h-full flex flex-col max-md:shadow-lg md:flex md:flex-row transition-transform duration-300 ease-in-out ${burgerOpen ? 'translate-x-0' : '-translate-x-full'} 
                            md:translate-x-0 absolute md:relative top-16 left-0 w-64 md:w-auto md:h-auto bg-white z-40 md:z-0`}>
            <nav className="flex-1 px-2 py-2 bg-white space-y-1" aria-label="Sidebar">
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

              {(profile?.role === 'admin') && (
                <>
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

              {(profile?.role === 'university_staff') && (
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
                    to="/promotions"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Grid2x2Icon className="mr-3 h-6 w-6" aria-hidden="true" />
                    Promotions
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
                  <NavLink
                    to="/signers"
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Hand className="mr-3 h-6 w-6" aria-hidden="true" />
                    Signateurs
                  </NavLink>
                </>
              )}

              {(profile?.role === 'esu_staff') && (
                <NavLink
                  to="/authenticate-diploma"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <GraduationCap className="mr-3 h-6 w-6" aria-hidden="true" />
                  Authentifier les diplômes
                </NavLink>
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