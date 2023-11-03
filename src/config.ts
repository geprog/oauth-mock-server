import { cwd } from 'node:process';

import fs from 'fs';
import path from 'path';

export type ConfigUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  description?: string;
};

export type Config = {
  port: number;
  realm: string;
  users: ConfigUser[];
  tokenExpiresIn: number;
};

export function getConfig(): Config {
  const defaultConfig = <Config>{
    port: 5000,
    realm: process.env.REALM || 'my-project',
    users: [
      {
        id: '1',
        username: 'toni',
        email: 'toni@test.com',
        name: 'Toni Tester',
      },
      {
        id: '2',
        username: 'alice',
        email: 'alice@wonderland.org',
        name: 'Alice Wonderland',
      },
      {
        id: '3',
        username: 'herbert',
        email: 'her@bert.de',
        name: 'Herbert',
        description: 'This is our good old friend Herbert',
      },
    ],
    tokenExpiresIn: 24 * 60 * 60, // 24 hours in seconds
  };

  const configPath = path.join(cwd(), 'oauth-mock-server.json');
  if (!fs.existsSync(configPath)) {
    return defaultConfig;
  }

  const rawConfig = fs.readFileSync(configPath);
  const config = <Config>{};
  Object.assign(config, defaultConfig, JSON.parse(rawConfig.toString()));
  return config;
}
