#!/usr/bin/env node
'use strict';

var fs = require('fs')
  , program = require('commander')
  , chalk = require('chalk')
  , moment = require('moment')
  , liner = require('./liner');

var dateStart, dateEnd;


/**
 * displayError
 * Display error messages in red
 * @param message
 */
function displayError(message) {
  console.log(chalk.red.bold(message));
}

/**
 * processJSON
 * @param jsObj
 */
function processedJSON(jsObj) {
  var text;
  if (program.source) {
    text = JSON.stringify(jsObj, undefined, 2);
  } else {
    text = JSON.stringify(jsObj, undefined);
  }
  return text;
}

/**
 * processLine
 * @param line
 */
function processLine(line) {
  var jsObj
    , text
    , output
    , startQuote = false;
  try {
    text = '';
    jsObj = JSON.parse(line);

    if (program.timestamp) {
      if (program['array']) {
        text += '"';
        startQuote = true;
      }
      text += jsObj.time + ' | ';
    } else if (program.prettydate) {
      text = moment(jsObj.time).format("MMMM Do YYYY, hh:mm:ss a") + ' | ';
    }

    if (program.dates) {
      var logEntryDate = moment(jsObj.time).unix();
      if (logEntryDate < dateStart || logEntryDate > dateEnd) {
        return null;
      }
    }

    if (program.expression) {
      try {
        var result = eval('jsObj.' + program.expression);
        if (result) {
          if (typeof result === 'boolean') {
            var subExps = program.expression.split(' ');
            var res = eval('jsObj.' + subExps[0]);
            if (typeof res !== 'boolean') {
              text += res;
            }
            text += processedJSON(jsObj);
          } else if (typeof result === 'string' || typeof result === 'number') {
            if (program['array'] && startQuote === false) {
              text += '"';
            }
            text += result;
            if (program['array']) {
              text += '"';
            }
          } else if (typeof result === 'object') {
            text += processedJSON(jsObj);
          }
          output = text;
        }
      } catch (e) {
        output = '';
      }
    } else {
      output = text + processedJSON(jsObj);
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
    .version('1.0.0')
    .usage('[options] bunyan.log')
    .option('-a, --array', 'Output results in array format')
    .option('-d, --dates [start,end]', 'Specify a date range')
    .option('-e, --expression [expression]', 'Filter using expression predicate')
    .option('-r, --raw', 'Output raw bunyan data')
    .option('-s, --source', 'Extract source (JSON) object')
    .option('-t, --timestamp', 'Show timestamp in results')
    .option('-p, --prettydate', 'Show pretty timestamp in results')
    .parse(process.argv);

  if (!program.args.length) {
    program.help();
  } else {
    var arrayOutput = program['array']
      , source = fs.createReadStream(program.args[0]);

    if (arrayOutput) {
      console.log('[');
    }

    if (program.dates) {
      try {
        var dates = program.dates.split(',');
        if (dates.length !== 2) {
          displayError('date range should consist of two commas separated dates');
          process.exit(-1);
        }
        dateStart = moment(dates[0].trim()).unix();
        dateEnd = (dates[1].trim() === 'now') ? moment().unix() : moment(dates[1].trim()).unix();
      } catch (e) {
        displayError('date range should consist of two commas separated dates');
        process.exit(-1);
      }
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
        if (lineOut) {
          console.log(lineOut + ((arrayOutput) ? ',' : ''));
        }
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
