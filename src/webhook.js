import { createHmac, timingSafeEqual } from 'crypto';
import express from 'express';
import { getThreadForIssue } from './store.js';

const { GITHUB_WEBHOOK_SECRET, WEBHOOK_PORT = 3000 } = process.env;

function verifySignature(req) {
  const signature = req.get('X-Hub-Signature-256');
  if (!signature) return false;

  const expected = `sha256=${createHmac('sha256', GITHUB_WEBHOOK_SECRET).update(req.rawBody).digest('hex')}`;
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
}

export function startWebhookServer(client) {
  const app = express();
  app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

  app.post('/github/webhook', async (req, res) => {
    if (!verifySignature(req)) {
      res.status(401).send('invalid signature');
      return;
    }

    res.status(200).send('ok');

    const { action, issue, repository } = req.body;
    if (action !== 'closed' || !issue || !repository) return;

    const threadId = getThreadForIssue(repository.owner.login, repository.name, issue.number);
    if (!threadId) return;

    try {
      const thread = await client.channels.fetch(threadId);
      await thread.send(`해결되었습니다: ${issue.html_url}`);
    } catch (error) {
      console.error('Failed to notify thread of issue close:', error);
    }
  });

  app.listen(WEBHOOK_PORT, () => {
    console.log(`GitHub webhook server listening on port ${WEBHOOK_PORT}`);
  });
}
