"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type FavoriteToggleButtonProps = {
  productId: string;
  initialIsFavorite?: boolean;
};

export default function FavoriteToggleButton({
  productId,
  initialIsFavorite = false,
}: FavoriteToggleButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        if (isFavorite) {
          // supprimer des favoris
          const res = await fetch(`/api/favorites/${productId}`, {
            method: "DELETE",
          });

          if (res.status === 401) {
            router.push("/login");
            return;
          }
        } else {
          // ajouter aux favoris
          const res = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });

          if (res.status === 401) {
            router.push("/login");
            return;
          }
        }

        setIsFavorite((prev) => !prev);
      } catch (err) {
        console.error("Erreur favoris:", err);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 hover:text-rose-500"
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {isFavorite ? "❤" : "♡"}
    </button>
  );
}
