#!/bin/bash
# Claude Code 권한 요청 시 Slack 알림
# Hook: PermissionRequest

# 프로젝트 .env.local에서 SLACK_WEBHOOK_URL 로드
if [ -f "${CLAUDE_PROJECT_DIR}/.env.local" ]; then
  SLACK_WEBHOOK_URL=$(grep -E '^SLACK_WEBHOOK_URL=' "${CLAUDE_PROJECT_DIR}/.env.local" | head -1 | cut -d '=' -f2-)
fi

[ -z "$SLACK_WEBHOOK_URL" ] && exit 0

# stdin을 node로 직접 파이프하여 Slack 메시지 전송
WEBHOOK="$SLACK_WEBHOOK_URL" node -e "
const https = require('https');
const url = require('url');
const WEBHOOK_URL = process.env.WEBHOOK;
let raw = '';
process.stdin.on('data', c => raw += c);
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(raw); } catch (_) {}
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const tool = data.tool_name || '알 수 없음';
  const input = data.tool_input;
  const detail = input ? (input.command || JSON.stringify(input)).slice(0, 200) : '';
  const msg = '\`' + tool + '\` 실행 승인이 필요합니다.' + (detail ? '\n\`\`\`\n' + detail + '\n\`\`\`' : '');
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: '🔔 Claude Code 권한 요청', emoji: true } },
    { type: 'section', fields: [{ type: 'mrkdwn', text: '*상태:*\n🟡 승인 대기 중' }] },
    { type: 'section', text: { type: 'mrkdwn', text: msg } },
    { type: 'context', elements: [{ type: 'plain_text', text: now }] }
  ];
  const payload = JSON.stringify({ blocks });
  const parsed = url.parse(WEBHOOK_URL);
  const req = https.request({ hostname: parsed.hostname, path: parsed.path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, res => res.resume());
  req.on('error', () => {});
  req.write(payload);
  req.end();
});
"
