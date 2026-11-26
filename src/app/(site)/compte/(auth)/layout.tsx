import { isSupabaseConfigured } from "@/lib/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-site flex justify-center pt-14">
      <div className="w-full max-w-md">
        {!isSupabaseConfigured() && (
          <p className="mb-8 bg-[#f3e7c9] p-4 text-sm text-[#4d3a12]">L&apos;espace client sera actif dès la connexion de la base de données Supabase (voir docs/INSTALLATION.md).</p>
        )}
        {children}
      </div>
    </div>
  );
}
