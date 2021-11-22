const esbuild = require('esbuild');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const package = require('./package.json');
const ejs = require('ejs');
const http = require('http');
const { markdownPlugin } = require('esbuild-plugin-markdown');

require('dotenv').config({
  path: path.resolve(process.cwd(), '.env'),
});

// Params

const cwd = process.cwd();
const srcPath = `${cwd}/src`;
const distPath = `${cwd}/dist`;
const publicPath = `${cwd}/public`;
const entryFilePath = `${srcPath}/index.tsx`;
const bundleFilePath = `${distPath}/app.js`;
const cssFilePath = `${distPath}/app.css`;
const servePort = parseInt(process.env.PORT || process.env.APP_PORT || 8080, 10);

// Utils

const log = {
  trace: (...args) => console.log('[*]:', ...args),
  debug: (...args) => console.log('[-]:', ...args),
  info: (...args) => console.log('[+]:', ...args),
  err: (...args) => console.error(...args),
};

const openUrl = url => {
  const startCmd = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
  require('child_process').exec(startCmd + ' ' + url);
};

// Configs

const getEnvConfigs = () => {
  const opts = { watch: false, serve: false };
  const args = process.argv.slice(2, process.argv.length);
  for (const arg of args) {
    if (arg === '--watch' || arg === '-w') {
      opts.watch = true;
    }
    if (arg === '--serve') {
      opts.serve = true;
    }
  }
  return opts;
};

// Files

const getFileHash = async filename =>
  new Promise((resolve, reject) => {
    const md5sum = crypto.createHash('md5');
    const s = fs.ReadStream(filename);
    s.on('data', d => md5sum.update(d));
    s.on('end', () => resolve(md5sum.digest('hex')));
    s.on('error', err => reject(err));
  });

const mkdirp = folderPath => fs.mkdirSync(folderPath, { recursive: true });

const mkdirpWithFilePath = filePath => mkdirp(path.parse(filePath).dir);

const listFilesInFolder = (folderPath, extensions) => {
  const res = [];
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const itemPath = path.resolve(folderPath, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      const newItems = listFilesInFolder(itemPath, extensions);
      res.push(...newItems);
    } else if (isFileExtensionInList(itemPath, extensions)) {
      res.push(itemPath);
    }
  }
  return res;
};

const copyFilesInFolder = (srcFolder, distFolder, extensions) => {
  const filePaths = listFilesInFolder(srcFolder, extensions);
  for (const filePath of filePaths) {
    const newFilePath = filePath.replace(srcFolder, distFolder);
    log.debug(`copy "${filePath.replace(cwd, '')}" to "${newFilePath.replace(cwd, '')}"`);
    mkdirpWithFilePath(newFilePath);
    fs.copyFileSync(filePath, newFilePath);
  }
};

const isFileExtensionInList = (filePath, extensions) => {
  if (!extensions) return true;
  const ext = path.extname(filePath);
  if (!ext) return false;
  return extensions.includes(ext.substring(1).toLocaleLowerCase());
};

// EJS

const compileEjsFile = (inputFile, outputFile, data) => {
  mkdirpWithFilePath(outputFile);
  const str = fs.readFileSync(inputFile, 'utf-8');
  const html = ejs.render(str, { data });
  fs.writeFileSync(outputFile, html);
};

// Serve

const serve = (servedir, serverport, buildOptions) => {
  esbuild
    .serve(
      {
        servedir,
        port: serverport - 1,
        onRequest: args => log.trace(`${args.remoteAddress} - "${args.method} ${args.path}" ${args.status} [${args.timeInMS}ms]`),
      },
      buildOptions,
    )
    .then(result => {
      const { host, port } = result;
      const proxy = http.createServer((req, res) => {
        const forwardRequest = path => {
          const options = {
            hostname: host,
            port,
            path,
            method: req.method,
            headers: req.headers,
          };

          const proxyReq = http.request(options, proxyRes => {
            if (proxyRes.statusCode === 404) {
              return forwardRequest('/');
            }
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          });
          req.pipe(proxyReq, { end: true });
        };
        forwardRequest(req.url);
      });
      proxy.listen(serverport);
    });
};

// Run

const run = async () => {
  const env = process.env.APP_ENV;
  const conf = getEnvConfigs();

  log.info('copy images');
  copyFilesInFolder(publicPath, distPath, ['png']);
  log.info('copy images done');

  const buildOptions = {
    entryPoints: [entryFilePath],
    bundle: true,
    sourcemap: env !== 'prd',
    minify: env === 'prd',
    outfile: bundleFilePath,
    watch: conf.watch,
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.svg': 'dataurl',
    },
    plugins: [markdownPlugin()],
    define: {
      APP_VERSION: JSON.stringify(package.version),
      APP_NAME: JSON.stringify(package.name),
      APP_TITLE: JSON.stringify(package.title),
      APP_COMPANY: JSON.stringify(package.company),
      APP_DESCRIPTION: JSON.stringify(package.description),
      APP_ENV: JSON.stringify(process.env.APP_ENV),
      APP_URL: JSON.stringify(process.env.APP_URL || '/'),
      APP_LOG_LEVEL: JSON.stringify(process.env.APP_LOG_LEVEL),
      MAPS_API_KEY: JSON.stringify(process.env.MAPS_API_KEY),
      global: 'window',
    },
  };

  if (conf.serve) {
    log.info('compile ejs file');
    const { name, version, title, description, company, url, keywords } = package;
    compileEjsFile(`${publicPath}/index.ejs`, `${distPath}/index.html`, { name, version, title, description, company, url, keywords });
    log.info('compile ejs file done');

    log.info(`start serving at http://localhost:${servePort}/`);
    serve(distPath, servePort, buildOptions);
    openUrl(`http://localhost:${servePort}/`);
  } else {
    log.info('bundle js');
    await esbuild.build(buildOptions);
    log.info('bundle js done');

    log.info('getting bundle hash');
    const bundleHash = (await getFileHash(bundleFilePath)).slice(0, 10);
    log.info(`getting bundle hash done, ` + bundleHash);

    log.info('getting css hash');
    const cssHash = (await getFileHash(cssFilePath)).slice(0, 10);
    log.info(`getting css hash done, ` + cssHash);

    log.info('compile ejs file');
    const { name, version, title, description, company, url, keywords } = package;
    compileEjsFile(`${publicPath}/index.ejs`, `${distPath}/index.html`, {
      name,
      version,
      title,
      description,
      company,
      url,
      keywords,
      bundleHash,
      cssHash,
    });
    log.info('compile ejs file done');
  }
};

run().catch(err => {
  log.err(err);
  process.exit(1);
});
