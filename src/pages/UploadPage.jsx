import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileType, Image as ImageIcon, StickyNote, FileText, X, ChevronRight } from "lucide-react";
import { useFamily } from "../contexts/FamilyContext.jsx";
import { createUpload, getUploads } from "../services/upload.service.js";
import { processUpload } from "../services/extraction.service.js";
import { getCurrentUser } from "../services/auth.service.js";
import Button from "../components/ui/Button.jsx";
import UploadCard from "../components/UploadCard.jsx";

const uploadTypes = [
  { id: "image", label: "Screenshot / Photo",  Icon: ImageIcon,   hint: "Coach text, schedule photo, tournament bracket" },
  { id: "pdf",   label: "PDF Document",         Icon: FileType,    hint: "Camp info packet, tournament schedule, permission slip" },
  { id: "text",  label: "Paste Email / Text",   Icon: FileText,    hint: "Coach email, group text, website text" },
  { id: "note",  label: "Quick Note",           Icon: StickyNote,  hint: "Practice time, game location, reminder" },
];

export default function UploadPage({ onUploadComplete }) {
  const { family, aiContext } = useFamily();
  const [selectedType, setSelectedType] = useState(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    getUploads().then(setUploads).catch(() => {});
  }, []);

  function handleFileSelect(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleSubmit() {
    if (!selectedType) return;
    if ((selectedType === "text" || selectedType === "note") && !text.trim()) return;
    if ((selectedType === "image" || selectedType === "pdf") && !file) return;

    setLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser().catch(() => ({ id: "demo" }));
      const rawText = file ? `[File: ${file.name}]` : text;

      // 1. Create upload record (handles file storage internally)
      const uploadRecord = await createUpload({
        sourceType: selectedType,
        rawText,
        file,
        familyId: family?.id,
        userId: user?.id,
      });

      // 2. Run AI extraction pipeline
      await processUpload(uploadRecord.id, rawText, aiContext, selectedType);

      onUploadComplete?.();
      setSuccess(true);
      setTimeout(() => navigate("/review"), 1200);
    } catch (err) {
      console.error("[UploadPage] Upload failed:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function reset() {
    setSelectedType(null);
    setText("");
    setFile(null);
    setSuccess(false);
  }

  if (success) {
    return (
      <div className="page-content flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-slate-800">Uploaded!</h2>
        <p className="text-slate-500 mt-2 text-sm">AI is extracting events. Taking you to review…</p>
        <div className="mt-4 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                 style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content px-4 pt-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Inbox</h1>
        <p className="text-sm text-slate-500 mt-1">Throw anything at us — we'll sort it out</p>
      </div>

      {/* Type selector */}
      {!selectedType ? (
        <div className="space-y-2">
          {uploadTypes.map(({ id, label, Icon, hint }) => (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left hover:shadow-card-hover"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-brand-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Back button */}
          <button
            onClick={reset}
            className="flex items-center gap-1 text-sm text-slate-500"
          >
            ← Back
          </button>

          {/* Upload zone */}
          {(selectedType === "image" || selectedType === "pdf") && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept={selectedType === "image" ? "image/*" : "application/pdf"}
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <FileType size={18} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-brand-200 rounded-2xl p-8 flex flex-col items-center gap-3 bg-brand-50/50 active:bg-brand-50 transition-colors"
                >
                  <Upload size={28} className="text-brand-400" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-700 text-sm">
                      {selectedType === "image" ? "Tap to choose photo" : "Tap to choose PDF"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedType === "image" ? "JPG, PNG, HEIC supported" : "PDF up to 20MB"}
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Text input */}
          {(selectedType === "text" || selectedType === "note") && (
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  selectedType === "text"
                    ? "Paste the coach email, group message, or schedule text here…"
                    : "e.g. Soccer practice Tuesday 6pm, Riverside Fields — Sofia and Marco both need cleats"
                }
                rows={8}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none text-sm leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1.5 text-right">{text.length} chars</p>
            </div>
          )}

          {/* Submit */}
          <Button
            fullWidth
            size="lg"
            loading={loading}
            disabled={
              (selectedType === "text" || selectedType === "note") ? !text.trim()
              : !file
            }
            onClick={handleSubmit}
          >
            {loading ? "Extracting with AI…" : "Extract & Review →"}
          </Button>

          {error && (
            <p className="text-center text-xs text-red-500">{error}</p>
          )}
          <p className="text-center text-xs text-slate-400">
            AI will pull out events, deadlines, forms, and more. You'll review before anything is saved.
          </p>
        </div>
      )}

      {/* Recent uploads */}
      {uploads.length > 0 && !selectedType && (
        <section>
          <h2 className="font-bold text-slate-700 mb-3">Recent Uploads</h2>
          <div className="space-y-2">
            {uploads.map((u) => (
              <UploadCard key={u.id} upload={u} onClick={() => navigate("/review")} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
