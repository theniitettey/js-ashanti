"use client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { ChartBarLabel } from "@/components/chart/BarChart";
import { ChartRadialText } from "@/components/chart/radialChart";
import { LoaderOne } from "@/components/ui/loader";

export function AdminDashboard() {
  const [user, setUser] = useState<any>(null); 

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: session, error } = await authClient.getSession();
        if (error || !session) {
          toast.error("Failed to fetch session");
          return;
        }
        setUser(session.user);
      } catch (err) {
        toast.error("Unexpected error occurred");
      }
    }

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="h-dvh flex justify-center items-center">
        <LoaderOne />
      </div>
    ); 
  }

  return (
    <main className="flex-1 flex flex-col gap-4 p-6">
      {/* Admin Welcome Session */}
      <div className="flex flex-col items-center justify-start gap-2">
        <h1 className="text-3xl font-bold mb-4 text-neutral-500 dark:text-neutral-200">Welcome, {user.name}!</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Manage your application settings and content here.
        </p>
      </div>
      <section className="flex flex-col md:flex-row gap-6 mt-10 px-4">
        <div className="w-full md:w-1/2">
            <ChartBarLabel />
        </div>
        <div className="w-full md:w-1/2">
            <ChartRadialText />
        </div>
      </section>

    </main>
  );
}
