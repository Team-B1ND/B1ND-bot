export const TEMPLATES = {
  bug: {
    label: '버그 리포트',
    issueLabel: 'type: bug',
    titlePrefix: '[Bug] ',
    fields: [
      { id: 'description', label: '버그 설명', style: 'PARAGRAPH', required: true },
      { id: 'steps', label: '재현 방법', style: 'PARAGRAPH', required: true },
      { id: 'expected', label: '예상 동작', style: 'PARAGRAPH', required: true },
      { id: 'actual', label: '실제 동작', style: 'PARAGRAPH', required: true },
    ],
  },
  feature: {
    label: '기능 제안',
    issueLabel: 'type: feature',
    titlePrefix: '[Feature] ',
    fields: [
      { id: 'feature-description', label: '기능 설명', style: 'PARAGRAPH', required: true },
      { id: 'problem', label: '해결하고자 하는 문제', style: 'PARAGRAPH', required: true },
      { id: 'solution', label: '제안하는 해결 방법', style: 'PARAGRAPH', required: true },
      { id: 'alternatives', label: '대안 (선택)', style: 'PARAGRAPH', required: false },
    ],
  },
  enhancement: {
    label: '개선 제안',
    issueLabel: 'type: enhancement',
    titlePrefix: '[Enhancement] ',
    fields: [
      { id: 'current', label: '현재 상황', style: 'PARAGRAPH', required: true },
      { id: 'improvement', label: '개선 제안', style: 'PARAGRAPH', required: true },
      { id: 'benefit', label: '기대 효과 (선택)', style: 'PARAGRAPH', required: false },
    ],
  },
};

export function buildIssueBody({ template, platform, category, fields, author }) {
  const lines = [];
  lines.push(`### 대상 플랫폼\n${platform}`);
  if (category) lines.push(`### 개선 분야\n${category}`);

  for (const field of template.fields) {
    const value = fields[field.id]?.trim();
    if (!value) continue;
    lines.push(`### ${field.label.replace(' (선택)', '')}\n${value}`);
  }

  lines.push(`---\n디스코드에서 ${author}님이 등록한 문의입니다.`);
  return lines.join('\n\n');
}
