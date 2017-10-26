'use strict';

var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');
var fs = require('fs');

function FileDetails(filename){
    if (!(this instanceof FileDetails)) return new FileDetails(filename);
    this.filename = filename;
    this.exists = fs.existsSync(filename);
}

var optionDefinitions = [
    {
        name: 'verbose',
        alias: 'v',
        description: 'Show debug log.',
        type: Boolean
    },
    {
        name: 'dump',
        alias: 'd',
        typeLabel: '[underline]{folder}',
        description: 'Dump decrypted packets in specified folder',
        type: FileDetails
    },
    {
        name: 'replay',
        alias: 'r',
        typeLabel: '[underline]{file}',
        description: 'Replay a dumped packet.',
        type: FileDetails,
    },
    {
        name: 'help',
        alias: 'h',
        description: 'Print this usage guide.',
        type: Boolean
    }
];

var sections = [
    {
        header: 'Brawl Stars Proxy',
        content: 'A simple Brawl Stars proxy.'
    },
    {
        header: 'Options',
        optionList: optionDefinitions
    },
];

var options = commandLineArgs(optionDefinitions);
var usage = getUsage(sections);

if(options.help) {
    console.log(usage);
    process.exit(0);
}

if(options.dump === null || (options.dump && !options.dump.exists)) {
    console.error('Error: Specified path does not exist. Please check the path and try again.');
    console.log(usage);
    process.exit(1);
}

if(options.replay === null || (options.replay && !options.replay.exists)) {
    console.error('Error: Specified filename does not exist. Please check the filename and try again.');
    console.log(usage);
    process.exit(1);
}

module.exports.options = options;
