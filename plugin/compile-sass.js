Exec = {}; // Thanks to sixolet's gist 6091321
Utils = {};
Cache = function () {
    if (this instanceof Cache) {
        return Cache.instance = Cache.instance || this;
    } else {
        return Cache.instance = Cache.instance || new Cache;
    }
};
Compiler = {};

var Future = Npm.require('fibers/future');
var Process = Npm.require('child_process');
var Path = Npm.require('path');
var Fs = Npm.require('fs');
var _ = Npm.require('lodash');

Exec.spawn = function (command, args, options) {
    var out = "";
    var err = "";
    var ret = new Future;
    options = options || {};

    var proc = Process.spawn(command, args, options);
    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');
    
    if (options.captureOut) {
        proc.stdout.on('data', function (data) {
            if (options.log) {
                console.log(data);
            }

            out += data;

            if (typeof options.captureOut === 'function') {
                options.captureOut(data);
            }
        }, function (err) {
            Log.warn(err);
        });
    }

    if (options.captureErr) {
        proc.stderr.on('data', function (data) {
            if (options.log) {
                console.error(data);
            }

            err += data;

            if (typeof options.captureErr === 'function') {
                options.captureErr(data);
            }
        }, function (err) {
            Log.warn(err);
        });
    }

    proc.on('close', function (code) {
        ret.return({
            stdout: out,
            stderr: err,
            code: code
        });
    });

    ret.proc = proc;
    return ret;
};

Utils.loadJSONFile = function (filePath) {
    var content = Fs.readFileSync(filePath);

    try {
        return JSON.parse(content);
    }
    catch (e) {
        console.error('Error: failed to parse ', filePath, ' as JSON');
        return {};
    }
};

Utils.fileLastModifiedTime = function (filePath) {
    var stat = Fs.statSync(filePath);
    
    try {
        return stat.mtime.getTime();
    }
    catch (e) {
        console.error('Error: could not stat ', filePath);
        return null;
    }
};

Utils.makeCliOption = function (option, defaultValue) {
    defaultValue = defaultValue || null;

    return { 'option': option, 'default': defaultValue };
};

_.extend(Cache.prototype, {
    storage: {},

    store: function (key, data, time) {
        time = time || _.now();

        this.storage[key] = {
            data: data,
            modified: time
        };

        return true;
    },

    isOutdated: function (key, time) {
        return !this.storage[key] || !time || this.storage[key].modified < time;
    },

    isOutdatedFile: function (filePath) {
        var time = Utils.fileLastModifiedTime(filePath);

        return this.isOutdated(filePath, time);
    },

    put: function (key, data, time) {
        time = time || _.now();

        if (this.isOutdated(key, time)) {
            return this.store(key, data, time);
        }

        return false;
    },

    putFile: function (filePath, fileContents, time) {
        time = time || _.now();

        if (this.isOutdatedFile(filePath)) {
            return this.store(filePath, fileContents, time);
        }

        return false;
    },

    get: function (key) {
        if (!_.has(this.storage, key)) {
            console.error('Key not found in cache: ', key);
            return null;
        }

        return this.storage[key].data;
    }
});

_.extend(Compiler, {
    cache: new Cache(),

    defaultOptions: {
        'style': Utils.makeCliOption('--style=', 'nested'),
        'import': Utils.makeCliOption('--load-path='),
        'precision': Utils.makeCliOption('--precision=', '5'),
        'require': Utils.makeCliOption('--require='),
        'scss': Utils.makeCliOption('--scss', true),
        'unixNewlines': Utils.makeCliOption('--unix-newlines', false),
        'comments': Utils.makeCliOption('--line-comments', false),
        'defaultEncoding': Utils.makeCliOption('--default-encoding'),
        'cacheLocation': Utils.makeCliOption('--cache-location=', '.sass-cache'),
        'compass': Utils.makeCliOption('--compass', false),
        'noCache': Utils.makeCliOption('--no-cache', true)
    }
});

Compiler.sourceHandler = function (compileStep) {
    if (Path.basename(compileStep.inputPath)[0] === '_') {
        return;
    }

    var compilerArgs = {};

    var optionsFile = Path.join(process.cwd(), 'ruby-sass.json'),
        time = Utils.fileLastModifiedTime(optionsFile);
    
    if (Compiler.cache.isOutdatedFile(optionsFile, time)) {
        var customOptions = {};

        if (Fs.existsSync(optionsFile)) {
            customOptions = Utils.loadJSONFile(optionsFile);
        }

        var defaults = _.transform(Compiler.defaultOptions, function (result, value, key) {
            if (value.default === null) {
                return;
            }

            result[key] = _.isBoolean(value.default) ? null : value.default;
        });

        var options = _.extend({}, defaults, customOptions);

        compilerArgs = _.map(options, function (value, key, result) {
            var opt = Compiler.defaultOptions[key];
            var arg = opt.option;

            if (value !== null) {
                arg += arg[arg.length - 1] === '=' ? value : ' ' + value;
            }

            return arg;
        });

        Compiler.cache.put('OPTIONS', compilerArgs);
    } else {
        compilerArgs = Compiler.cache.get('OPTIONS');
    }

    compilerArgs.push(compileStep.fullInputPath);

    try {
        var compilerOutput = Exec.spawn('sass', compilerArgs, {
            captureOut: true
        }).wait();

        if (compilerOutput.code !== 0) {
            throw new Error("Compiler exited abnormally with code " + compilerOutput.code);
        }

        compileStep.addStylesheet({
            path: compileStep.inputPath + '.css',
            data: compilerOutput.stdout
        });
    }
    catch (e) {
        compileStep.error({
            message: 'Sass compiler error:\n' + e.message
        });
    }
};

Plugin.registerSourceHandler("scss", {archMatching: 'web'}, Compiler.sourceHandler);
Plugin.registerSourceHandler('sass', {archMatching: 'web'}, Compiler.sourceHandler);

Plugin.registerSourceHandler("scssimport", function () {
    // Do nothing
});
