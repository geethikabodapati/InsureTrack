
import { useState, useEffect } from "react";
import { FileText, Calendar, AlertCircle, CheckCircle, XCircle, Upload, File, RefreshCw, ArrowRight } from "lucide-react";
import { claimsApi, customerClaimsApi } from "../../../core/services/api";

const CLAIM_TYPES = ["AUTO", "PROPERTY", "HEALTH", "LIFE", "COMMERCIAL"];

const STATUS_BADGE = {
  OPEN: "bg-blue-100 text-blue-800",
  INVESTIGATING: "bg-yellow-100 text-yellow-800",
  SETTLED: "bg-green-100 text-green-800",
  DENIED: "bg-red-100 text-red-800",
  CLOSED: "bg-gray-100 text-gray-700",
};

export function FNOLIntake() {
  const [tab, setTab] = useState("incoming");
  const [openClaims, setOpenClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  // File new claim — multi-step
  const [step, setStep] = useState("form"); // "form" | "evidence" | "done"
  const [form, setForm] = useState({ policyId: "", incidentDate: "", claimType: "AUTO", description: "" });
  const [filedClaim, setFiledClaim] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceType, setEvidenceType] = useState("PHOTO");
  const [evidenceResult, setEvidenceResult] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 6000); };

  const loadOpenClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getByStatus("OPEN");
      setOpenClaims(res.data || []);
      if (res.data?.length > 0) setSelected(res.data[0]);
    } catch (err) { showToast("error", "Could not load claims: " + err.message); }
    finally { setFetching(false); }
  };

  useEffect(() => { loadOpenClaims(); }, []);

  const handleMoveToReview = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await claimsApi.moveToReview(selected.claimId);
      showToast("success", `Claim #${res.data.claimId} → INVESTIGATING`);
      const updated = openClaims.filter(c => c.claimId !== selected.claimId);
      setOpenClaims(updated);
      setSelected(updated[0] || null);
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await claimsApi.reject(selected.claimId);
      showToast("error", `Claim #${res.data.claimId} → DENIED`);
      const updated = openClaims.filter(c => c.claimId !== selected.claimId);
      setOpenClaims(updated);
      setSelected(updated[0] || null);
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  // STEP 1 — File claim
  const handleFileClaim = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await customerClaimsApi.fileClaim({
        policyId: parseInt(form.policyId),
        incidentDate: form.incidentDate,
        claimType: form.claimType,
        description: form.description,
      });
      setFiledClaim(res.data);
      setStep("evidence");
      showToast("success", `Claim #${res.data.claimId} filed. Now upload evidence to move it to Investigation.`);
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  // STEP 2 — Upload evidence → auto move to INVESTIGATING
  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile || !filedClaim) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("metadata", JSON.stringify({ type: evidenceType }));
      formData.append("file", evidenceFile);
      const eRes = await customerClaimsApi.uploadEvidence(filedClaim.claimId, formData);
      setEvidenceResult(eRes.data);

      // Auto move to INVESTIGATING after evidence upload
      await claimsApi.moveToReview(filedClaim.claimId);

      setStep("done");
      loadOpenClaims(); // refresh list
      showToast("success",
        `Evidence uploaded & Claim #${filedClaim.claimId} moved to INVESTIGATING. Adjuster can now review.`
      );
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setStep("form");
    setForm({ policyId: "", incidentDate: "", claimType: "AUTO", description: "" });
    setFiledClaim(null);
    setEvidenceFile(null);
    setEvidenceResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">FNOL Intake</h1>
          <p className="text-sm text-gray-500 mt-1">Incoming OPEN claims · File new claims with evidence</p>
        </div>
        <button onClick={loadOpenClaims} disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {toast && (
        <div className={`border rounded-lg p-4 mb-5 flex items-center gap-3 text-sm ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
          }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{toast.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "incoming", label: `Incoming Claims (${openClaims.length})` },
          { key: "file", label: "File New Claim" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}>{t.label}</button>
        ))}
      </div>

      {/* ── Incoming OPEN Claims ── */}
      {tab === "incoming" && (
        <>
          {fetching ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-500 text-sm">Loading OPEN claims...</span>
            </div>
          ) : openClaims.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No OPEN claims right now</p>
              <p className="text-gray-400 text-xs mt-1">File a new claim using the "File New Claim" tab</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{openClaims.length} Claim{openClaims.length !== 1 ? "s" : ""} Waiting</p>
                </div>
                <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                  {openClaims.map(c => (
                    <button key={c.claimId} onClick={() => setSelected(c)}
                      className={`w-full text-left px-5 py-4 transition-colors ${selected?.claimId === c.claimId ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                        }`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-gray-900">Claim #{c.claimId}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{c.claimType}</p>
                      <p className="text-xs text-gray-400">Policy #{c.policyId} · {c.reportedDate}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selected && (
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-900">Claim Details</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><p className="text-xs text-gray-500">Claim ID</p><p className="text-sm font-bold text-blue-600">#{selected.claimId}</p></div>
                      <div><p className="text-xs text-gray-500">Policy ID</p><p className="text-sm font-medium">#{selected.policyId}</p></div>
                      <div><p className="text-xs text-gray-500">Claim Type</p><p className="text-sm font-medium">{selected.claimType}</p></div>
                      <div><p className="text-xs text-gray-500">Incident Date</p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-sm font-medium">{selected.incidentDate}</p>
                        </div>
                      </div>
                      <div><p className="text-xs text-gray-500">Reported Date</p><p className="text-sm font-medium">{selected.reportedDate}</p></div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{selected.description}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Actions</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleMoveToReview} disabled={loading}
                        className="flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" /> Move to Investigation
                      </button>
                      <button onClick={handleReject} disabled={loading}
                        className="flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Reject Claim
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── File New Claim (multi-step) ── */}
      {tab === "file" && (
        <div className="max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-6">
            {[
              { key: "form", label: "1. File Claim" },
              { key: "evidence", label: "2. Upload Evidence" },
              { key: "done", label: "3. Done" },
            ].map((s, i, arr) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className={`px-4 py-2 rounded-lg text-xs font-semibold flex-1 text-center ${step === s.key ? "bg-blue-600 text-white" :
                  (step === "evidence" && i === 0) || step === "done" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>{s.label}</div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mx-1" />}
              </div>
            ))}
          </div>

          {/* STEP 1 — Form */}
          {step === "form" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-gray-900">File First Notice of Loss</p>
              </div>
              <form onSubmit={handleFileClaim} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Policy ID <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="e.g. 1" value={form.policyId}
                      onChange={e => setForm({ ...form, policyId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Incident Date <span className="text-red-500">*</span></label>
                    <input required type="date" value={form.incidentDate}
                      onChange={e => setForm({ ...form, incidentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Claim Type <span className="text-red-500">*</span></label>
                    <select required value={form.claimType} onChange={e => setForm({ ...form, claimType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {CLAIM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea required rows={3} placeholder="Describe the incident..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                  {loading ? "Filing..." : "File Claim →"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2 — Upload Evidence (required to move to INVESTIGATING) */}
          {step === "evidence" && filedClaim && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-900 mb-2">✓ Claim #{filedClaim.claimId} Filed</p>
                <div className="flex flex-wrap gap-4 text-xs text-green-800">
                  <span>Type: {filedClaim.claimType}</span>
                  <span>Policy: #{filedClaim.policyId}</span>
                  <span>Reported: {filedClaim.reportedDate}</span>
                  <span className="font-semibold">Status: {filedClaim.status}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">Upload Evidence</p>
                </div>
                <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2.5 mb-4">
                  ⚠ Evidence upload is <strong>required</strong> — uploading evidence will automatically move the claim to <strong>INVESTIGATING</strong> status.
                </p>
                <form onSubmit={handleUploadEvidence} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Evidence Type</label>
                    <select value={evidenceType} onChange={e => setEvidenceType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {["PHOTO", "DOCUMENT", "VIDEO", "POLICE_REPORT", "MEDICAL_RECORD"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-blue-400 transition-colors">
                    <input type="file" id="ev-file" className="hidden" onChange={e => setEvidenceFile(e.target.files[0])} />
                    <label htmlFor="ev-file" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Click to select file</p>
                      <p className="text-xs text-gray-400 mt-1">Images, Documents, Videos</p>
                    </label>
                  </div>
                  {evidenceFile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
                      <File className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700 truncate">{evidenceFile.name}</span>
                      <span className="text-gray-400 flex-shrink-0">{(evidenceFile.size / 1024).toFixed(0)} KB</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading || !evidenceFile}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                    {loading ? "Uploading & Moving to Investigation..." : "Upload Evidence → Move to Investigation"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STEP 3 — Done */}
          {step === "done" && filedClaim && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Claim Ready for Investigation!</h2>
              <p className="text-sm text-gray-500 mb-1">Claim #{filedClaim.claimId} is now <strong className="text-yellow-700">INVESTIGATING</strong></p>
              <p className="text-sm text-gray-500 mb-6">
                Evidence #{evidenceResult?.evidenceId} uploaded · Adjuster Vasudha will review it.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={resetForm}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  File Another Claim
                </button>
                <button onClick={() => setTab("incoming")}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  View OPEN Claims
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
