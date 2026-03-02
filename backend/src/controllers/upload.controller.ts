import { Request, Response } from 'express';
import cloudinary from '../lib/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export class UploadController {
    static async uploadFile(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file provided" });
            }

            const buffer = req.file.buffer;

            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "products",
                    },
                    (error, result) => {
                        if (error || !result) return reject(error);
                        resolve(result);
                    }
                );

                uploadStream.end(buffer);
            });

            return res.status(200).json(result);

        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ error: "Upload failed" });
        }
    }
}
