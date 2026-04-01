import { signOut } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-[#c9a84c] hover:text-[#f2df9e]"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
