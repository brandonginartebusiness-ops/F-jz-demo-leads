"use client";

type DeleteIcpModalProps = {
  profileName: string;
  isOpen: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteIcpModal({
  profileName,
  isOpen,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteIcpModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/40">
        <p className="text-sm uppercase tracking-[0.3em] text-[#C0C0C0]">
          Confirm deletion
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{profileName}</h2>
        <p className="mt-3 text-sm leading-6 text-[#888888]">
          Delete this ICP profile? This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-xl border border-[#FF6B00]/25 px-4 py-3 text-sm text-[#C0C0C0] transition hover:border-[#FF6B00]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-[#c05a4f] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#d16659] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
