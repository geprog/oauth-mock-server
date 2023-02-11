import fastifyFormBody from '@fastify/formbody';
import { getConfig } from 'config';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';

const config = getConfig();

const server = fastify();
void server.register(fastifyFormBody);

const jwtSecret = 'mySuperDuperSecret';

const randomString = () => (Math.random() + 1).toString(36).substring(7);

let sessions: { code: string; user_id: string; access_token?: string }[] = [];

server.get(`/auth/realms/${config.realm}/protocol/openid-connect/auth`, async (request, reply) => {
  const query = request.query as { redirect_uri: string; error?: string };

  const template = `
    <html>
      <head>
        <title>Login</title>
        <style>
          * {
            margin: 0;
            padding: 0;
          }

          body {
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            justify-content: center;
          }

          form {
            display: flex;
            flex-direction: column;
          }

          input {
            padding: .5rem;
            border-radius: .25rem;
          }
        </style>
      </head>
      <body>
        ${query.error ? '<p style="color: red">' + query.error + '</p>' : ''}
        <form action="/do-login" method="post">
          <input type="hidden" name="redirect_uri" value="${query.redirect_uri}" />
          <br />
          <input type="text" placeholder="Username" name="username" />
          <br />
          <input type="password" placeholder="Password (ignored)" name="password" />
          <br />
          <input type="submit" value="Login">
        </form>

        <div>
          <p>Please login with one of the following usernames:</p>
          <ul>
            ${config.users
              .map(
                (user) =>
                  `<li>
                    <a href="/do-login?username=${user.username}&redirect_uri=${query.redirect_uri}">${user.name}</a>
                  </li>`,
              )
              .join('')}
          </ul>
        </div>
      </body>
    </html>
  `;

  await reply.header('Content-Type', 'text/html').send(template);
});

server.all('/do-login', async (request, reply) => {
  const query = (request.body || request.query) as { username: string; redirect_uri: string };
  const user =
    config.users.find((u) => u.username === query.username) || config.users.find((u) => u.email === query.username);
  const redirect_uri = query.redirect_uri;

  if (!user) {
    await reply.redirect(
      `/auth/realms/${config.realm}/protocol/openid-connect/auth?error=invalid_credentials&redirect_uri=${redirect_uri}`,
    );
    return;
  }

  const sessionState = 'session-state-123'; // TODO ?
  const code = `code-${randomString()}`;
  sessions.push({ code, user_id: user.id });
  await reply.redirect(`${redirect_uri}?session_state=${sessionState}&code=${code}`);
});

server.post(`/auth/realms/${config.realm}/protocol/openid-connect/token`, async (request, reply) => {
  const body = request.body as {
    grant_type: string;
    code: string;
    redirect_uri: string;
    client_id: string;
    client_secret: string;
  };

  const session = sessions.find((s) => s.code === body.code);
  if (!session) {
    await reply.send(new Error('Invalid code')).code(403);
    return;
  }

  sessions = sessions.filter((s) => s.code !== body.code);

  const payload = {
    sub: session.user_id, // TODO check if valid (seems to work somehow)
    typ: 'Bearer',
    aud: config.realm,
  };

  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: config.tokenExpiresIn });

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    id_token: accessToken,
    expires_in: config.tokenExpiresIn,
  };
});

server.get(`/auth/realms/${config.realm}/protocol/openid-connect/userinfo`, (request) => {
  const headers = request.headers as { authorization: string };
  const access_token = headers.authorization.replace('Bearer ', '');
  const payload = jwt.verify(access_token, jwtSecret) as { sub: string };
  const userId = payload.sub;
  return config.users.find((s) => s.id === userId);
});

server.get(`/auth/realms/${config.realm}/protocol/openid-connect/logout`, async (request, reply) => {
  const query = request.query as { redirect_uri: string };
  await reply.redirect(query.redirect_uri);
});

async function start() {
  try {
    // eslint-disable-next-line no-console
    console.log(`Starting server http://localhost:${config.port} ...`);
    await server.listen({ port: config.port, host: '::' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

void start();
