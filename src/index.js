import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { Octokit } from 'octokit';
import { TEMPLATES, buildIssueBody } from './templates.js';

const { DISCORD_TOKEN, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

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

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const pendingInquiries = new Map();

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === '문의') {
    await handleInquiryCommand(interaction);
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('inquiry-modal:')) {
    await handleModalSubmit(interaction);
  }
});

async function handleInquiryCommand(interaction) {
  const type = interaction.options.getString('유형');
  const platform = interaction.options.getString('플랫폼');
  const category = interaction.options.getString('개선분야');
  const template = TEMPLATES[type];

  const modalId = `inquiry-modal:${interaction.id}`;
  pendingInquiries.set(modalId, { type, platform, category });
  setTimeout(() => pendingInquiries.delete(modalId), 15 * 60 * 1000);

  const modal = new ModalBuilder().setCustomId(modalId).setTitle(template.label);

  const rows = template.fields.map((field) =>
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(field.id)
        .setLabel(field.label)
        .setStyle(field.style === 'PARAGRAPH' ? TextInputStyle.Paragraph : TextInputStyle.Short)
        .setRequired(field.required)
        .setMaxLength(4000),
    ),
  );
  modal.addComponents(...rows);

  await interaction.showModal(modal);
}

async function handleModalSubmit(interaction) {
  const pending = pendingInquiries.get(interaction.customId);
  pendingInquiries.delete(interaction.customId);

  if (!pending) {
    await interaction.reply({
      content: '문의 정보가 만료되었습니다. `/문의` 명령어를 다시 실행해주세요.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const { type, platform, category } = pending;
  const template = TEMPLATES[type];

  const fields = {};
  for (const field of template.fields) {
    fields[field.id] = interaction.fields.getTextInputValue(field.id);
  }

  const title = `${template.titlePrefix}${fields[template.fields[0].id].slice(0, 80)}`;
  const body = buildIssueBody({
    template,
    platform,
    category,
    fields,
    author: interaction.user.tag,
  });

  try {
    const { data: issue } = await octokit.rest.issues.create({
      owner: GITHUB_OWNER,
      repo: resolveRepo(platform),
      title,
      body,
      labels: [template.issueLabel],
    });

    await interaction.editReply(`이슈가 등록되었습니다: ${issue.html_url}`);
  } catch (error) {
    console.error('Failed to create GitHub issue:', error);
    await interaction.editReply('이슈 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

client.login(DISCORD_TOKEN);
