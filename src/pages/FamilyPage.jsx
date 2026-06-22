import { useState } from "react";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { useFamily } from "../contexts/FamilyContext.jsx";
import {
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from "../services/family.service.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";

const SPORT_OPTIONS = [
  "Soccer", "Hockey", "Basketball", "Baseball", "Softball", "Swimming",
  "Gymnastics", "Tennis", "Volleyball", "Lacrosse", "Football", "Track",
  "Wrestling", "Dance", "Cheer", "Golf", "Camp",
];

const MEMBER_COLORS = [
  "#f97316", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b",
];

export default function FamilyPage() {
  // Members come from FamilyContext — no local fetch needed
  const { members, loading, addMember, removeMember, updateMemberLocal } = useFamily();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "child", sports: [], team_names: [""], birth_year: "", coach_contact: "",
  });

  function openAdd() {
    setEditingMember(null);
    setForm({ name: "", role: "child", sports: [], team_names: [""], birth_year: "", coach_contact: "" });
    setShowAddModal(true);
  }

  function openEdit(member) {
    setEditingMember(member);
    setForm({
      name: member.name || "",
      role: member.role || "child",
      sports: member.sports || [],
      team_names: member.team_names?.length ? member.team_names : [""],
      birth_year: member.birth_year || "",
      coach_contact: member.coach_contact || "",
    });
    setShowAddModal(true);
  }

  function toggleSport(sport) {
    setForm((f) => ({
      ...f,
      sports: f.sports.includes(sport)
        ? f.sports.filter((s) => s !== sport)
        : [...f.sports, sport],
    }));
  }

  async function saveMember() {
    if (!form.name.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      team_names: form.team_names.filter((t) => t.trim()),
      birth_year: form.birth_year ? parseInt(form.birth_year) : undefined,
      color: editingMember?.color || MEMBER_COLORS[members.length % MEMBER_COLORS.length],
    };
    try {
      if (editingMember) {
        await updateFamilyMember(editingMember.id, data);
        updateMemberLocal(editingMember.id, data);
      } else {
        const created = await createFamilyMember(data);
        addMember(created || { ...data, id: Date.now().toString() });
      }
    } catch (err) {
      console.error("[FamilyPage] Save failed:", err);
      // Optimistic update in demo mode
      if (editingMember) updateMemberLocal(editingMember.id, data);
      else addMember({ ...data, id: Date.now().toString() });
    } finally {
      setSaving(false);
      setShowAddModal(false);
    }
  }

  async function handleDeleteMember(member) {
    if (!confirm(`Remove ${member.name} from the family?`)) return;
    removeMember(member.id);
    deleteFamilyMember(member.id).catch(console.error);
  }

  return (
    <div className="page-content px-4 pt-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Family</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your family members &amp; sports</p>
        </div>
        <Button size="sm" icon={Plus} onClick={openAdd}>Add</Button>
      </div>

      {/* Members */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : members.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-3xl mb-3">👨‍👩‍👧‍👦</p>
          <p className="font-semibold text-slate-600">Add your family members</p>
          <p className="text-sm text-slate-400 mt-1">The AI uses this to match names in uploads</p>
          <Button className="mt-4" icon={Plus} onClick={openAdd}>Add First Member</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: member.color || "#f97316" }}
                >
                  {member.name[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{member.name}</h3>
                    <Badge color={member.role === "parent" || member.role === "guardian" ? "blue" : "gray"}>
                      {member.role}
                    </Badge>
                  </div>

                  {member.sports?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.sports.map((s) => (
                        <Badge key={s} color="orange">{s}</Badge>
                      ))}
                    </div>
                  )}

                  {member.team_names?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      🏟️ {member.team_names.join(", ")}
                    </p>
                  )}

                  {member.coach_contact && (
                    <p className="text-xs text-slate-400 mt-0.5">👤 Coach: {member.coach_contact}</p>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(member)}
                    className="p-1.5 rounded-xl text-slate-300 hover:text-brand-500 hover:bg-brand-50 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member)}
                    className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy notice */}
      <div className="bg-slate-50 rounded-2xl p-4 flex gap-3">
        <Shield size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Your privacy matters.</strong> Family Sync never shares your family's data. Children's information stays private and is never used for advertising. All data is encrypted and stored securely.
        </p>
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingMember ? `Edit ${editingMember.name}` : "Add Family Member"}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Sofia or Dad"
            required
          />

          {/* Role picker */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Role</label>
            <div className="flex gap-2">
              {["parent", "guardian", "child"].map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                    form.role === r
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Sports */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Sports &amp; Activities</label>
            <div className="flex flex-wrap gap-2">
              {SPORT_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSport(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    form.sports.includes(s)
                      ? "bg-brand-100 text-brand-700 border border-brand-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Team name (optional)"
            value={form.team_names[0]}
            onChange={(e) => setForm({ ...form, team_names: [e.target.value] })}
            placeholder="e.g. Storm U10, Lightning FC"
          />

          <Input
            label="Birth year (optional)"
            type="number"
            value={form.birth_year}
            onChange={(e) => setForm({ ...form, birth_year: e.target.value })}
            placeholder="e.g. 2015"
          />

          <Input
            label="Coach contact (optional)"
            value={form.coach_contact}
            onChange={(e) => setForm({ ...form, coach_contact: e.target.value })}
            placeholder="Coach name or phone"
          />

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button fullWidth loading={saving} onClick={saveMember}>
              {editingMember ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
