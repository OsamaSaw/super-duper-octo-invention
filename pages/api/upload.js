// pages/api/upload.js
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
export const config = {
    api: {
        bodyParser: false, // Disabling body parsing
    },
};

export default async function handler(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: 'Error parsing the files' });
            return;
        }

        // Assuming the file is stored in the 'file' field
        const file = files.productImage;

        try {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.filepath);
            res.status(200).json({ url: result.url });
        } catch (error) {
            res.status(500).json({ error: 'Error uploading to Cloudinary' });
        }
    });
}
