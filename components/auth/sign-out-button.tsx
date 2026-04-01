import { signOut } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        className="rounded-lg border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-2 text-sm text-[#C0C0C0] transition hover:border-[#FF6B00] hover:text-white"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
