import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export class MobileController {
  // GET /api/mobile/analytics/dashboard
  static async getDashboard(req: Request, res: Response) {
    try {
      // 1. Product Metrics
      const totalProducts = await prisma.product.count();
      const lowStock = await prisma.product.count({
        where: { stock: { lte: 10, gt: 0 } },
      });
      const outOfStock = await prisma.product.count({
        where: { stock: 0 },
      });

      // 2. Revenue (best effort)
      // Some local databases may have schema drift around OrderStatus enum.
      // In that case, do not fail the whole mobile dashboard.
      let totalRevenue = 0;
      try {
        const totalRevenueAgg = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { in: ["PAID", "FULFILLED"] } },
        });
        totalRevenue = totalRevenueAgg._sum?.totalAmount ?? 0;
      } catch (orderError) {
        console.warn(
          "[Mobile] Revenue aggregation unavailable, falling back to 0:",
          orderError,
        );
      }

      // 3. Visitor Metrics (from Events)
      // Active visitors: Unique users in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeVisitors = await prisma.event.groupBy({
        by: ["user_id"],
        where: {
          timestamp: { gte: fiveMinutesAgo },
          user_id: { not: null },
        },
      });

      // 4. Page Views Per Minute (last 30 mins average)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentPageViews = await prisma.event.count({
        where: {
          event_type: "PAGE_VIEW",
          timestamp: { gte: thirtyMinutesAgo },
        },
      });
      const pageViewsPerMin = parseFloat((recentPageViews / 30).toFixed(1));

      res.json({
        metrics: {
          totalProducts,
          lowStock,
          outOfStock,
          totalRevenue,
          currentVisitors: activeVisitors.length,
          activeVisitors: activeVisitors.length,
          pageViewsPerMin,
        },
        topProducts: [], // To be implemented with OrderItem aggregation
        revenueByCategory: [], // To be implemented
      });
    } catch (error) {
      console.error("[Mobile] Error fetching dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  }

  // GET /api/mobile/analytics/reports
  static async getReports(req: Request, res: Response) {
    try {
      const [
        revenueAgg,
        totalOrders,
        totalCustomers,
        pageViews,
        productViews,
        addToCartEvents,
        checkoutEvents,
        completedOrders,
        topProducts,
      ] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { in: ["PAID", "FULFILLED"] } },
        }),
        prisma.order.count(),
        prisma.user.count(),
        prisma.event.count({ where: { event_type: "PAGE_VIEW" } }),
        prisma.event.count({ where: { event_type: "PRODUCT_VIEW" } }),
        prisma.event.count({ where: { event_type: "ADD_TO_CART" } }),
        prisma.event.count({ where: { event_type: "CHECKOUT_START" } }),
        prisma.order.count({ where: { status: { in: ["PAID", "FULFILLED"] } } }),
        prisma.product.findMany({ orderBy: { stock: "desc" }, take: 5, select: { name: true, price: true, stock: true } }),
      ]);

      const totalRevenue = revenueAgg._sum?.totalAmount ?? 0;
      const conversionRate = pageViews > 0 ? completedOrders / pageViews : 0;

      res.json({
        metrics: {
          totalRevenue: `GH₵${totalRevenue.toLocaleString()}`,
          totalOrders: String(totalOrders),
          newCustomers: String(totalCustomers),
          conversionRate: `${(conversionRate * 100).toFixed(1)}%`,
          revenueChange: "+0%",
          ordersChange: "+0%",
          customersChange: "+0%",
          conversionChange: "+0%",
        },
        topProducts: topProducts.map((p: any) => ({
          name: p.name,
          units: p.stock,
          rev: `GH₵${(p.price * p.stock).toFixed(0)}`,
        })),
        funnel: [
          { label: "Page Views", val: pageViews },
          { label: "Product Views", val: productViews },
          { label: "Add to Cart", val: addToCartEvents },
          { label: "Checkout Started", val: checkoutEvents },
          { label: "Orders Completed", val: completedOrders },
        ],
      });
    } catch (error) {
      console.error("[Mobile] Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  }

  // GET /api/mobile/analytics/ai-insights
  static async getAIInsights(req: Request, res: Response) {
    try {
      // Fetch latest generated insights from DB
      const insights = await prisma.insight.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Map to mobile format
      const mappedInsights = insights.map((insight: any) => ({
        id: insight.id,
        type: "trend", // Logic to determine type based on patterns or summary
        title: "AI Insight",
        description: insight.summary,
        confidence: insight.confidence,
        timestamp: insight.createdAt,
        actionable: true,
      }));

      res.json({
        insights: mappedInsights,
        summary: "AI analysis based on recent batch events.",
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Mobile] Error fetching AI insights:", error);
      res.status(500).json({ error: "Failed to fetch AI insights" });
    }
  }

  // GET /api/mobile/products
  static async getProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      res.json(products);
    } catch (error) {
      console.error("[Mobile] Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  // POST /api/mobile/products (create product – same shape as web)
  static async createProduct(req: Request, res: Response) {
    try {
      const session = (req as any).session;
      if (!session?.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const hasPermission = await auth.api.userHasPermission({
        headers: fromNodeHeaders(req.headers),
        body: {
          userId: session.user.id,
          permission: { Dashboard: ["create"] },
        },
      });
      if (!hasPermission) {
        return res
          .status(403)
          .json({ error: "Forbidden – You do not have permission to create products." });
      }

      const body = req.body;
      if (typeof body !== "object" || body === null) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const baseSlug = (body.name ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "product";
      let slug = baseSlug;
      let slugSuffix = 0;
      while (await prisma.product.findUnique({ where: { slug } })) {
        slugSuffix++;
        slug = `${baseSlug}-${slugSuffix}`;
      }

      const skuValue = typeof body.sku === "string" && body.sku.trim() ? body.sku.trim() : undefined;
      if (skuValue !== undefined) {
        const existing = await prisma.product.findUnique({ where: { sku: skuValue } });
        if (existing) {
          return res.status(400).json({ error: "A product with this SKU already exists." });
        }
      }

      const product = await prisma.product.create({
        data: {
          name: body.name,
          slug,
          description: body.description ?? "",
          category: body.category ?? "",
          subcategories: Array.isArray(body.subcategories) ? body.subcategories : [],
          colors: Array.isArray(body.colors) ? body.colors : [],
          price: Number(body.price) || 0,
          discount: Number(body.discount) || 0,
          ratingFromManufacturer: body.ratingFromManufacturer ?? null,
          customerRating: body.customerRating ?? null,
          images: Array.isArray(body.images) ? body.images : [],
          stock: Number(body.stock) || 0,
          ...(skuValue !== undefined ? { sku: skuValue } : {}),
        },
      });

      return res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error: any) {
      console.error("[Mobile] Error creating product:", error);
      const message = error?.message || "Failed to create product";
      const isUniqueViolation = message.includes("Unique constraint") || message.includes("unique");
      res.status(isUniqueViolation ? 400 : 500).json({
        error: isUniqueViolation ? "A product with this name or SKU already exists." : message,
      });
    }
  }

  // PATCH /api/mobile/products/:id/stock
  static async updateProductStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { additionalStock } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const qty = Number(additionalStock);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ error: "additionalStock must be a positive number" });
      }

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updated = await prisma.product.update({
        where: { id },
        data: { stock: product.stock + qty },
      });

      return res.json({
        message: `Stock updated: ${product.stock} → ${updated.stock}`,
        product: updated,
      });
    } catch (error) {
      console.error("[Mobile] Error updating stock:", error);
      res.status(500).json({ error: "Failed to update stock" });
    }
  }

  // DELETE /api/mobile/products/:id
  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      await prisma.product.delete({ where: { id } });

      return res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("[Mobile] Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }

  // GET /api/mobile/inventory/metrics
  static async getInventoryMetrics(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          category: true,
          price: true,
        },
      });

      const processed = products.map((p: any) => {
        let status: "CRITICAL" | "LOW" | "HEALTHY" | "OUT" = "HEALTHY";
        if (p.stock === 0) status = "OUT";
        else if (p.stock <= 5) status = "CRITICAL";
        else if (p.stock <= 15) status = "LOW";

        return {
          id: p.id,
          name: p.name,
          sku: p.sku || `SKU-${p.id.slice(0, 8).toUpperCase()}`,
          category: p.category || "",
          price: `GH₵${(p.price || 0).toLocaleString()}`,
          stock: p.stock,
          stockCount: p.stock,
          status,
          image: "",
        };
      });

      // Metrics summary
      const totalProducts = products.length;
      const outOfStock = processed.filter((p: any) => p.status === "OUT").length;
      const lowStock = processed.filter((p: any) => p.status === "LOW").length;
      const criticalStock = processed.filter((p: any) => p.status === "CRITICAL").length;
      const healthy = processed.filter((p: any) => p.status === "HEALTHY").length;

      res.json({
        metrics: [
          { id: "total", label: "Total Products", value: String(totalProducts), icon: "cube.box.fill", iconColor: "#5E6AD2", progress: 1, progressColor: "#5E6AD2" },
          { id: "healthy", label: "In Stock", value: String(healthy), icon: "checkmark.circle.fill", iconColor: "#059669", progress: totalProducts > 0 ? healthy / totalProducts : 0, progressColor: "#059669" },
          { id: "low", label: "Low Stock", value: String(lowStock + criticalStock), icon: "exclamationmark.triangle.fill", iconColor: "#D97706", progress: totalProducts > 0 ? (lowStock + criticalStock) / totalProducts : 0, progressColor: "#D97706" },
          { id: "out", label: "Out of Stock", value: String(outOfStock), icon: "xmark.circle.fill", iconColor: "#DC2626", progress: totalProducts > 0 ? outOfStock / totalProducts : 0, progressColor: "#DC2626" },
        ],
        products: processed,
      });
    } catch (error) {
      console.error("[Mobile] Error fetching inventory metrics:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  }
}
