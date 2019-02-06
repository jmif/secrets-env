const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');

const DEFAULT_OPTIONS = {
    secretDirs: [ '/run/secrets' ],
    fileEncoding: 'utf8',

    dotenvEnvironments: [ 'development' ],
    directoryEnvironments: [ 'production' ],

    // Must have info, warn, error
    logger: console,

    dotenvPath: undefined,
    dotenvDebug: false
};

function loadSecretDir(dir, opts) {
    opts.logger.info(`Loading secrets from ${dir}`);

    const secrets = fs.readdirSync(dir);
    secrets.forEach((secretFile) => {
        const key = secretFile;
        const secret = fs
            .readFileSync(path.join(opts.secretsDir, secretFile), opts.fileEncoding)
            .toString()
            .trim();

        if (process.env.hasOwnProperty(key)) {
            opts.logger.warn(`${key} already exists in process.env - skipping`);
            return;
        }

        process.env[KEY] = secret;
    });
}

function loadSecretDirectories(opts) {
    opts.secretDirs.forEach((secretDir) => {
        if (!fs.existsSync(secretDir)) {
            throw new Error(`${secretDir} does not exist`);
        }

        loadSecretDir(secretDir, opts);
    });
}

function secretsEnv(userOptions) {
    const opts = Object.assign(DEFAULT_OPTIONS, userOptions);

    if (!Array.isArray(opts.secretDirs)) {
        throw new Error('secretDirs must be array');
    }

    const NODE_ENV = process.env.NODE_ENV;
    if (opts.directoryEnvironments.indexOf(NODE_ENV) !== -1) {
        opts.logger.info('Loading secret directories');
        loadSecretDirectories(opts);
    }

    if (opts.dotenvEnvironments.indexOf(NODE_ENV) !== -1) {
        opts.logger.info('Loading .env');
        dotenv.config({
            encoding: opts.fileEncoding,
            debug: opts.deotenvDebug,
            path: opts.dotenvPath
        });
    }
}

module.exports = secretsEnv;
