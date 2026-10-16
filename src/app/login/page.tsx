import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="wd-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative w-full">
        <AuthForm mode="login" nextPath={nextPath} />
      </div>
    </main>
  );
}
