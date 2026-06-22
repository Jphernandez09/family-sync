import { format, parseISO } from "date-fns";
import { FileText, Image, FileType, StickyNote, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Badge from "./ui/Badge.jsx";
import clsx from "clsx";

const sourceIcons = {
  image: Image,
  pdf: FileType,
  text: FileText,
  note: StickyNote,
};

const statusConfig = {
  pending_extraction: { label: "Queued",       color: "gray",   Icon: Clock },
  extracting:         { label: "Extracting…",  color: "blue",   Icon: Loader2 },
  review_ready:       { label: "Ready",         color: "orange", Icon: Clock },
  completed:          { label: "Done",          color: "green",  Icon: CheckCircle2 },
  failed:             { label: "Failed",        color: "red",    Icon: AlertCircle },
};

export default function UploadCard({ upload, onClick }) {
  const SourceIcon = sourceIcons[upload.source_type] || FileText;
  const status = statusConfig[upload.status] || statusConfig.pending_extraction;
  const StatusIcon = status.Icon;
  const isExtracting = upload.status === "extracting";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-card p-4 cursor-pointer active:scale-[0.98] transition-transform duration-100 hover:shadow-card-hover"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
          <SourceIcon size={18} className="text-slate-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-slate-800 text-sm truncate">
              {upload.title || upload.file_name || "Untitled upload"}
            </h3>
            <Badge color={status.color}>
              <StatusIcon
                size={10}
                className={clsx("mr-1", isExtracting && "animate-spin")}
              />
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400 capitalize">{upload.source_type}</span>
            {upload.created_at && (
              <span className="text-xs text-slate-400">
                {format(parseISO(upload.created_at), "MMM d, h:mm a")}
              </span>
            )}
          </div>

          {upload.status === "review_ready" && upload.items_extracted > 0 && (
            <p className="text-xs text-brand-600 font-medium mt-1">
              {upload.items_extracted} item{upload.items_extracted !== 1 ? "s" : ""} found · tap to review
            </p>
          )}
          {upload.status === "completed" && (
            <p className="text-xs text-green-600 mt-1">
              {upload.items_approved || 0} approved
            </p>
          )}
          {upload.status === "failed" && (
            <p className="text-xs text-red-500 mt-1">Extraction failed — tap to retry</p>
          )}
        </div>
      </div>
    </div>
  );
}
