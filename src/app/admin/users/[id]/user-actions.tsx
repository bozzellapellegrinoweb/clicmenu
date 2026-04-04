"use client";

import { useState } from "react";
import { KeyRound, CreditCard, Trash2, CheckCircle } from "lucide-react";

interface Props {
  userId: string;
  userEmail: string;
  currentStatus?: string;
}

export function UserActions({ userId, userEmail, currentStatus }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function call(action: string, body?: object) {
    setLoading(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore");
      setMessage({ type: "success", text: data.message ?? "Operazione completata" });
    } catch (e) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally {
      setLoading(null);
    }
  }

  const statusOptions = ["active", "trialing", "past_due", "canceled"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-slate-900">Azioni</h2>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
          message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {message.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Reset password */}
      <div className="border-b border-slate-100 pb-4">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Password</p>
        <button
          onClick={() => call("reset_password")}
          disabled={!!loading}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          <KeyRound className="w-4 h-4" />
          {loading === "reset_password" ? "Invio..." : "Invia reset password"}
        </button>
        <p className="text-xs text-slate-400 mt-1">Invia email con link di reset</p>
      </div>

      {/* Subscription */}
      <div className="border-b border-slate-100 pb-4">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Abbonamento</p>
        <div className="space-y-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => call("update_subscription", { status })}
              disabled={!!loading || currentStatus === status}
              className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${
                currentStatus === status
                  ? "bg-emerald-50 text-emerald-700 cursor-default"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {loading === "update_subscription" ? "Salvo..." : `Imposta: ${status}`}
              {currentStatus === status && " ✓"}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Pericolo</p>
        <button
          onClick={() => {
            if (!confirm(`Eliminare definitivamente ${userEmail}? Questa azione è irreversibile.`)) return;
            call("delete_user");
          }}
          disabled={!!loading}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {loading === "delete_user" ? "Eliminazione..." : "Elimina account"}
        </button>
        <p className="text-xs text-slate-400 mt-1">Elimina utente e tutti i suoi dati</p>
      </div>
    </div>
  );
}
