const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');

const DEFAULT_OPTIONS = {
    path: undefined,
    fileEncoding: 'utf8',

    // Must have info, warn, error
    logger: console,

    dotenvDebug: false
};

function expandOptions(userOptions) {
    const opts = Object.assign(DEFAULT_OPTIONS, userOptions);

    return opts;
}

function loadSecretDir(dir, opts) {
    opts.logger.info(`Loading secrets from ${dir}`);

    const secrets = fs.readdirSync(dir);
    secrets.forEach((secretFile) => {
        const key = secretFile;
        const secret = fs
            .readFileSync(path.join(opts.path, secretFile), opts.fileEncoding)
            .toString()
            .trim();

        if (process.env.hasOwnProperty(key)) {
            opts.logger.warn(`${key} already exists in process.env - skipping`);
            return;
        }

        process.env[key] = secret;
    });
}

function directoryEntry(userOptions) {
    if (typeof userOptions === 'string') {
        userOptions = { path: userOptions };
    }

    const opts = expandOptions(userOptions);

    if (typeof opts.path !== 'string' || opts.path.length === 0) {
        throw new Error('path must be specified');
    }

    opts.logger.info('Loading secret directories');

    if (!fs.existsSync(opts.path)) {
        throw new Error(`${opts.path} does not exist`);
    }

    loadSecretDir(opts.path, opts);
}

function dotenvEntry(userOptions) {
    const opts = expandOptions(userOptions);

    opts.logger.info('Loading .env');

    dotenv.config({
        path: opts.path,
        encoding: opts.fileEncoding,
        debug: opts.deotenvDebug
    });
}

module.exports.directory = directoryEntry;
module.exports.dotenv = dotenvEntry;
