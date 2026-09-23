"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function AccountSettingsForm({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [savingUsername, setSavingUsername] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingUsername(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not signed in");
      setSavingUsername(false);
      return;
    }

    const trimmed = username.trim();
    const { error } = await supabase
      .from("profiles")
      .update({ username: trimmed || null })
      .eq("id", user.id);

    setSavingUsername(false);

    if (error) {
      // Postgres unique_violation
      if (error.code === "23505") {
        toast.error("That username is already taken");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Username updated");
    router.refresh();
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setSavingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleUsernameSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Optional — leave blank to have none"
            maxLength={32}
          />
        </div>
        <Button type="submit" size="sm" disabled={savingUsername}>
          {savingUsername ? "Saving..." : "Save username"}
        </Button>
      </form>

      <div className="border-t border-border pt-6">
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <Button type="submit" size="sm" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Change password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
