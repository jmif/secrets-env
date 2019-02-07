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

    const secretFiles = fs.readdirSync(dir);
    secretFiles.forEach((secretFile) => {
        const secretFilePath = path.join(opts.path, secretFile);
        const key = secretFile;

        opts.logger.debug(`Loading ${secretFilePath}`);

        if (fs.statSync(secretFilePath).isDirectory()) {
            opts.logger.debug(`Skipping ${key} - directory`);
            return;
        }

        const secret = fs
            .readFileSync(secretFilePath, opts.fileEncoding)
            .toString()
            .trim();

        if (process.env.hasOwnProperty(key)) {
            opts.logger.warn(`${key} already exists in process.env - skipping`);
            return;
        }

        process.env[key] = secret;

        opts.logger.debug(`Loaded ${key}`);
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
