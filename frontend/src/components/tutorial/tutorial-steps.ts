import {
  LayoutDashboard,
  Package,
  Search,
  Warehouse,
  Wrench,
  ShoppingCart,
  Truck,
} from "lucide-react";

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  color: string;
  bgColor: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 0,
    title: "Welcome to ERP System",
    description:
      "This tool helps you manage your inventory, track sales, and handle purchase orders — all in one place. Let's take a quick tour of the key features.",
    icon: LayoutDashboard,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 1,
    title: "Dashboard Overview",
    description:
      "Your dashboard shows key metrics at a glance: total products, low stock alerts, total sales, and active orders. Use the Quick Actions grid below to jump to any section instantly.",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    title: "Product Catalog",
    description:
      "The Products page lists your entire catalog. Click 'Add Product' to create one with a SKU, name, category, and pricing. Use the edit and delete buttons on each row to manage items.",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: 3,
    title: "Search & Filter",
    description:
      "Every list page has a search bar at the top. Type to filter by name, SKU, or category. Results update as you type — no need to press enter.",
    icon: Search,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: 4,
    title: "Inventory Tracking",
    description:
      "The Inventory page shows stock levels across all stores. Each item displays its current quantity, reorder point, and a status badge — green for in stock, amber for low stock, red for out of stock.",
    icon: Warehouse,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: 5,
    title: "Adjusting Stock",
    description:
      "Click 'Adjust' on any inventory row to change quantities. Enter a positive number to add stock, or a negative number to remove it. The system prevents adjustments that would result in negative stock.",
    icon: Wrench,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: 6,
    title: "Making a Sale",
    description:
      "Create a sale by clicking 'New Sale'. Select products, enter quantities, and choose a payment method. The system automatically decrements inventory when a sale is completed.",
    icon: ShoppingCart,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: 7,
    title: "Purchase Orders",
    description:
      "Order stock from suppliers using 'Create Order'. Once stock arrives, click 'Receive' on the order to update inventory automatically. You can also cancel pending orders.",
    icon: Truck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];
