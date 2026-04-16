"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-md card-accent p-6 shadow-2xl shadow-black/40 animate-enter-scale">
        <p className="label-stencil">Confirm deletion</p>
        <h2 id="delete-modal-title" className="mt-2 font-display text-2xl text-sand-bright">
          {profileName}
        </h2>
        <p className="mt-3 text-sm leading-6 text-sand">
          Delete this ICP profile? This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            className="btn-ghost-sm"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn text-sm rounded bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
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
