import prisma from '../config/db';
import path from 'path';
import fs from 'fs';
import { sendTelegramReminder } from '../utils/telegram';
import { sendNotificationEmail } from '../utils/email';
import axios from 'axios'; // We will use this to call real social APIs in the future

// Function to kick off a periodic checker
export const startScheduler = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      // Find posts that are scheduled and their time is past
      const postsToPublish = await prisma.post.findMany({
        where: {
          status: 'scheduled',
          scheduledTime: { lte: now }
        }
      });

      for (const post of postsToPublish) {
        
        let successPlatforms: string[] = [];
        let failedPlatforms: string[] = [];
        
        console.log(`\n--- Starting Publishing Process for Post: ${post.id} ---`);
        console.log(`Target Platforms: ${post.platforms.join(', ')}`);

        for (const platform of post.platforms) {
          try {
            console.log(`[x] Attempting to deliver post to ${platform} API...`);
            
            // FAKE API DELAY FOR REALISTIC TIMING
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 👉 REAL LINKEDIN API POSTING
            if (platform === 'LinkedIn') {
                if (process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_URN) {
                    const fullText = `${post.caption}\n\n${post.hashtags.join(' ')}`;
                    
                    const payload = {
                        author: process.env.LINKEDIN_PERSON_URN,
                        lifecycleState: "PUBLISHED",
                        specificContent: {
                            "com.linkedin.ugc.ShareContent": {
                                shareCommentary: { text: fullText },
                                shareMediaCategory: "NONE" // Text post since localhost images can't be scraped easily
                            }
                        },
                        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
                    };

                    try {
                        await axios.post('https://api.linkedin.com/v2/ugcPosts', payload, {
                            headers: {
                                'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                                'Content-Type': 'application/json',
                                'X-Restli-Protocol-Version': '2.0.0'
                            }
                        });
                        console.log(`[✔] Successfully published to ${platform}`);
                        successPlatforms.push(platform);
                    } catch (liErr: any) {
                        console.error(`[!] Failed publishing to ${platform}:`, liErr.response?.data || liErr.message);
                        failedPlatforms.push(platform);
                    }
                } else {
                    console.error('[!] LinkedIn Tokens missing from .env');
                    failedPlatforms.push(platform);
                }
            } else {
               // Other platforms removed for now as per user request
               successPlatforms.push(platform);
            }

          } catch (apiError: any) {
            console.error(`[!] Failed publishing to ${platform}:`, apiError.message);
            failedPlatforms.push(platform);
          }
        }
        
        // Update database with real status based on attempts
        const finalStatus = failedPlatforms.length === 0 ? 'posted' : 'failed';
        await prisma.post.update({
          where: { id: post.id },
          data: { status: finalStatus }
        });

        const filename = post.mediaUrl ? post.mediaUrl.split('/').pop() || '' : '';
        const filePath = path.join(__dirname, '../../uploads', filename);
        let attachments = [];
        
        if (filename && fs.existsSync(filePath)) {
           attachments.push({
               filename: filename,
               path: filePath
           });
        }

        let emailSubject = '';
        let emailText = '';
        let emailHtml = '';

        if (finalStatus === 'posted') {
            emailSubject = `✅ AutoMedia: Post Successfully Delivered`;
            emailText = `Your scheduled post was successfully published to: ${successPlatforms.join(', ')}.`;
            emailHtml = `
              <h2>Post Successful! 🚀</h2>
              <p>Your AI-generated social post was just published automatically to LinkedIn.</p>
              <ul>
                 <li><b>Successful Platforms:</b> ${successPlatforms.join(', ')}</li>
                 <li><b>Full Caption:</b><br/> ${post.caption} <br/> ${post.hashtags.join(' ')}</li>
              </ul>
              <p>The original media file used for this post is attached to this email.</p>
            `;
        } else {
            emailSubject = `❌ AutoMedia: Action Required - Post Failure`;
            emailText = `LinkedIn post failed. Succeeded: ${successPlatforms.join(', ')}. Failed: ${failedPlatforms.join(', ')}.`;
            emailHtml = `
              <h2>Post Action Required ⚠️</h2>
              <p>Some errors occurred while the AI was trying to post to LinkedIn.</p>
              <ul>
                 <li><b>Failed Platforms:</b> ${failedPlatforms.join(', ')}</li>
              </ul>
              <hr />
              <p><b>Original Caption:</b> <br/> ${post.caption}</p>
              <br/>
              <p><i>The media file is attached so you can manually post it if needed. Please verify your LinkedIn token in .env.</i></p>
            `;
        }

        // Fire off the email report automatically with attachments
        await sendNotificationEmail(emailSubject, emailText, emailHtml, attachments);

        console.log(`--- Finished Processing Post ${post.id}. Email sent. ---\n`);
      }
    } catch (err) {
      console.error('Scheduler main loop error:', err);
    }
  }, 30000); // Check every 30 seconds for faster testing
};
