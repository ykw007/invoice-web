#!/bin/bash
# Claude Code 작업 완료 시 Slack 알림
# Hook: Stop

# 프로젝트 .env.local에서 SLACK_WEBHOOK_URL 로드
if [ -f "${CLAUDE_PROJECT_DIR}/.env.local" ]; then
  SLACK_WEBHOOK_URL=$(grep -E '^SLACK_WEBHOOK_URL=' "${CLAUDE_PROJECT_DIR}/.env.local" | head -1 | cut -d '=' -f2-)
fi

[ -z "$SLACK_WEBHOOK_URL" ] && exit 0

# stdin 읽기 (stop_hook_active 확인 필요)
INPUT=$(cat)

# 무한 루프 방지: Stop 훅이 또 다른 Stop을 유발하지 않도록
if echo "$INPUT" | grep -q '"stop_hook_active":true'; then
  exit 0
fi

# stdin이 이미 소비되었으므로 환경변수로 node에 전달
WEBHOOK="$SLACK_WEBHOOK_URL" INPUT_DATA="$INPUT" node -e "
const https = require('https');
const url = require('url');
const WEBHOOK_URL = process.env.WEBHOOK;
let data = {};
try { data = JSON.parse(process.env.INPUT_DATA || '{}'); } catch (_) {}
const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
const lastMsg = (data.last_assistant_message || '').slice(0, 100);
const summary = lastMsg ? lastMsg + (data.last_assistant_message.length > 100 ? '...' : '') : '내용 없음';
const blocks = [
  { type: 'header', text: { type: 'plain_text', text: '✅ Claude Code 작업 완료', emoji: true } },
  { type: 'section', fields: [
    { type: 'mrkdwn', text: '*상태:*\n🟢 정상 완료' },
    { type: 'mrkdwn', text: '*마지막 작업:*\n' + summary }
  ]},
  { type: 'context', elements: [{ type: 'plain_text', text: now }] }
];
const payload = JSON.stringify({ blocks });
const parsed = url.parse(WEBHOOK_URL);
const req = https.request({ hostname: parsed.hostname, path: parsed.path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, res => res.resume());
req.on('error', () => {});
req.write(payload);
req.end();
"
