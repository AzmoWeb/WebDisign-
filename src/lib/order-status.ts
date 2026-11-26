import type { OrderStatus } from "./types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  ready_for_pickup: "Prête en magasin",
  completed: "Terminée",
  cancelled: "Annulée",
  payment_failed: "Paiement refusé",
  refunded: "Remboursée",
};

/** Transitions autorisées depuis l'administration (le passage à « payée » est réservé au webhook Stripe). */
export const ADMIN_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["preparing", "shipped", "ready_for_pickup", "completed", "cancelled"],
  preparing: ["shipped", "ready_for_pickup", "completed", "cancelled"],
  shipped: ["completed"],
  ready_for_pickup: ["completed"],
  pending: ["cancelled"],
};
