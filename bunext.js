#!/usr/bin/env node
'use strict';
var fs = require('fs')
  , program = require('commander')
  , chalk = require('chalk')
  , moment = require('moment')
  , liner = require('./liner');

/**
 * displayError
 * Display error messages in red
 * @param message
 */
function displayError(message) {
  console.log(chalk.red.bold(message));
}

/**
 * processLine
 * @param line
 */
function processLine(line) {
  var jsObj, text, output;
  try {
    text = '';
    jsObj = JSON.parse(line);
    if (program.timestamp) {
      text = jsObj.time + ' | ';
    } else if (program.prettydate) {
      text = moment(jsObj.time).format("MMMM Do YYYY, hh:mm:ss a") + ' | ';
    }
    if (program.expression) {
      try {
        var result = eval('jsObj.' + program.expression);
        if (result) {
          if (program.source) {
            output = JSON.stringify(jsObj, undefined, 2);
          } else {
            if (typeof result === 'boolean') {
              var subExps = program.expression.split(' ');
              text += eval('jsObj.' + subExps[0]);
            } else if (typeof result === 'string' || typeof result === 'number') {
              text += result;
            } else if (typeof result === 'object') {
              text += JSON.stringify(result);
            }
            output = text;
          }
        }
      } catch (e) {
      }
    } else {
      output = text + JSON.stringify(jsObj, undefined, 2);
    }
  } catch (e) {
    displayError(e);
    process.exit(-1);
  }
  return output;
}

/**
 * main
 */
function main() {
  program
    .version('0.0.1')
    .usage('[options] bunyan.log')
    .option('-a, --array', 'Output results in array format')
    .option('-e, --expression [expression]', 'Filter using expression predicate')
    .option('-s, --source', 'Extract source (JSON) object')
    .option('-t, --timestamp', 'Show timestamp in results')
    .option('-p, --prettydate', 'Show pretty timestamp in results')
    .parse(process.argv);

  if (!program.args.length) {
    program.help();
  } else {
    var arrayOutput = (program['array'] && program.source)
      , source = fs.createReadStream(program.args[0]);

    if (arrayOutput) {
      console.log('[');
    }

    source.pipe(liner);
    source.on('error', function(err) {
      if (err.errno === 34) {
        displayError('Can\'t open ' + err.path);
      } else {
        displayError(err);
      }
      process.exit(-1);
    });
    liner.on('readable', function() {
      var lineIn, lineOut;
      while (lineIn = liner.read()) {
        lineOut = processLine(lineIn);
        console.log(lineOut + ((arrayOutput) ? ',' : ''));
      }
    });
    process.on('exit', function() {
      if (arrayOutput) {
        console.log(']');
      }
    });
  }
}

main();
