import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getPendingItems, approveItem, rejectItem, updateItem } from "../services/review.service.js";
import ReviewCard from "../components/ReviewCard.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import { useNavigate } from "react-router-dom";

export default function ReviewPage({ onCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const pending = await getPendingItems();
      setItems(pending);
      onCountChange?.(pending.length);
    } catch (err) {
      console.error("[ReviewPage] Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(item) {
    // Optimistic update
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setApprovedCount((c) => c + 1);
    onCountChange?.((count) => Math.max(0, count - 1));
    try {
      await approveItem(item);
    } catch (err) {
      console.error("[ReviewPage] Approve failed:", err);
      // Reload to resync if real backend call failed
      loadItems();
    }
  }

  async function handleReject(item) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    onCountChange?.((count) => Math.max(0, count - 1));
    rejectItem(item.id).catch(console.error);
  }

  function handleEdit(item) {
    setEditItem(item);
    setEditForm({
      title: item.title || "",
      event_date: item.event_date || "",
      start_time: item.start_time || "",
      end_time: item.end_time || "",
      location_name: item.location_name || "",
      family_member_name: item.family_member_name || "",
      description: item.description || "",
    });
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await updateItem(editItem.id, editForm);
      const updated = { ...editItem, ...editForm, _wasEdited: true };
      setItems((prev) => prev.map((i) => i.id === editItem.id ? updated : i));
    } finally {
      setSaving(false);
      setEditItem(null);
    }
  }

  const allDone = !loading && items.length === 0;

  return (
    <div className="page-content px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Review Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Loading…"
              : items.length > 0 ? `${items.length} item${items.length !== 1 ? "s" : ""} to review`
              : "All clear!"}
          </p>
        </div>
        {approvedCount > 0 && (
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
            <CheckCircle2 size={13} />
            {approvedCount} approved
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!loading && (items.length > 0 || approvedCount > 0) && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{
              width: `${approvedCount + items.length > 0
                ? Math.round((approvedCount / (approvedCount + items.length)) * 100)
                : 100}%`,
            }}
          />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {allDone && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-3xl mb-4">
            🎉
          </div>
          <h3 className="font-bold text-slate-700 text-lg">You're all caught up!</h3>
          {approvedCount > 0 && (
            <p className="text-slate-500 text-sm mt-1">
              {approvedCount} item{approvedCount !== 1 ? "s" : ""} added to your GamePlan
            </p>
          )}
          <Button
            className="mt-6"
            onClick={() => navigate("/gameplan")}
          >
            View GamePlan →
          </Button>
        </div>
      )}

      {/* Items */}
      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {/* Low confidence items first */}
          {items
            .sort((a, b) => (a.confidence_score || 1) - (b.confidence_score || 1))
            .map((item) => (
              <ReviewCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
              />
            ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Item"
      >
        {editItem && (
          <div className="space-y-4">
            <Input
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="Event or task name"
            />
            <Input
              label="For"
              value={editForm.family_member_name}
              onChange={(e) => setEditForm({ ...editForm, family_member_name: e.target.value })}
              placeholder="Which family member?"
            />
            {editItem.item_type === "calendar_event" && (
              <>
                <Input
                  label="Date"
                  type="date"
                  value={editForm.event_date}
                  onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Start time"
                    type="time"
                    value={editForm.start_time}
                    onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                  />
                  <Input
                    label="End time"
                    type="time"
                    value={editForm.end_time}
                    onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                  />
                </div>
                <Input
                  label="Location"
                  value={editForm.location_name}
                  onChange={(e) => setEditForm({ ...editForm, location_name: e.target.value })}
                  placeholder="Venue or field name"
                />
              </>
            )}
            <Input
              label="Notes"
              multiline
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Any additional notes"
            />
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setEditItem(null)}>
                Cancel
              </Button>
              <Button fullWidth loading={saving} onClick={saveEdit}>
                Save & Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
