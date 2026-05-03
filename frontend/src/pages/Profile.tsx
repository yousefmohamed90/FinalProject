import { useState, useEffect } from "react";
import { Loader2, Save, Shield, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { setUser, logoutLocal } from "@/store/authSlice";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setAvatar(user.avatar ?? "");
    }
  }, [user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await api<{ success: true; user: any }>(`/users/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, avatar }),
      });
      dispatch(setUser(res.user));
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed", {
        description: e?.status === 403 ? "You can only edit your own profile." : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function onDeleteAccount() {
    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone!")) return;
    try {
      await api("/auth/me", { method: "DELETE" });
      dispatch(logoutLocal());
      qc.clear();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete account");
    }
  }

  const displayAvatar = user?.avatar || null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Profile</h1>
      <div className="space-y-6">
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-5 flex items-center gap-4">
            <span className="grid h-16 w-16 overflow-hidden place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shrink-0">
              {displayAvatar ? <img src={displayAvatar} alt="" className="h-full w-full object-cover" /> : (user?.name?.[0]?.toUpperCase() ?? "U")}
            </span>
            <div>
              <div className="text-lg font-semibold">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <div className="mt-1 flex items-center gap-2">
                {user?.role === "admin" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    <UserCircle className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-500">
                    Email pending
                  </span>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatar">Profile Picture (Upload)</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save changes
            </Button>
          </form>

          <div className="mt-10 pt-6 border-t border-border">
            <h3 className="text-lg font-bold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="destructive" onClick={onDeleteAccount}>
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
