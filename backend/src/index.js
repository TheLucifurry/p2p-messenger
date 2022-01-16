const path = require('path');
const http = require("http");
const Config = require('../config.json');
const createStaticServer = require('./services/static');

const staticServer = createStaticServer(path.resolve(Config.STATIC_FILES_DIR), {
  cache: 3600 * 6,
  gzip: true,
});
console.log('staticServer:');
console.table(staticServer);

const routes = Object.entries({
  '/api/': function (request, response) {
    // response.write("It's API!");
    response.end('It\'s API!');
  },
  '/': async function (request, response) {
    return new Promise((res) => {
      staticServer.serve(request, response, function (err, result) {
        if (err) {
          console.error("Error serving " + request.url + " - " + err.message);
          response.end('No such file');
        }
        res();
      });
    });
  },
});

http
  .createServer(async function (request, response) {
    for await (const [route, controller] of routes) {
      if (request.url.startsWith(route)) {
        await controller(request, response);
        // response.end();
        return;
      }
    }

    // response.statusCode = 404;
    // response.write("Not Found");
    // response.end();
  })
  .listen(8080);

console.log(`\t[ Launch ]`);