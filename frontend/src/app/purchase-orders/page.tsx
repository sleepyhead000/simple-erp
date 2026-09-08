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
import { Plus, Search, Truck } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  supplier: string;
  status: string;
  total: string;
  createdAt: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
}

function getStatusVariant(status: string) {
  switch (status?.toLowerCase()) {
    case "received": return "success" as const;
    case "ordered": return "default" as const;
    case "cancelled": return "destructive" as const;
    default: return "secondary" as const;
  }
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    storeId: "",
    supplier: "",
    items: [{ productId: "", quantity: "1", unitCost: "" }] as Array<{ productId: string; quantity: string; unitCost: string }>,
  });

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts()]);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/purchase-orders");
      setOrders(response.data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.supplier?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productId: "", quantity: "1", unitCost: "" }],
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const handleCreate = async () => {
    if (!form.storeId || form.items.length === 0) {
      toast.error("Store ID and at least one item are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        storeId: form.storeId,
        supplier: form.supplier || undefined,
        items: form.items.map((item) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity) || 1,
          unitCost: parseFloat(item.unitCost) || 0,
        })),
      };
      await api.post("/purchase-orders", payload);
      toast.success("Purchase order created");
      setDialogOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await api.patch(`/purchase-orders/${id}/receive`);
      toast.success("Order marked as received");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to receive order");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/purchase-orders/${id}/cancel`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Purchase Orders"
        description="Manage supplier orders"
        actions={
          <Button onClick={() => {
            setForm({ storeId: "", supplier: "", items: [{ productId: "", quantity: "1", unitCost: "" }] });
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        }
      >
        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
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
              <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No purchase orders</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "No matching orders" : "Create your first purchase order to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {order.id.slice(0, 8)}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">{order.supplier || "—"}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(order.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {order.status === "ordered" && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleReceive(order.id)}>
                                  Receive
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleCancel(order.id)}>
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create PO Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>Order stock from a supplier</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="storeId" className="text-right">Store ID *</Label>
              <Input
                id="storeId"
                value={form.storeId}
                onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                className="col-span-3"
                placeholder="Store UUID"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Supplier</Label>
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="col-span-3"
                placeholder="Supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className="w-20"
                    placeholder="Qty"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitCost}
                    onChange={(e) => updateItem(i, "unitCost", e.target.value)}
                    className="w-24"
                    placeholder="Cost"
                  />
                  {form.items.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeItem(i)}>×</Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem}>+ Add Item</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
