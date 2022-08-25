import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from 'utils/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const code = req.query.access_code as string;
  try {
    const response = await axios.post(
      `http://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
    );
    console.log('RESPONSE', response);

    res.status(200).json(response);
  } catch (err) {
    console.log('github err', err);
    res.status(500).json({ error: 'BAD' });
  }
}
