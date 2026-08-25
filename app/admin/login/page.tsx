import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Accesso amministratore",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-2xl font-semibold text-neutral-900">Accesso amministratore</h1>
        <LoginForm />
        <p className="mt-4 text-sm text-neutral-600">
          <Link href="/community/forgot-password" className="font-semibold hover:underline">
            Password dimenticata?
          </Link>
        </p>
      </div>
    </div>
  );
}
