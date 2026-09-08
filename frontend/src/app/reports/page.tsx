"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import AppShell from "@/components/layout/AppShell";
import { BarChart3, DollarSign, Package, ShoppingCart } from "lucide-react";

export default function ReportsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Reports"
        description="View analytics and insights"
      />

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Sales Report", icon: ShoppingCart, description: "Track sales performance over time" },
            { title: "Inventory Report", icon: Package, description: "Monitor stock levels and turnover" },
            { title: "Revenue Report", icon: DollarSign, description: "View revenue trends and forecasts" },
            { title: "Product Performance", icon: BarChart3, description: "Analyze top selling products" },
          ].map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.title} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
