"use client";

import { useState } from "react";
import { KeyRound, CreditCard, Trash2, CheckCircle, Clock } from "lucide-react";

interface Props {
  userId: string;
  userEmail: string;
  currentStatus?: string;
  expiresAt?: string | null;
}

export function UserActions({ userId, userEmail, currentStatus, expiresAt }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [extendDays, setExtendDays] = useState("7");

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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
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
      <div className="border-b border-slate-100 pb-5">
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

      {/* Estendi trial */}
      {(currentStatus === "trialing" || currentStatus === "past_due") && (
        <div className="border-b border-slate-100 pb-5">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Estendi trial</p>
          <div className="flex gap-2">
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="3">+3 giorni</option>
              <option value="7">+7 giorni</option>
              <option value="14">+14 giorni</option>
              <option value="30">+30 giorni</option>
            </select>
            <button
              onClick={() => call("extend_trial", { days: parseInt(extendDays), currentExpiresAt: expiresAt })}
              disabled={!!loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200 transition-colors disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              {loading === "extend_trial" ? "..." : "Estendi"}
            </button>
          </div>
        </div>
      )}

      {/* Stato abbonamento */}
      <div className="border-b border-slate-100 pb-5">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Cambia stato</p>
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
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Zona pericolo</p>
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
      </div>
    </div>
  );
}
