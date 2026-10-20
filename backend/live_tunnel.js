/**
 * MedVantage India — Persistent Cloudflare HTTPS Tunnel Daemon (`backend/live_tunnel.js`)
 * Uses Cloudflare Quick Tunnel (`cloudflared.exe tunnel --url http://127.0.0.1:3456`)
 * so the `https://*.trycloudflare.com` URL stays stable without rotating every 10 minutes.
 */

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3456;
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const TUNNEL_FILE = path.join(DATA_DIR, 'live_tunnel_url.json');
const CLOUDFLARED_BIN = path.join(__dirname, 'cloudflared.exe');

function saveTunnelUrl(url) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    TUNNEL_FILE,
    JSON.stringify({ public_url: url, provider: 'cloudflare', updated_at: new Date().toISOString() }, null, 2),
    'utf-8'
  );
  console.log(`[MedVantage LiveTunnel] Active Cloudflare Public HTTPS URL: ${url}`);
}

function startTunnel() {
  const useCloudflared = fs.existsSync(CLOUDFLARED_BIN);
  const cmd = useCloudflared ? CLOUDFLARED_BIN : 'ssh';
  const args = useCloudflared
    ? ['tunnel', '--url', `http://127.0.0.1:${PORT}`, '--no-autoupdate']
    : [
        '-o',
        'StrictHostKeyChecking=no',
        '-o',
        'ServerAliveInterval=20',
        '-o',
        'ExitOnForwardFailure=yes',
        '-R',
        `80:127.0.0.1:${PORT}`,
        'nokey@localhost.run',
      ];

  const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  const onChunk = (chunk) => {
    const text = String(chunk);
    const cfMatch = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    const lhrMatch = text.match(/https:\/\/[a-z0-9-]+\.lhr\.life/i);
    if (cfMatch) {
      saveTunnelUrl(cfMatch[0]);
    } else if (lhrMatch) {
      saveTunnelUrl(lhrMatch[0]);
    }
  };

  proc.stdout.on('data', onChunk);
  proc.stderr.on('data', onChunk);

  proc.on('close', () => {
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
