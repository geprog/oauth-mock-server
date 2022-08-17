import fs from 'fs';
import { cwd } from 'node:process';
import path from 'path';

interface RealmUsers {
  realm: string;
  users: [{ id: string; username: string; email: string; name: string }];
}

export function getConfig(): RealmUsers {
  const defaultConfig = {
    realm: 'my-project',
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
      },
    ],
  };

  const configPath = path.join(cwd, 'oauth-mock-server.json');
  if (!fs.existsSync(configPath)) {
    return defaultConfig;
  }

  const rawConfig = fs.readFileSync('/.oauth-mock-server.json');
  const config = {};
  Object.assign(config, defaultConfig, JSON.parse(rawConfig));
  return config;
}
