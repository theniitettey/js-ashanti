'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

type UserSession = {
  user?: {
    email: string;
    role: string;
    [key: string]: any;
  };
} | null;

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = authClient.useSession() as { data: UserSession };
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Skip initial check if we've already verified
    if (authChecked) return;

    const checkAuth = async () => {
      try {
        // Wait briefly to allow session to populate
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!session) {
          console.log('No session found - redirecting to login');
          toast.error('Please login to access this page');
          router.push('/login');
          return;
        }

        if (session.user?.role !== 'admin') {
          console.log('Unauthorized access attempt');
          toast.error('You must be an admin to access this page');
          router.push('/');
          return;
        }

        setAuthChecked(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [session, router, authChecked]);

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-pulse text-3xl font-bold text-primary logo">
          J's Ashanti
        </div>
      </div>
    );
  }

  return <>{children}</>;
}