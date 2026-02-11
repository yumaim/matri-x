"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Building2, Globe, AtSign, Loader2, Save, CheckCircle2, Users, Camera } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  plan: string;
  company: string | null;
  community: string | null;
  bio: string | null;
  website: string | null;
  xHandle: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [community, setCommunity] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name ?? "");
        setCompany(data.company ?? "");
        setCommunity(data.community ?? "");
        setBio(data.bio ?? "");
        setWebsite(data.website ?? "");
        setXHandle(data.xHandle ?? "");
        setAvatarUrl(data.image ?? "");
      })
      .catch(() => setError("プロフィールの読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, community, bio, website, xHandle, image: avatarUrl || "" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }
      const updated = await res.json();
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = (name || profile?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">プロフィール</h1>
        <p className="text-muted-foreground">あなたのプロフィール情報を管理します</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {avatarUploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatarUploading(true);
                try {
                  // Compress image client-side
                  const img = new Image();
                  const objectUrl = URL.createObjectURL(file);
                  img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    const canvas = document.createElement("canvas");
                    const MAX_SIZE = 400;
                    let w = img.width;
                    let h = img.height;
                    if (w > h) {
                      if (w > MAX_SIZE) { h = h * MAX_SIZE / w; w = MAX_SIZE; }
                    } else {
                      if (h > MAX_SIZE) { w = w * MAX_SIZE / h; h = MAX_SIZE; }
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                    setAvatarUrl(dataUrl);
                    setAvatarUploading(false);
                  };
                  img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    setError("画像の読み込みに失敗しました");
                    setAvatarUploading(false);
                  };
                  img.src = objectUrl;
                } catch {
                  setError("画像のアップロードに失敗しました");
                  setAvatarUploading(false);
                }
              }}
            />
          </div>
          <div>
            <p className="text-lg font-semibold">{profile?.name || "未設定"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {profile?.role}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {profile?.plan} プラン
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">画像をクリックして変更（自動圧縮）</p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール編集</CardTitle>
          <CardDescription>公開プロフィール情報を更新します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" /> 名前
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="あなたの名前"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> メールアドレス
            </Label>
            <Input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">メールアドレスは変更できません</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> 会社・組織
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="所属する会社や組織"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> 所属コミュニティ
            </Label>
            <Input
              id="community"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              placeholder="所属するコミュニティ（例: マーケティング勉強会、X運用サロン）"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="あなたについて教えてください"
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> ウェブサイト
            </Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xHandle" className="flex items-center gap-2">
              <AtSign className="h-4 w-4" /> X (Twitter) ハンドル
            </Label>
            <Input
              id="xHandle"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              placeholder="@username"
              maxLength={50}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              保存する
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                保存しました
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
