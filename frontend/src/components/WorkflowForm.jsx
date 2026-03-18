// src/components/workflows/WorkflowForm.jsx
import { useState, useEffect, useRef } from "react";

const CATEGORIES = ["Expense", "Leave", "HR", "IT", "Finance", "Recruitment", "Operations", "General"];
const STATUSES = ["Active", "Inactive", "Draft"];

const CATEGORY_ICONS = {
  Expense: "💰", Leave: "🌴", HR: "👥", IT: "💻",
  Finance: "📊", Recruitment: "🎯", Operations: "⚙️", General: "📋",
};

const STEPS = ["Details", "Settings", "Preview"];

// ── AI Description Generator (Claude API) ──────────────────────────────────
const generateDescription = async (name, category) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 80,
      messages: [{
        role: "user",
        content: `Write a single concise sentence (max 15 words) describing a business workflow named "${name}" in the "${category}" category. No quotes, no period at end, just the description.`,
      }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "";
};

// ── Main Component ──────────────────────────────────────────────────────────
const WorkflowForm = ({ onSubmit, onCancel, isLoading }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "", description: "", category: "Expense", status: "Active",
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const descLen = formData.description.length;
  const DESC_MAX = 200;

  const handleAI = async () => {
    if (!formData.name.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const desc = await generateDescription(formData.name, formData.category);
      setFormData(p => ({ ...p, description: desc.slice(0, DESC_MAX) }));
    } catch {
      setAiError("Couldn't generate. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return formData.name.trim().length > 0;
    if (step === 1) return true;
    return true;
  };

  const handleFinalSubmit = () => {
    setSubmitted(true);
    onSubmit(formData);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .wf-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 15, 20, 0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 999;
          font-family: 'DM Sans', sans-serif;
          animation: wf-fadein 0.2s ease;
        }
        @keyframes wf-fadein { from { opacity:0 } to { opacity:1 } }

        .wf-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%; max-width: 480px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
          overflow: hidden;
          animation: wf-slidein 0.28s cubic-bezier(0.34,1.3,0.64,1);
        }
        @keyframes wf-slidein {
          from { opacity:0; transform: translateY(24px) scale(0.97) }
          to   { opacity:1; transform: translateY(0) scale(1) }
        }

        /* ── Header ── */
        .wf-header {
          padding: 28px 32px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        .wf-title {
          font-size: 17px; font-weight: 600;
          color: #111; letter-spacing: -0.3px;
          margin: 0 0 16px;
        }

        /* ── Stepper ── */
        .wf-steps {
          display: flex; align-items: center; gap: 0;
        }
        .wf-step-item {
          display: flex; align-items: center; gap: 8px; flex: 1;
        }
        .wf-step-item:last-child { flex: 0 }
        .wf-step-dot {
          width: 26px; height: 26px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .wf-step-dot.done   { background: #111; color: #fff; }
        .wf-step-dot.active { background: #111; color: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.1); }
        .wf-step-dot.future { background: #f0f0f0; color: #aaa; }
        .wf-step-label {
          font-size: 12px; font-weight: 500;
          color: #aaa; white-space: nowrap;
        }
        .wf-step-label.active { color: #111; }
        .wf-step-line {
          flex: 1; height: 1px; background: #e8e8e8;
          margin: 0 8px;
        }
        .wf-step-line.done { background: #111; }

        /* ── Body ── */
        .wf-body { padding: 24px 32px; min-height: 220px; }

        .wf-label {
          display: block; font-size: 11px; font-weight: 600;
          letter-spacing: 0.6px; color: #888;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .wf-input, .wf-textarea, .wf-select {
          width: 100%; box-sizing: border-box;
          border: 1.5px solid #e8e8e8; border-radius: 10px;
          padding: 10px 14px; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #111; background: #fafafa;
          outline: none; transition: border-color 0.15s, background 0.15s;
        }
        .wf-input:focus, .wf-textarea:focus, .wf-select:focus {
          border-color: #111; background: #fff;
        }
        .wf-textarea { resize: none; line-height: 1.5; }

        .wf-field { margin-bottom: 18px; }
        .wf-field:last-child { margin-bottom: 0; }

        /* ── AI Button ── */
        .wf-ai-row {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 6px;
        }
        .wf-ai-btn {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
          color: #555; background: #f4f4f4;
          border: none; border-radius: 6px;
          padding: 4px 10px; cursor: pointer;
          transition: all 0.15s;
        }
        .wf-ai-btn:hover:not(:disabled) { background: #111; color: #fff; }
        .wf-ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .wf-ai-spinner {
          width: 10px; height: 10px;
          border: 1.5px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg) } }

        .wf-char-row {
          display: flex; justify-content: space-between;
          margin-top: 4px;
        }
        .wf-char-count {
          font-size: 11px; font-family: 'DM Mono', monospace;
          color: #bbb;
        }
        .wf-char-count.warn { color: #f59e0b; }
        .wf-char-count.over { color: #ef4444; }
        .wf-ai-error { font-size: 11px; color: #ef4444; }

        /* ── Category Grid ── */
        .wf-cat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
        }
        .wf-cat-btn {
          display: flex; flex-direction: column;
          align-items: center; gap: 4px;
          padding: 10px 6px; border-radius: 10px;
          border: 1.5px solid #e8e8e8;
          background: #fafafa; cursor: pointer;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .wf-cat-btn:hover { border-color: #ccc; background: #f4f4f4; }
        .wf-cat-btn.selected { border-color: #111; background: #111; color: #fff; }
        .wf-cat-icon { font-size: 18px; line-height: 1; }
        .wf-cat-name { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; }

        .wf-row { display: flex; gap: 12px; }
        .wf-row > .wf-field { flex: 1; }

        /* ── Preview ── */
        .wf-preview {
          background: #fafafa; border-radius: 12px;
          border: 1.5px solid #f0f0f0; padding: 20px;
        }
        .wf-preview-name {
          font-size: 18px; font-weight: 600; color: #111;
          letter-spacing: -0.3px; margin-bottom: 6px;
        }
        .wf-preview-desc {
          font-size: 13px; color: #666; line-height: 1.6;
          margin-bottom: 16px; min-height: 20px;
        }
        .wf-preview-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .wf-tag {
          font-size: 11px; font-weight: 600; letter-spacing: 0.4px;
          padding: 4px 10px; border-radius: 20px;
          text-transform: uppercase;
        }
        .wf-tag-cat { background: #f0f0f0; color: #555; }
        .wf-tag-status-active  { background: #dcfce7; color: #16a34a; }
        .wf-tag-status-inactive{ background: #fef3c7; color: #d97706; }
        .wf-tag-status-draft   { background: #f1f5f9; color: #64748b; }
        .wf-preview-empty {
          font-size: 13px; color: #bbb; font-style: italic;
          text-align: center; padding: 20px 0;
        }

        /* ── Footer ── */
        .wf-footer {
          padding: 16px 32px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .wf-btn-ghost {
          font-size: 13px; font-weight: 500; color: #888;
          background: none; border: none; cursor: pointer;
          padding: 8px 0; transition: color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .wf-btn-ghost:hover { color: #111; }
        .wf-btn-group { display: flex; gap: 8px; }
        .wf-btn-back {
          font-size: 13px; font-weight: 500;
          color: #555; background: #f4f4f4;
          border: none; border-radius: 10px;
          padding: 9px 18px; cursor: pointer;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .wf-btn-back:hover { background: #e8e8e8; color: #111; }
        .wf-btn-next {
          font-size: 13px; font-weight: 600;
          color: #fff; background: #111;
          border: none; border-radius: 10px;
          padding: 9px 22px; cursor: pointer;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 6px;
        }
        .wf-btn-next:hover:not(:disabled) {
          background: #333; transform: translateY(-1px);
        }
        .wf-btn-next:disabled {
          background: #d4d4d4; cursor: not-allowed; transform: none;
        }

        /* ── Success ── */
        .wf-success {
          padding: 48px 32px;
          display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 12px;
        }
        .wf-success-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: #111; display: flex;
          align-items: center; justify-content: center;
          font-size: 24px;
          animation: wf-pop 0.4s cubic-bezier(0.34,1.6,0.64,1);
        }
        @keyframes wf-pop {
          from { transform: scale(0) } to { transform: scale(1) }
        }
        .wf-success-title {
          font-size: 17px; font-weight: 600; color: #111; margin: 0;
        }
        .wf-success-sub { font-size: 13px; color: #888; margin: 0; }
      `}</style>

      <div className="wf-overlay">
        <div className="wf-card">

          {submitted ? (
            /* ── Success State ── */
            <div className="wf-success">
              <div className="wf-success-icon">✓</div>
              <p className="wf-success-title">Workflow Created!</p>
              <p className="wf-success-sub">"{formData.name}" is now live</p>
            </div>
          ) : (
            <>
              {/* ── Header + Stepper ── */}
              <div className="wf-header">
                <p className="wf-title">New Workflow</p>
                <div className="wf-steps">
                  {STEPS.map((s, i) => (
                    <div key={s} className="wf-step-item">
                      <div className={`wf-step-dot ${i < step ? "done" : i === step ? "active" : "future"}`}>
                        {i < step ? "✓" : i + 1}
                      </div>
                      <span className={`wf-step-label ${i === step ? "active" : ""}`}>{s}</span>
                      {i < STEPS.length - 1 && (
                        <div className={`wf-step-line ${i < step ? "done" : ""}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Step Body ── */}
              <div className="wf-body">

                {/* STEP 0: Details */}
                {step === 0 && (
                  <>
                    <div className="wf-field">
                      <label className="wf-label">Name <span style={{color:"#ef4444"}}>*</span></label>
                      <input
                        ref={nameRef}
                        className="wf-input"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Expense Approval"
                        maxLength={80}
                      />
                    </div>

                    <div className="wf-field">
                      <div className="wf-ai-row">
                        <label className="wf-label" style={{margin:0}}>Description</label>
                        <button
                          className="wf-ai-btn"
                          onClick={handleAI}
                          disabled={aiLoading || !formData.name.trim()}
                          title="Auto-generate with AI"
                        >
                          {aiLoading
                            ? <><span className="wf-ai-spinner" /> Generating</>
                            : <><span>✦</span> AI Write</>
                          }
                        </button>
                      </div>
                      <textarea
                        className="wf-textarea"
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value.slice(0, DESC_MAX) }))}
                        placeholder="What does this workflow do?"
                      />
                      <div className="wf-char-row">
                        <span className="wf-ai-error">{aiError}</span>
                        <span className={`wf-char-count ${descLen > DESC_MAX * 0.9 ? "warn" : ""} ${descLen >= DESC_MAX ? "over" : ""}`}>
                          {descLen}/{DESC_MAX}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 1: Settings */}
                {step === 1 && (
                  <>
                    <div className="wf-field">
                      <label className="wf-label">Category</label>
                      <div className="wf-cat-grid">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            className={`wf-cat-btn ${formData.category === cat ? "selected" : ""}`}
                            onClick={() => setFormData(p => ({ ...p, category: cat }))}
                          >
                            <span className="wf-cat-icon">{CATEGORY_ICONS[cat]}</span>
                            <span className="wf-cat-name">{cat}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="wf-field" style={{marginTop: 18}}>
                      <label className="wf-label">Status</label>
                      <select
                        className="wf-select"
                        value={formData.status}
                        onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* STEP 2: Preview */}
                {step === 2 && (
                  <div className="wf-preview">
                    {formData.name ? (
                      <>
                        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                          <span style={{fontSize:28}}>{CATEGORY_ICONS[formData.category]}</span>
                          <p className="wf-preview-name">{formData.name}</p>
                        </div>
                        <p className="wf-preview-desc">
                          {formData.description || <span style={{color:"#ccc", fontStyle:"italic"}}>No description</span>}
                        </p>
                        <div className="wf-preview-tags">
                          <span className="wf-tag wf-tag-cat">{formData.category}</span>
                          <span className={`wf-tag wf-tag-status-${formData.status.toLowerCase()}`}>
                            {formData.status}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="wf-preview-empty">Fill in details to see preview</p>
                    )}
                  </div>
                )}

              </div>

              {/* ── Footer ── */}
              <div className="wf-footer">
                <button className="wf-btn-ghost" onClick={onCancel}>Cancel</button>
                <div className="wf-btn-group">
                  {step > 0 && (
                    <button className="wf-btn-back" onClick={() => setStep(s => s - 1)}>
                      Back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button
                      className="wf-btn-next"
                      onClick={() => setStep(s => s + 1)}
                      disabled={!canNext()}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      className="wf-btn-next"
                      onClick={handleFinalSubmit}
                      disabled={isLoading || !formData.name.trim()}
                    >
                      {isLoading ? <><span className="wf-ai-spinner" /> Creating</> : "Create Workflow"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default WorkflowForm;