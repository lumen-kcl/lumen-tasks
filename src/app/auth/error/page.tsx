'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md text-center">
        <span className="text-6xl mb-4 block">🚫</span>
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        {error === 'AccessDenied' ? (
          <p className="text-white/70 mb-6">
            Sorry, your account is not authorized to use Lumen Tasks. 
            This app is only available to Ben and Lumen.
          </p>
        ) : (
          <p className="text-white/70 mb-6">
            An error occurred during sign in. Please try again.
          </p>
        )}
        <a
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
