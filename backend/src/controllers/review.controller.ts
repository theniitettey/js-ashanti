import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ReviewController {
    static async createReview(req: Request, res: Response) {
        try {
            const body = req.body;
            const { customerName, review, productSlug, rating } = body;

            if (!customerName || !review || !productSlug || typeof rating !== "number") {
                return res.status(400).json({ message: "Missing or invalid fields" });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }

            const product = await prisma.product.findUnique({
                where: { slug: productSlug },
            });

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            const newReview = await prisma.review.create({
                data: {
                    name: customerName,
                    text: review,
                    rating: rating,
                    productSlug: product.slug,
                },
            });

            return res.status(201).json(newReview);
        } catch (error) {
            console.error("Error creating review:", error);
            return res.status(500).json({ message: "Error creating review" });
        }
    }
    static async getReviewsByProduct(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const reviews = await prisma.review.findMany({
                where: { productSlug: slug },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(reviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return res.status(500).json({ message: "Error fetching reviews" });
        }
    }
}
