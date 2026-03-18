import express, { Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';

const router = express.Router();

router.get('/linkedin', (req: any, res: Response) => {
  const { LINKEDIN_CLIENT_ID, LINKEDIN_REDIRECT_URI } = process.env;
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    return res.status(400).send('LinkedIn Client ID or Redirect URI is missing in .env');
  }

  // Define scopes needed for reading profile (to get URN) and posting organically
  const scope = 'r_liteprofile w_member_social'; // or 'w_organization_social' for company pages if requested

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${querystring.stringify({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state: 'haxxcel_auth_state_123', // random string
    scope: scope
  })}`;
  
  // Redirect user to the LinkedIn consent screen
  res.redirect(authUrl);
});

router.get('/linkedin/callback', async (req: any, res: Response): Promise<any> => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`Authentication failed: ${error_description}`);
  }

  if (!code) {
    return res.status(400).send('No authorization code provided');
  }

  try {
    const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI } = process.env;

    // 1. Exchange the auth code for an Access Token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', querystring.stringify({
      grant_type: 'authorization_code',
      code: code as string,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: LINKEDIN_REDIRECT_URI
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in;

    // 2. Fetch the User's LinkedIn ID (URN) needed to create posts
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
       headers: { Authorization: `Bearer ${accessToken}` }
    });
    const urn = `urn:li:person:${profileResponse.data.id}`;

    // 3. Output the tokens back to the user to save in their .env
    const htmlResponse = `
        <div style="font-family: Arial; padding: 2rem; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 8px;">
            <h2 style="color: #6366f1;">LinkedIn Connected Successfully!</h2>
            <p>Your authentication worked. Please copy the values below and paste them into your <b>backend/.env</b> file, then restart the server:</p>
            
            <div style="background: #222; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                <label style="color: #aaa; font-size: 0.8rem;">LINKEDIN_ACCESS_TOKEN=</label>
                <div style="word-break: break-all; margin-top: 0.5rem; color: #4ade80;">${accessToken}</div>
            </div>

            <div style="background: #222; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                <label style="color: #aaa; font-size: 0.8rem;">LINKEDIN_PERSON_URN=</label>
                <div style="word-break: break-all; margin-top: 0.5rem; color: #4ade80;">${urn}</div>
            </div>

            <p style="color: #aaa; font-size: 0.85rem;">Token expires in: ${Math.round(expiresIn / 86400)} days</p>
        </div>
    `;

    res.send(htmlResponse);
  } catch (err: any) {
    console.error('LinkedIn Auth Error:', err.response?.data || err.message);
    res.status(500).send('Failed to exchange code for token. Check backend console for details.');
  }
});

export default router;
