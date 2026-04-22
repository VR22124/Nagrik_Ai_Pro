import React from "react";
import PropTypes from "prop-types";
import {
  SCENARIOS,
  REGISTRATION_STATUSES,
  MIGRATION_TYPES,
  ADDRESS_PROOF_OPTIONS
} from "../../utils/constants";

/**
 * GuidanceForm — the primary voter information form.
 *
 * @param {object} props
 * @param {object} props.form - Current form state values.
 * @param {Function} props.setForm - State setter for the form object.
 * @param {Function} props.onSubmit - Submit handler called with the form event.
 * @param {boolean} props.loading - When true, disables the submit button.
 * @param {string} props.error - Error message to display below the form.
 */
const GuidanceForm = React.memo(function GuidanceForm({ form, setForm, onSubmit, loading, error }) {
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
            {REGISTRATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
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
            {MIGRATION_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
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
            {ADDRESS_PROOF_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
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
});

GuidanceForm.propTypes = {
  form: PropTypes.shape({
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    state: PropTypes.string,
    registrationStatus: PropTypes.string,
    scenario: PropTypes.string,
    migrationType: PropTypes.string,
    hasAddressProof: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    intent: PropTypes.string
  }).isRequired,
  setForm: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string
};

export default GuidanceForm;
