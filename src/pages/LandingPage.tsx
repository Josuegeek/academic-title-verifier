import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, Search, Users } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">DiplomaVerify</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/auth"
                className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 mb-8 sm:mb-16 md:mb-20 lg:max-w-2xl lg:w-full lg:mb-28 xl:mb-32 bg-blue-100 bg-opacity-75 backdrop-filter rounded-xl backdrop-blur-sm">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28 p-3">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Vérification des</span>
                  <span className="block text-indigo-600">Diplômes Académiques</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Une plateforme sécurisée pour la gestion et la vérification des diplômes universitaires.
                  Simplifiez le processus de validation des titres académiques.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/auth"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Commencer
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/verify"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                    >
                      Vérifier un diplôme
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="max-lg:top-0 max-lg:size-full max-md:-mb-7 absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="size-full object-cover lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
            alt="Graduation ceremony"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Fonctionnalités</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Une solution complète
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Sécurisé</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Protection des données et authentification forte pour garantir l'intégrité des diplômes.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Search className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Vérification rapide</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Processus simple et rapide pour vérifier l'authenticité d'un diplôme.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Multi-utilisateurs</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Différents niveaux d'accès pour les administrateurs et le personnel universitaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}