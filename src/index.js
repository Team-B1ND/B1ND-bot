import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { Octokit } from 'octokit';
import { TYPE_META, buildIssueBody, validateContent } from './templates.js';

const { DISCORD_TOKEN, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

const TYPE_BY_CHANNEL = {
  [process.env.FORUM_CHANNEL_BUG]: 'bug',
  [process.env.FORUM_CHANNEL_FEATURE]: 'feature',
  [process.env.FORUM_CHANNEL_ENHANCEMENT]: 'enhancement',
};

const REPO_BY_PLATFORM = {
  Web: process.env.GITHUB_REPO_WEB,
  App: process.env.GITHUB_REPO_APP,
  Server: process.env.GITHUB_REPO_SERVER,
};

function resolveRepo(platform) {
  if (platform in REPO_BY_PLATFORM) {
    const repo = REPO_BY_PLATFORM[platform];
    if (!repo) {
      throw new Error(`.env에 ${platform} 플랫폼용 레포가 설정되지 않았습니다.`);
    }
    return repo;
  }
  return GITHUB_REPO;
}

function resolvePlatform(thread) {
  const tag = thread.parent.availableTags.find((t) => thread.appliedTags.includes(t.id));
  return tag?.name ?? '기타';
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

async function findIssueRef(thread) {
  const messages = await thread.messages.fetch({ limit: 50 });
  const botMessage = messages.find((m) => m.author.id === client.user.id && /이슈가 등록되었습니다: /.test(m.content));
  const match = botMessage?.content.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) return null;
  const [, owner, repo, number] = match;
  return { owner, repo, issue_number: Number(number) };
}

client.on('messageUpdate', async (oldMessage, newMessage) => {
  const thread = newMessage.channel;
  if (!thread?.isThread?.()) return;
  if (newMessage.id !== thread.id) return;

  const type = TYPE_BY_CHANNEL[thread.parentId];
  if (!type) return;

  try {
    const issueRef = await findIssueRef(thread);

    if (!issueRef) {
      if (!validateContent(newMessage.content)) return;

      const platform = resolvePlatform(thread);
      const repo = resolveRepo(platform);
      const meta = TYPE_META[type];

      const { data: issue } = await octokit.rest.issues.create({
        owner: GITHUB_OWNER,
        repo,
        title: `${meta.titlePrefix}${thread.name}`,
        body: buildIssueBody({
          platform,
          content: newMessage.content,
          attachmentUrls: newMessage.attachments.map((a) => a.url),
          author: newMessage.author?.tag ?? '알 수 없음',
          threadUrl: thread.url,
        }),
        labels: [meta.issueLabel],
      });

      await thread.send(`이슈가 등록되었습니다: ${issue.html_url}`);
      return;
    }

    const platform = resolvePlatform(thread);
    const meta = TYPE_META[type];

    await octokit.rest.issues.update({
      ...issueRef,
      title: `${meta.titlePrefix}${thread.name}`,
      body: buildIssueBody({
        platform,
        content: newMessage.content,
        attachmentUrls: newMessage.attachments.map((a) => a.url),
        author: newMessage.author?.tag ?? '알 수 없음',
        threadUrl: thread.url,
      }),
    });
  } catch (error) {
    console.error('Failed to update GitHub issue from forum thread edit:', error);
    await thread.send('이슈 수정에 실패했습니다. 운영자에게 문의해주세요.');
  }
});

client.on('threadCreate', async (thread, newlyCreated) => {
  if (!newlyCreated) return;

  const type = TYPE_BY_CHANNEL[thread.parentId];
  if (!type) return;

  try {
    const starterMessage = await thread.fetchStarterMessage();

    if (!validateContent(starterMessage?.content)) {
      await thread.send(
        '게시글이 가이드라인 형식을 따르지 않아 이슈가 등록되지 않았습니다.\n' +
          '"1. 현재 어떻게 동작하고 있는지", "2. 어떻게 개선하면 좋을지"를 포함해 게시글을 수정해주세요.',
      );
      return;
    }

    const platform = resolvePlatform(thread);
    const repo = resolveRepo(platform);
    const meta = TYPE_META[type];

    const { data: issue } = await octokit.rest.issues.create({
      owner: GITHUB_OWNER,
      repo,
      title: `${meta.titlePrefix}${thread.name}`,
      body: buildIssueBody({
        platform,
        content: starterMessage?.content,
        attachmentUrls: starterMessage?.attachments.map((a) => a.url) ?? [],
        author: starterMessage?.author?.tag ?? '알 수 없음',
        threadUrl: thread.url,
      }),
      labels: [meta.issueLabel],
    });

    await thread.send(`이슈가 등록되었습니다: ${issue.html_url}`);
  } catch (error) {
    console.error('Failed to create GitHub issue from forum thread:', error);
    await thread.send('이슈 등록에 실패했습니다. 운영자에게 문의해주세요.');
  }
});

client.login(DISCORD_TOKEN);
