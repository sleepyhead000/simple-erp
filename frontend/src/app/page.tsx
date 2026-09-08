"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import AppShell from "@/components/layout/AppShell";
import {
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Plus,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalSales: number;
  totalOrders: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockItems: 0,
    totalSales: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [productsRes, inventoryRes, salesRes, poRes] = await Promise.allSettled([
        api.get("/products"),
        api.get("/inventory"),
        api.get("/sales"),
        api.get("/purchase-orders"),
      ]);

      let totalProducts = 0;
      let lowStockItems = 0;
      let totalSales = 0;
      let totalOrders = 0;

      if (productsRes.status === "fulfilled") {
        totalProducts = productsRes.value.data?.length || 0;
      }
      if (inventoryRes.status === "fulfilled") {
        const inventory = inventoryRes.value.data || [];
        lowStockItems = inventory.filter(
          (item: any) => item.quantity <= (item.reorderPoint || 0)
        ).length;
      }
      if (salesRes.status === "fulfilled") {
        const sales = salesRes.value.data || [];
        totalSales = sales.reduce((sum: number, s: any) => sum + parseFloat(s.total || "0"), 0);
        totalOrders = sales.length;
      }
      if (poRes.status === "fulfilled") {
        const orders = poRes.value.data || [];
        totalOrders += orders.filter((o: any) => o.status === "ordered").length;
      }

      setStats({ totalProducts, lowStockItems, totalSales, totalOrders });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Total Sales",
      value: `$${stats.totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening today."
        actions={
          <Link href="/products">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-semibold">
                        {loading ? "—" : stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: "Add Product", href: "/products", icon: Package },
                { name: "Check Stock", href: "/inventory", icon: AlertTriangle },
                { name: "New Sale", href: "/sales", icon: ShoppingCart },
                { name: "Create Purchase Order", href: "/purchase-orders", icon: ShoppingCart },
                { name: "View Reports", href: "/reports", icon: DollarSign },
                { name: "Manage Stores", href: "/admin/stores", icon: Package },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span className="text-sm font-medium">{action.name}</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
