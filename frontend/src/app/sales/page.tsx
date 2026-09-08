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
import { Plus, Search, ShoppingCart } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Sale {
  id: string;
  total: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items?: { quantity: number }[];
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
}

function getStatusVariant(status: string) {
  switch (status?.toLowerCase()) {
    case "completed": return "success" as const;
    case "refunded": return "warning" as const;
    case "cancelled": return "destructive" as const;
    default: return "secondary" as const;
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    storeId: "",
    paymentMethod: "cash",
    items: [{ productId: "", quantity: "1", unitPrice: "" }] as Array<{ productId: string; quantity: string; unitPrice: string }>,
  });

  useEffect(() => {
    Promise.all([fetchSales(), fetchProducts()]);
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get("/sales");
      setSales(response.data);
    } catch (err) {
      toast.error("Failed to fetch sales");
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

  const filtered = sales.filter(
    (s) =>
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.status?.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productId: "", quantity: "1", unitPrice: "" }],
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
        paymentMethod: form.paymentMethod,
        items: form.items.map((item) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
        })),
      };
      await api.post("/sales", payload);
      toast.success("Sale created");
      setDialogOpen(false);
      fetchSales();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Sales"
        description="View and manage transactions"
        actions={
          <Button onClick={() => {
            setForm({ storeId: "", paymentMethod: "cash", items: [{ productId: "", quantity: "1", unitPrice: "" }] });
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        }
      >
        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sales..."
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
              <div className="p-8 text-center text-muted-foreground">Loading sales...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No sales yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "No matching sales" : "Sales transactions will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {sale.id.slice(0, 8)}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          {sale.items?.length || 0}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(sale.total).toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize text-sm">{sale.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(sale.status)}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(sale.createdAt).toLocaleDateString()}
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

      {/* Create Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Sale</DialogTitle>
            <DialogDescription>Create a new sales transaction</DialogDescription>
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
              <Label htmlFor="payment" className="text-right">Payment</Label>
              <select
                id="payment"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
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
                      <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
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
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                    className="w-24"
                    placeholder="Price"
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
              {saving ? "Creating..." : "Create Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
