"use client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { ChartBarLabel } from "@/components/chart/BarChart";
import { ChartRadialText } from "@/components/chart/radialChart";
import { LoaderOne } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

type Product = {
  id: string;
  name: string;
  stock: number;
  discount?: number;
  category?: string;
};

type Order = {
  id: string;
  status: "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";
  totalAmount: number;
  customerName: string;
  email?: string;
  createdAt: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

export function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: session, error } = await authClient.getSession();
        if (error || !session) {
          toast.error("Failed to fetch session");
          return;
        }
        setUser(session.user);
      } catch (err) {
        toast.error("Unexpected error occurred");
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoadingMetrics(true);
        const [productsRes, ordersRes] = await Promise.all([
          axios.get<Product[]>(`${BACKEND_URL}/api/products`, { withCredentials: true }),
          axios.get<Order[]>(`${BACKEND_URL}/api/orders`, { withCredentials: true }),
        ]);
        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
      } catch (err) {
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoadingMetrics(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (!user) {
    return (
      <div className="h-dvh flex justify-center items-center">
        <LoaderOne />
      </div>
    );
  }

  const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= 10);
  const outOfStockProducts = products.filter((product) => product.stock === 0);
  const discountedProducts = products.filter((product) => (Number(product.discount) || 0) > 0);
  const pendingOrders = orders.filter((order) => order.status === "PENDING");
  const paidOrders = orders.filter((order) => order.status === "PAID");
  const recentOrders = orders.slice(0, 5);
  const grossRevenue = orders
    .filter((order) => order.status === "PAID" || order.status === "FULFILLED")
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => new Date(order.createdAt) >= startOfToday);
  const todayPaidOrders = todayOrders.filter(
    (order) => order.status === "PAID" || order.status === "FULFILLED"
  );
  const todayRevenue = todayPaidOrders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0
  );
  const todayFulfilledCount = todayOrders.filter(
    (order) => order.status === "FULFILLED"
  ).length;
  const todayUniqueCustomers = new Set(
    todayOrders.map((order) => (order.email || order.customerName || "").toLowerCase())
  ).size;

  return (
    <main className="flex-1 flex flex-col gap-4 p-6">
      {/* Admin Welcome Session */}
      <div className="flex flex-col items-center justify-start gap-2 text-center">
        <h1 className="text-3xl font-bold mb-4 text-neutral-500 dark:text-neutral-200">Welcome, {user.name}!</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Manage your application settings and content here.
        </p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{loadingMetrics ? "..." : products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">On Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{loadingMetrics ? "..." : discountedProducts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{loadingMetrics ? "..." : pendingOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue (Paid)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">GH₵{loadingMetrics ? "..." : grossRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{loadingMetrics ? "..." : todayOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">GH₵{loadingMetrics ? "..." : todayRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fulfilled Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{loadingMetrics ? "..." : todayFulfilledCount}</p>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">New Customers Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{loadingMetrics ? "..." : todayUniqueCustomers}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{order.status}</Badge>
                    <p className="text-sm mt-1">GH₵{Number(order.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href="/admin/orders">Open Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Low stock (1-10)</span>
              <Badge variant="secondary">{lowStockProducts.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Out of stock</span>
              <Badge variant="destructive">{outOfStockProducts.length}</Badge>
            </div>
            <div className="pt-2 space-y-2">
              {lowStockProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="text-xs text-muted-foreground">
                  {product.name} ({product.stock} left)
                </div>
              ))}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products">Manage Inventory</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
        <Button asChild variant="outline"><Link href="/admin/products/addProducts">Add Product</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/products/discounts">Manage Discounts</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/orders">Track Orders</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/analytics">Open Analytics</Link></Button>
      </section>

      <section className="flex flex-col md:flex-row gap-6 mt-10 px-4">
        <div className="w-full md:w-1/2">
            <ChartBarLabel />
        </div>
        <div className="w-full md:w-1/2">
            <ChartRadialText />
        </div>
      </section>

    </main>
  );
}
