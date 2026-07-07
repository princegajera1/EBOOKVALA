import React, { useState } from "react";
import { 
  Users, UserPlus, Check, X, Shield, Star, 
  Trash2, Mail, Info, Key
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

const ROLES_LIST = [
  { id: "admin", name: "Co-Admin", desc: "Full controls over configurations, uploads, and earnings." },
  { id: "editor", name: "Editor", desc: "Can manage and draft chapters in the Book Builder." },
  { id: "designer", name: "Designer", desc: "Can upload cover images, design metadata assets." },
  { id: "translator", name: "Translator", desc: "Can edit and compile multi-language localizations." },
  { id: "proofreader", name: "Proofreader", desc: "Can review drafts and submit proof comments." }
];

const PERMISSIONS_MATRIX = [
  { action: "Edit Book Chapters", admin: true, editor: true, designer: false, translator: false, proofreader: false },
  { action: "Upload Cover Files", admin: true, editor: true, designer: true, translator: false, proofreader: false },
  { action: "Manage SEO Center", admin: true, editor: true, designer: false, translator: false, proofreader: false },
  { action: "Edit Localizations", admin: true, editor: false, designer: false, translator: true, proofreader: false },
  { action: "Moderate Reader Reviews", admin: true, editor: false, designer: false, translator: false, proofreader: true },
  { action: "View Financial Insights", admin: true, editor: false, designer: false, translator: false, proofreader: false }
];

const INITIAL_MEMBERS = [
  { id: "m-1", name: "Preet Gajera", email: "preet@ebookvala.com", role: "admin", status: "Active" },
  { id: "m-2", name: "Jay Patel", email: "jay@designlabs.in", role: "designer", status: "Active" },
  { id: "m-3", name: "Sarah Connor", email: "sarah@localize.net", role: "translator", status: "Pending Invite" }
];

export const TeamWorkspace = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    // Add pending member
    const newMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "Pending Invite"
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    toast.success(`Invitation link emailed to ${inviteEmail}! ✉️`);
  };

  const handleRemoveMember = (id, name) => {
    if (!window.confirm(`Revoke workspace access for ${name}?`)) return;
    setMembers(members.filter(m => m.id !== id));
    toast.success(`Removed ${name} from workspace! 🗑️`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-display font-black text-brand-text">Team Workspace</h1>
        <p className="text-xs text-brand-text-secondary mt-1 font-semibold">
          Collaborate on your publications. Invite co-authors, designers, and editors with custom permission roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
        
        {/* Left 2 Cols: Invite & Matrix */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Invite Form */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-brand-accent" /> Invite Team Member
            </h3>

            <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row items-end gap-4 mt-4 font-display">
              <div className="flex-grow min-w-[200px]">
                <Input 
                  label="Member Email Address"
                  placeholder="name@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left shrink-0">
                <label className="text-xs font-bold text-brand-text-secondary">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="bg-brand-bg border border-brand-border px-4 py-2.5 text-xs rounded-full focus:outline-none focus:border-brand-accent text-brand-text font-bold"
                >
                  {ROLES_LIST.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="primary" className="h-11 rounded-full text-xs font-bold px-6 shadow-sm shrink-0">
                Send Invitation
              </Button>
            </form>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 shadow-sm overflow-x-auto">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
              <Key className="h-4 w-4 text-brand-accent" /> Role Permissions Matrix
            </h3>

            <table className="w-full text-left border-collapse mt-4 text-xs">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-secondary font-bold uppercase tracking-wider font-mono text-[9px]">
                  <th className="py-2.5">Feature Area Action</th>
                  <th className="py-2.5 text-center">Admin</th>
                  <th className="py-2.5 text-center">Editor</th>
                  <th className="py-2.5 text-center">Designer</th>
                  <th className="py-2.5 text-center">Translator</th>
                  <th className="py-2.5 text-center">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 font-semibold text-brand-text-secondary">
                {PERMISSIONS_MATRIX.map((p, idx) => (
                  <tr key={idx} className="hover:bg-brand-bg-secondary/20">
                    <td className="py-3 font-display text-brand-text font-bold">{p.action}</td>
                    <td className="py-3 text-center">{p.admin ? <Check className="h-4 w-4 text-brand-success mx-auto" /> : <X className="h-4 w-4 text-brand-text-secondary/35 mx-auto" />}</td>
                    <td className="py-3 text-center">{p.editor ? <Check className="h-4 w-4 text-brand-success mx-auto" /> : <X className="h-4 w-4 text-brand-text-secondary/35 mx-auto" />}</td>
                    <td className="py-3 text-center">{p.designer ? <Check className="h-4 w-4 text-brand-success mx-auto" /> : <X className="h-4 w-4 text-brand-text-secondary/35 mx-auto" />}</td>
                    <td className="py-3 text-center">{p.translator ? <Check className="h-4 w-4 text-brand-success mx-auto" /> : <X className="h-4 w-4 text-brand-text-secondary/35 mx-auto" />}</td>
                    <td className="py-3 text-center">{p.proofreader ? <Check className="h-4 w-4 text-brand-success mx-auto" /> : <X className="h-4 w-4 text-brand-text-secondary/35 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Sidebar: Active Members */}
        <div className="bg-brand-card border border-brand-border rounded-[24px] p-5 flex flex-col gap-4 shadow-sm select-none">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest font-mono border-b border-brand-border pb-2.5 w-full flex items-center gap-1.5">
            <Users className="h-4 w-4 text-brand-accent animate-pulse" /> Workspace Members
          </h3>

          <div className="flex flex-col gap-2.5">
            {members.map((member) => (
              <div key={member.id} className="p-3 bg-brand-bg-secondary border border-brand-border rounded-[14px] flex items-center justify-between gap-2 text-left">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-brand-text truncate leading-tight">{member.name}</p>
                  <p className="text-[10px] text-brand-text-secondary mt-0.5 truncate">{member.email}</p>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-brand-accent/15 text-brand-accent border border-brand-accent/20 rounded-full font-bold uppercase tracking-wider">
                      {member.role}
                    </span>
                    <span className={`text-[9px] font-bold ${
                      member.status === "Active" ? "text-brand-success" : "text-amber-500"
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleRemoveMember(member.id, member.name)}
                  className="p-2 text-brand-text-secondary hover:bg-brand-danger/10 hover:text-brand-danger rounded-full transition-colors cursor-pointer shrink-0"
                  title="Remove Member"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-brand-bg-secondary border border-brand-border rounded-[16px] text-left mt-2 flex items-start gap-2">
            <Info className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
            <p className="text-[10px] text-brand-text-secondary font-semibold leading-relaxed">
              Co-authors or editors will automatically see this book project inside their own dashboard after accepting the invite.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
export default TeamWorkspace;
