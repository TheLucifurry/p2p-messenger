const path = require('path');
const fastify = require('fastify');
const fastifyWebsocket = require('fastify-websocket');
const fastifyStatic = require('fastify-static');
const signalingServer = require('./services/signaling');
const config = require('./config');
const createAPI = require('./api');

const app = fastify({
  logger: config.DEV_MODE ? {
    prettyPrint: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
  } : false,
});

const staticFilesPath = path.join(__dirname, '../../', config.STATIC_FILES_DIR);
app.register(fastifyStatic, {
  root: staticFilesPath,
})


app.register(createAPI, { prefix: '/api/' })

app
  .register(fastifyWebsocket, {
    options: {
      maxPayload: 1024,
    }
  })
  .register(signalingServer, { prefix: '/signaling/' });

app.listen(config.PORT, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
