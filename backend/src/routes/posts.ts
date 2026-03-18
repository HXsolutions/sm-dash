import express, { Response } from 'express';
import auth from '../middleware/auth';
import prisma from '../config/db';

const router = express.Router();

router.post('/bulk-schedule', auth, async (req: any, res: Response): Promise<any> => {
  try {
    const { postIds, platforms, postsPerDay, specificDays } = req.body;
    if (!postIds || postIds.length === 0) return res.status(400).json({msg: 'No posts selected'});

    const now = new Date();
    let currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0); 
    let postsAddedToDay = 0;
    const limitPerDay = postsPerDay || 1;
    const allowedDays = specificDays && specificDays.length > 0 ? specificDays : [0,1,2,3,4,5,6];

    for (let i = 0; i < postIds.length; i++) {
        while (true) {
            if (!allowedDays.includes(currentDate.getDay())) {
                currentDate.setDate(currentDate.getDate() + 1);
                postsAddedToDay = 0;
                continue;
            }
            if (postsAddedToDay >= limitPerDay) {
                currentDate.setDate(currentDate.getDate() + 1);
                postsAddedToDay = 0;
                continue;
            }
            break; 
        }

        const scheduledTime = new Date(currentDate.getTime() + (postsAddedToDay * 7200000)); 
        postsAddedToDay++;

        await prisma.post.update({
            where: { id: postIds[i] },
            data: {
                platforms: platforms || ['LinkedIn'],
                status: 'scheduled',
                scheduledTime: scheduledTime
            }
        });
    }

    res.json({ success: true, count: postIds.length });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req: any, res: Response): Promise<any> => {
  try {
    const { mediaUrl, caption, hashtags, platforms, status, scheduledTime } = req.body;
    
    const post = await prisma.post.create({
      data: {
        userId: req.user.id,
        mediaUrl,
        caption,
        hashtags,
        platforms,
        status: status || 'draft',
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null
      }
    });

    res.json(post);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req: any, res: Response): Promise<any> => {
  try {
    const posts = await prisma.post.findMany({ 
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
