"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AdminOrder = {
  id: string;
  status: "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";
  totalAmount: number;
  customerName: string;
  email: string;
  paymentProvider: string | null;
  paymentRef: string | null;
  paidAt: string | null;
  fulfilledAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

function getStatusBadgeClass(status: AdminOrder["status"]) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "PAID":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "FULFILLED":
      return "bg-green-100 text-green-800 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<AdminOrder[]>(`${BACKEND_URL}/api/orders`, {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusSummary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc[order.status] += 1;
        return acc;
      },
      { PENDING: 0, PAID: 0, FULFILLED: 0, CANCELLED: 0 }
    );
  }, [orders]);

  const transitionOrder = async (orderId: string, action: "fulfill" | "cancel") => {
    setActiveOrderId(orderId);
    try {
      await axios.post(
        `${BACKEND_URL}/api/orders/${encodeURIComponent(orderId)}/${action}`,
        {},
        { withCredentials: true }
      );
      toast.success(
        action === "fulfill" ? "Order marked as fulfilled" : "Order cancelled"
      );
      await fetchOrders();
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (action === "fulfill" ? "Failed to fulfill order" : "Failed to cancel order");
      toast.error(message);
    } finally {
      setActiveOrderId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage payment lifecycle and fulfillment transitions.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusSummary).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const busy = activeOrderId === order.id;
                    const canFulfill = order.status === "PAID";
                    const canCancel =
                      order.status === "PENDING" || order.status === "PAID";

                    return (
                      <tr key={order.id} className="border-b align-top">
                        <td className="py-3 pr-4">
                          <div className="font-medium">{order.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.paymentProvider || "n/a"} / {order.paymentRef || "n/a"}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div>{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.email}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">GH₵{order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 pr-4">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" disabled={!canFulfill || busy}>
                                  Fulfill
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Mark order as fulfilled?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will fulfill <span className="font-medium">{order.customerName || "this customer"}&apos;s</span> order
                                    of <span className="font-medium">GH₵{order.totalAmount.toFixed(2)}</span> and
                                    update the status from PAID to FULFILLED.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Back</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => transitionOrder(order.id, "fulfill")}
                                  >
                                    Confirm Fulfill
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" disabled={!canCancel || busy}>
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will cancel <span className="font-medium">{order.customerName || "this customer"}&apos;s</span> order
                                    of <span className="font-medium">GH₵{order.totalAmount.toFixed(2)}</span>.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Back</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                    onClick={() => transitionOrder(order.id, "cancel")}
                                  >
                                    Confirm Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
