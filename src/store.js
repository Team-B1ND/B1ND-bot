import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const STORE_PATH = fileURLToPath(new URL('../data/issue-map.json', import.meta.url));

function load() {
  if (!existsSync(STORE_PATH)) return {};
  return JSON.parse(readFileSync(STORE_PATH, 'utf-8'));
}

function save(map) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(map, null, 2));
}

function key(owner, repo, issueNumber) {
  return `${owner}/${repo}#${issueNumber}`;
}

export function setThreadForIssue(owner, repo, issueNumber, threadId) {
  const map = load();
  map[key(owner, repo, issueNumber)] = threadId;
  save(map);
}

export function getThreadForIssue(owner, repo, issueNumber) {
  const map = load();
  return map[key(owner, repo, issueNumber)] ?? null;
}
