"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AlgorithmUpdate {
  id: string;
  title: string;
  description: string;
  source: string | null;
  impact: string;
  category: string;
  publishedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const IMPACTS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const CATEGORIES = [
  "RANKING",
  "ENGAGEMENT",
  "CONTENT",
  "MODERATION",
  "MONETIZATION",
  "OTHER",
] as const;

const impactColors: Record<string, string> = {
  CRITICAL: "bg-red-900/50 text-red-300 border-red-700",
  HIGH: "bg-orange-900/50 text-orange-300 border-orange-700",
  MEDIUM: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  LOW: "bg-green-900/50 text-green-300 border-green-700",
};

const defaultFormData = {
  title: "",
  description: "",
  source: "",
  impact: "MEDIUM" as string,
  category: "OTHER" as string,
};

export default function AdminContentPage() {
  const [items, setItems] = useState<AlgorithmUpdate[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/content?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: formData.source || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setFormData(defaultFormData);
      setDialogOpen(false);
      fetchItems(1);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このアルゴリズムアップデートを削除しますか？")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setItems((prev) => prev.filter((item) => item.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">アルゴリズムアップデート</h3>
          <p className="text-sm text-muted-foreground">
            X（Twitter）のアルゴリズム変更を管理します
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>アルゴリズムアップデートを追加</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="アルゴリズム変更のタイトル"
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="変更の詳細..."
                  className="bg-secondary border-border min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">ソース</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, source: e.target.value }))
                  }
                  placeholder="https://..."
                  className="bg-secondary border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>影響度</Label>
                  <Select
                    value={formData.impact}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, impact: val }))
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPACTS.map((impact) => (
                        <SelectItem key={impact} value={impact}>
                          {impact}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>カテゴリ</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, category: val }))
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "作成中..." : "作成"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      タイトル
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      カテゴリ
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      影響度
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      公開日
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      アクション
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        アップデートがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="max-w-[300px]">
                          <div>
                            <p className="truncate text-sm font-medium">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.description.slice(0, 80)}
                              {item.description.length > 80 ? "..." : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                              impactColors[item.impact] ??
                              "bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            {item.impact}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(item.publishedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="削除"
                            disabled={deleting === item.id}
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchItems(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchItems(pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
