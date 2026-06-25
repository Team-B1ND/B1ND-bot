import { SlashCommandBuilder } from 'discord.js';

export const inquiryCommand = new SlashCommandBuilder()
  .setName('문의')
  .setDescription('버그/기능제안/개선 문의를 GitHub 이슈로 등록합니다.')
  .addStringOption((option) =>
    option
      .setName('유형')
      .setDescription('문의 유형을 선택하세요')
      .setRequired(true)
      .addChoices(
        { name: '버그 리포트', value: 'bug' },
        { name: '기능 제안', value: 'feature' },
        { name: '개선 제안', value: 'enhancement' },
      ),
  )
  .addStringOption((option) =>
    option
      .setName('플랫폼')
      .setDescription('대상/발생 플랫폼을 선택하세요')
      .setRequired(true)
      .addChoices(
        { name: 'Web', value: 'Web' },
        { name: 'App', value: 'App' },
        { name: 'Server', value: 'Server' },
        { name: '전체 플랫폼', value: '전체 플랫폼' },
        { name: '기타', value: '기타' },
      ),
  )
  .addStringOption((option) =>
    option
      .setName('개선분야')
      .setDescription('개선 제안일 때만: 어떤 분야의 개선인지 선택하세요')
      .setRequired(false)
      .addChoices(
        { name: 'UI/UX', value: 'UI/UX' },
        { name: '성능', value: '성능' },
        { name: '접근성', value: '접근성' },
        { name: '보안', value: '보안' },
        { name: '코드 품질', value: '코드 품질' },
        { name: '문서', value: '문서' },
        { name: '기타', value: '기타' },
      ),
  );
