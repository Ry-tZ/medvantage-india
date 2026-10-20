/**
 * MedVantage India — Auto-Reconnecting Public HTTPS Tunnel Daemon (`backend/live_tunnel.js`)
 * Keeps an active public HTTPS tunnel (`https://*.lhr.life`) forwarding to `127.0.0.1:3456`
 * and writes the latest active public URL to `data/live_tunnel_url.json`.
 */

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3456;
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const TUNNEL_FILE = path.join(DATA_DIR, 'live_tunnel_url.json');

function saveTunnelUrl(url) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    TUNNEL_FILE,
    JSON.stringify({ public_url: url, updated_at: new Date().toISOString() }, null, 2),
    'utf-8'
  );
  console.log(`[MedVantage LiveTunnel] Active Public HTTPS URL: ${url}`);
}

function startTunnel() {
  const proc = spawn(
    'ssh',
    [
      '-o',
      'StrictHostKeyChecking=no',
      '-o',
      'ServerAliveInterval=20',
      '-o',
      'ExitOnForwardFailure=yes',
      '-R',
      `80:127.0.0.1:${PORT}`,
      'nokey@localhost.run',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const onChunk = (chunk) => {
    const text = String(chunk);
    const match = text.match(/https:\/\/[a-z0-9-]+\.lhr\.life/i);
    if (match) {
      saveTunnelUrl(match[0]);
    }
  };

  proc.stdout.on('data', onChunk);
  proc.stderr.on('data', onChunk);

  proc.on('close', () => {
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
