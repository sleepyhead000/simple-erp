"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageHeader from "@/components/layout/PageHeader";
import AppShell from "@/components/layout/AppShell";
import { Plus, Search, Warehouse, ArrowUp, ArrowDown } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  reorderPoint: number;
  product?: { name: string; sku: string };
  store?: { name: string };
}

function getStockStatus(qty: number, reorder: number) {
  if (qty === 0) return { label: "Out of Stock", variant: "destructive" as const };
  if (qty <= reorder) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState({ quantity: "", reason: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get("/inventory");
      setItems(response.data);
    } catch (err) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.product?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustment({ quantity: "", reason: "" });
    setAdjustDialogOpen(true);
  };

  const handleAdjust = async () => {
    if (!selectedItem || !adjustment.quantity) {
      toast.error("Enter an adjustment quantity");
      return;
    }
    const qty = parseInt(adjustment.quantity);
    if (isNaN(qty) || qty === 0) {
      toast.error("Quantity must be a non-zero number");
      return;
    }
    setSaving(true);
    try {
      await api.post("/inventory/adjust", {
        productId: selectedItem.productId,
        storeId: selectedItem.storeId,
        quantity: qty,
        reason: adjustment.reason || undefined,
      });
      toast.success(`Stock ${qty > 0 ? "increased" : "decreased"} by ${Math.abs(qty)}`);
      setAdjustDialogOpen(false);
      fetchInventory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Inventory"
        description="Track stock levels across stores"
      >
        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </PageHeader>

      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Warehouse className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No inventory items found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inventory will appear once products are added to stores
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Reorder Point</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => {
                      const status = getStockStatus(item.quantity, item.reorderPoint);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.product?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {item.product?.sku || "—"}
                            </code>
                          </TableCell>
                          <TableCell>{item.store?.name || "—"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.reorderPoint}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAdjust(item)}
                            >
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {selectedItem?.product?.name} — Current: {selectedItem?.quantity} units
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={adjustment.quantity}
                onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                className="col-span-3"
                placeholder="+10 to add, -5 to remove"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">Reason</Label>
              <Input
                id="reason"
                value={adjustment.reason}
                onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                className="col-span-3"
                placeholder="Optional reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving}>
              {saving ? "Saving..." : "Apply Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
