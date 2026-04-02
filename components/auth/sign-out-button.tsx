import { signOut } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        aria-label="Sign out of dashboard"
        className="btn-outline-sm bg-panel"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
