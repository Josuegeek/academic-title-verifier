import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import type { Profile } from '../types';

interface LayoutProps {
  profile: Profile;
}

export function Layout({ profile }: LayoutProps) {
  return (
    <div className="h-screen bg-gray-100 flex max-md:flex-col">
      <Navbar profile={profile} />
      <main className="flex-1 h-screen overflow-y-scroll py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
