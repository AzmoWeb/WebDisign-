"use client";

/** Bouton de soumission avec confirmation (actions destructives). */
export function ConfirmButton({ message, children, className, name, value }: { message: string; children: React.ReactNode; className?: string; name?: string; value?: string }) {
  return (
    <button name={name} value={value} className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
