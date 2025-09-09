import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { UserManagement } from '@/components/organisms/UserManagement';

export default async function AdminPage() {
  try {
    await requireRole(['admin']);
  } catch {
    redirect('/login');
  }

  return <UserManagement />;
}