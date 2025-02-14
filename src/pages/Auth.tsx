import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GraduationCap, Lock, Mail } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-indigo-600 flex items-center justify-center">
            <GraduationCap size={48} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Système de vérification des titres académiques
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                  <div className="h-5 w-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                </span>
              ) : null}
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}