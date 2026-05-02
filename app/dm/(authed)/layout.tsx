import { AuthGate } from '@/components/auth/AuthGate';
import { DMHeader } from '@/components/layout/DMHeader';

export default function AuthedDMLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <DMHeader />
      {children}
    </AuthGate>
  );
}
