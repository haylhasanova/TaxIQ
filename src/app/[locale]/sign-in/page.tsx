import { SignInForm } from "@/components/public/sign-in-form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="mb-6 text-2xl font-extrabold">Daxil ol / Sign in</h1>
      <SignInForm />
    </div>
  );
}
