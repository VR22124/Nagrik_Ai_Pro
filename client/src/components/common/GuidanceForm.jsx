import React from "react";

const SCENARIOS = [
  { value: "first_time", label: "First-time voter" },
  { value: "first_time_migrated", label: "First-time + Migrated" },
  { value: "migrated", label: "Migrated voter" },
  { value: "lost_id", label: "Lost voter ID" },
  { value: "correction", label: "Correction needed" },
  { value: "unknown_status", label: "Unknown registration status" }
];

export default function GuidanceForm({ form, setForm, onSubmit, loading, error }) {
  return (
    <section className="glass-card p-5 md:p-6 section-gap">
      <h2 className="text-lg font-semibold mb-4 text-slate-900">Start Your Journey</h2>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4" aria-label="Voter Information Form">
        <div className="space-y-1">
          <label htmlFor="age" className="text-sm font-medium text-slate-800">
            Age
          </label>
          <input
            id="age"
            className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="number"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            aria-required="true"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="state" className="text-sm font-medium text-slate-800">
            State
          </label>
          <input
            id="state"
            className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            aria-required="true"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="registrationStatus" className="text-sm font-medium text-slate-800">
            Registration Status
          </label>
          <select
            id="registrationStatus"
            className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.registrationStatus}
            onChange={(e) => setForm((f) => ({ ...f, registrationStatus: e.target.value }))}
            aria-required="true"
          >
            <option value="registered">Registered</option>
            <option value="not_registered">Not registered</option>
            <option value="unsure">Unsure</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="scenario" className="text-sm font-medium text-slate-800">
            Scenario
          </label>
          <select
            id="scenario"
            className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.scenario}
            onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))}
            aria-required="true"
          >
            {SCENARIOS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="migrationType" className="text-sm font-medium text-slate-800">
            Migration Type
          </label>
          <select
            id="migrationType"
            className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.migrationType}
            onChange={(e) => setForm((f) => ({ ...f, migrationType: e.target.value }))}
          >
            <option value="unspecified">Migration type (optional)</option>
            <option value="intra_state">Moved within same state</option>
            <option value="inter_state">Moved from another state</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="hasAddressProof" className="text-sm font-medium text-slate-800">
            Address Proof Availability
          </label>
          <select
            id="hasAddressProof"
            className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={String(form.hasAddressProof)}
            onChange={(e) =>
              setForm((f) => ({ ...f, hasAddressProof: e.target.value === "true" }))
            }
          >
            <option value="true">I have current address proof</option>
            <option value="false">I do not have current address proof</option>
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="intent" className="text-sm font-medium text-slate-800">
            Describe Your Issue (Optional)
          </label>
          <input
            id="intent"
            className="border rounded-xl p-2.5 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Describe your issue (optional)"
            value={form.intent}
            onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value }))}
          />
        </div>
        <button 
          disabled={loading} 
          className="btn-primary w-fit mt-1 disabled:opacity-60 focus:ring-2 focus:ring-blue-700"
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? "Generating Guidance..." : "Get My Next Step"}
        </button>
      </form>
      {error ? <p role="alert" className="text-red-700 font-medium text-sm mt-3">{error}</p> : null}
    </section>
  );
}
