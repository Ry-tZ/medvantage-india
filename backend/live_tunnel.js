/**
 * MedVantage India — Self-Healing Public HTTPS Tunnel Daemon (`backend/live_tunnel.js`)
 * Uses Cloudflare Quick Tunnel (`cloudflared.exe tunnel --url http://127.0.0.1:3456 --protocol http2`)
 * and runs a 30-second health-check probe against the public URL, automatically restarting if unreachable.
 */

'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 3456;
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const TUNNEL_FILE = path.join(DATA_DIR, 'live_tunnel_url.json');
const CLOUDFLARED_BIN = path.join(__dirname, 'cloudflared.exe');

let activeUrl = null;
let currentProc = null;

function saveTunnelUrl(url, provider) {
  activeUrl = url;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    TUNNEL_FILE,
    JSON.stringify({ public_url: url, provider, updated_at: new Date().toISOString() }, null, 2),
    'utf-8'
  );
  console.log(`[MedVantage LiveTunnel] Active Public HTTPS URL (${provider}): ${url}`);
}

function startTunnel() {
  const useCloudflared = fs.existsSync(CLOUDFLARED_BIN);
  const cmd = useCloudflared ? CLOUDFLARED_BIN : 'ssh';
  const args = useCloudflared
    ? ['tunnel', '--url', `http://127.0.0.1:${PORT}`, '--protocol', 'http2', '--no-autoupdate']
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
  currentProc = proc;

  const onChunk = (chunk) => {
    const text = String(chunk);
    const cfMatch = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    const lhrMatch = text.match(/https:\/\/[a-z0-9-]+\.lhr\.life/i);
    if (cfMatch) {
      saveTunnelUrl(cfMatch[0], 'cloudflare');
    } else if (lhrMatch) {
      saveTunnelUrl(lhrMatch[0], 'localhost.run');
    }
  };

  proc.stdout.on('data', onChunk);
  proc.stderr.on('data', onChunk);

  proc.on('close', () => {
    if (currentProc === proc) {
      setTimeout(startTunnel, 2500);
    }
  });
}

// Health check every 45s to ensure the tunnel URL responds 200 OK
setInterval(() => {
  if (!activeUrl || !currentProc) return;
  try {
    const u = new URL(`${activeUrl}/api/bootstrap`);
    const req = https.get(
      {
        hostname: u.hostname,
        path: u.pathname,
        timeout: 6000,
      },
      (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 500) {
          try {
            currentProc.kill();
          } catch (_) {}
        }
      }
    );
    req.on('error', () => {});
    req.on('timeout', () => {
      req.destroy();
    });
  } catch (_) {}
}, 45000);

startTunnel();
