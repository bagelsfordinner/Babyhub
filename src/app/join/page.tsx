'use client';

import { SignupForm } from '@/components/organisms/SignupForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function JoinPageContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code');
  
  return <SignupForm inviteCode={inviteCode || undefined} />;
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}