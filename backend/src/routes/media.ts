import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import auth from '../middleware/auth';
import prisma from '../config/db';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/upload', auth, upload.single('file'), async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const media = await prisma.media.create({
      data: {
        userId: req.user.id,
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype,
      }
    });

    // START AUTO GENERATION IMMEDIATELY
    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const filePath = path.join(__dirname, '../../uploads', media.filename);
      let inlineDataPart = null;
      if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath).toString("base64");
          inlineDataPart = { inlineData: { data, mimeType: media.type } };
      }
      
      const prompt = `Act as an expert Social Media Manager for Haxxcel Solutions. Look at the attached image carefully. 
      Create an engaging social media post.
      Provide the result STRICTLY as a valid JSON object:
      {
        "caption": "compelling caption with emojis and CTA",
        "hashtags": ["#Haxxcel", "#Innovation"]
      }`;

      const contents: any[] = [prompt];
      if (inlineDataPart && media.type.startsWith('image/')) contents.push(inlineDataPart);

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: { responseMimeType: "application/json" }
      });
      
      let parsed = { caption: 'Auto-generated caption by Haxxcel Engine.', hashtags: ['#haxxcel', '#tech'] };
      try { parsed = JSON.parse(response.text || '{}'); } catch(e) {}
      
      // Save it immediately as a ready draft
      await prisma.post.create({
          data: {
              userId: req.user.id,
              mediaUrl: media.url,
              caption: parsed.caption,
              hashtags: !!parsed.hashtags && Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
              platforms: [], 
              status: 'draft',
          }
      });
    } catch (aiErr) {
      console.error('Immediate AI generation failed on upload:', aiErr);
    }
    // END AUTO GENERATION

    res.json(media);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req: any, res: Response): Promise<any> => {
    try {
        const media = await prisma.media.findMany({ 
            where: { userId: req.user.id },
            orderBy: { uploadDate: 'desc' }
        });
        res.json(media);
    } catch(err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
