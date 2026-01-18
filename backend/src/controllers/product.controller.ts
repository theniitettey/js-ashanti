import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

export class ProductController {
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
                    permission: {
                        Dashboard: ["create"]
                    }
                }
            });

            if (!hasPermission) {
                return res.status(403).json({ error: "Forbidden – You do not have permission to create products." });
            }

            const body = req.body;

            // Bulk Upload Case
            if (Array.isArray(body)) {
                const products = await prisma.product.createMany({
                    data: body.map(product => ({
                        name: product.name,
                        slug: product.name.toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)+/g, ""),
                        description: product.description,
                        category: product.category,
                        subcategories: product.subcategories ?? [],
                        colors: product.colors ?? [],
                        price: product.price,
                        discount: product.discount ?? 0,
                        ratingFromManufacturer: product.ratingFromManufacturer ?? null,
                        customerRating: product.customerRating ?? null,
                        images: product.images ?? [],
                    }))
                });

                return res.status(201).json({
                    message: "Bulk upload successful",
                    count: products.count
                });
            }
            // Single Upload Case
            else if (typeof body === 'object' && body !== null) {
                const product = await prisma.product.create({
                    data: {
                        name: body.name,
                        slug: body.name.toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)+/g, ""),
                        description: body.description,
                        category: body.category,
                        subcategories: body.subcategories ?? [],
                        colors: body.colors ?? [],
                        price: body.price,
                        discount: body.discount ?? 0,
                        ratingFromManufacturer: body.ratingFromManufacturer ?? null,
                        customerRating: body.customerRating ?? null,
                        images: body.images ?? [],
                    }
                });

                return res.status(201).json({
                    message: 'Single product created successfully',
                    product
                });
            }

            return res.status(400).json({
                error: 'Invalid request body format. Must be an object or array of objects.'
            });

        } catch (error) {
            console.error("Failed to create product:", error);
            return res.status(500).json({ error: "Failed to create product" });
        }
    }

    static async getProducts(req: Request, res: Response) {
        try {
            const products = await prisma.product.findMany();
            return res.json(products);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            return res.status(500).json({ error: "Failed to fetch products" });
        }
    }

    static async getProductBySlug(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const product = await prisma.product.findUnique({
                where: { slug }
            });

            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }

            return res.json(product);
        } catch (error) {
            console.error("Failed to fetch product by slug:", error);
            return res.status(500).json({ error: "Failed to fetch product" });
        }
    }

    static async updateProduct(req: Request, res: Response) {
        try {
            const session = (req as any).session;
            
            if (!session?.user?.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const hasPermission = await auth.api.userHasPermission({
                headers: fromNodeHeaders(req.headers),
                body: {
                    userId: session.user.id,
                    permission: {
                        Dashboard: ["update"]
                    }
                }
            });

            if (!hasPermission) {
                return res.status(403).json({ error: "Forbidden – You do not have permission to update products." });
            }

            const { slug } = req.params;
            const data = req.body;

            const product = await prisma.product.update({
                where: { slug },
                data: {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    price: data.price,
                    discount: data.discount,
                    ratingFromManufacturer: data.ratingFromManufacturer,
                }
            });

            return res.json(product);
        } catch (error) {
            console.error("Failed to update product:", error);
            return res.status(500).json({ error: "Failed to update product" });
        }
    }

    static async deleteProduct(req: Request, res: Response) {
        try {
            const session = (req as any).session;
            
            if (!session?.user?.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const hasPermission = await auth.api.userHasPermission({
                headers: fromNodeHeaders(req.headers),
                body: {
                    userId: session.user.id,
                    permission: {
                        Dashboard: ["delete"]
                    }
                }
            });

            if (!hasPermission) {
                return res.status(403).json({ error: "Forbidden – You do not have permission to delete products." });
            }

            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ message: 'Product ID is required' });
            }

            const product = await prisma.product.delete({
                where: { id },
            });

            return res.status(200).json({
                message: 'Product deleted successfully',
                product,
            });

        } catch (error) {
            console.error("Failed to delete product:", error);
            return res.status(500).json({ error: "Failed to delete product" });
        }
    }
}
