import { SignupForm } from '@/components/organisms/SignupForm';

interface JoinWithCodePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function JoinWithCodePage({ params }: JoinWithCodePageProps) {
  const { code } = await params;
  
  return <SignupForm inviteCode={code} />;
}