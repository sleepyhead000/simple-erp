"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  Store,
  Users,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useTutorialStore } from "@/store/tutorial-store";

const mainNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
];

const inventoryNav = [
  { name: "Stock", href: "/inventory", icon: Warehouse },
  { name: "Purchase Orders", href: "/purchase-orders", icon: Truck },
];

const salesNav = [
  { name: "Sales", href: "/sales", icon: ShoppingCart },
];

const adminNav = [
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Stores", href: "/admin/stores", icon: Store },
  { name: "Users", href: "/admin/users", icon: Users },
];

function NavSection({ title, items }: { title: string; items: typeof mainNav }) {
  const pathname = usePathname();
  return (
    <div className="mb-4">
      <div className="px-3 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const reopenTutorial = useTutorialStore((state) => state.reopen);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r border-border bg-card h-screen sticky top-0">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">E</span>
        </div>
        <span className="font-semibold text-lg">ERP System</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavSection title="Main" items={mainNav} />
        <NavSection title="Inventory" items={inventoryNav} />
        <NavSection title="Sales" items={salesNav} />
        <NavSection title="Administration" items={adminNav} />
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email || ""}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-accent transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button
            onClick={reopenTutorial}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            title="Help & Tutorial"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
