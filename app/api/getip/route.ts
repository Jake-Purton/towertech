import { NextResponse } from 'next/server';
import { networkInterfaces } from 'os';

export async function GET() {
  try {
    const nets = networkInterfaces();
    let ipAddress = '';

    // Look for the local network IP address
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          ipAddress = net.address;
          break;
        }
      }
      if (ipAddress) break;
    }

    return NextResponse.json({ ip: ipAddress });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get IP address' },
      { status: 500 }
    );
  }
}