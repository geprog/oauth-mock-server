# oauth-mock-server

> :rotating_light: IMPORTANT: This tool should ONLY be used for development and testing setups!

A mocked oauth server for development and e2e testing.

## Config

You can adjust the default configuration by placing a file `oauth-mock-server.json` in your current working directory:

```json
{
  "port": 5000,
  "realm": "my-project",
  "users": [
    {
      "id": "1",
      "username": "toni",
      "email": "toni@test.com",
      "name": "Toni Tester"
    },
    {
      "id": "2",
      "username": "alice",
      "email": "alice@wonderland.org",
      "name": "Alice Wonderland"
    },
    {
      "id": "3",
      "username": "herbert",
      "email": "her@bert.de",
      "name": "Herbert"
    }
  ],
  "tokenExpiresIn": 86400, // 24 hours in seconds
}
```
