export const TYPE_META = {
  bug: { issueLabel: 'type: bug', titlePrefix: '[Bug] ', requiredItems: 4 },
  feature: { issueLabel: 'type: feature', titlePrefix: '[Feature] ', requiredItems: 3 },
  enhancement: { issueLabel: 'type: enhancement', titlePrefix: '[Enhancement] ', requiredItems: 2 },
};

export function validateContent(content, requiredItems) {
  if (!content) return false;
  const numberedLines = content.match(/^\s*\d+[.)]/gm) ?? [];
  return numberedLines.length >= requiredItems;
}

export function buildIssueBody({ platform, content, attachmentUrls = [], author, threadUrl }) {
  const lines = [`### 대상 플랫폼\n${platform}`, `### 내용\n${content || '(본문 없음)'}`];
  if (attachmentUrls.length > 0) {
    lines.push(`### 첨부\n${attachmentUrls.map((url) => `![image](${url})`).join('\n')}`);
  }
  lines.push(`---\n디스코드 포럼에서 ${author}님이 등록한 문의입니다.\n${threadUrl}`);
  return lines.join('\n\n');
}
