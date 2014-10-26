# bunext

Bunyan is a JSON logging [library](https://github.com/trentm/node-bunyan) for node.js applications.  Bunext (Bunyan Extractor) is a commandline tool for extracting data from Bunyan log files.

## Current status

__WARNING__: bunext is currently under development and considered `alpha` software at this time! Feel free to try it and submit feedback.

## Usage

bunext requires a bunyan log file to operate on. A typical bunyan log file consists of text containing concatinated stringified JSON.

```
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"msg":"SiteServer (v.0.2.0) server listening on port 8123","time":"2014-10-18T19:37:55.283Z","v":0}
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"job":{"scheduled":"monitor_redis:0 * * * *"},"msg":"","time":"2014-10-18T19:37:55.907Z","v":0}
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"job":{"scheduled":"node_status:0 * * * *"},"msg":"","time":"2014-10-18T19:37:55.907Z","v":0}
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"node_status":{"architecture":"x64","platform":"darwin","nodeVersion":"v0.10.29","memory":{"rss":52682752,"heapTotal":40378624,"heapUsed":26613240},"uptime":"2 seconds"},"msg":"","time":"2014-10-18T19:37:55.910Z","v":0}
```

The purpose of bunext is to be able to query bunyan logs and extract useful information. 

Given a log file called app.log you can invoke bunext to see the file's JSON data. This allows you to view the JSON data in a pretty print format.  While easier to read, this format is of limited value when your log file consists of thousands of entries.

	$ bunyan app.log


Using bunext options you can specify date ranges and expression predicates which help you quickly filter and extract the information you're looking for.	

You can also invoke JavaScript expressions against the file's JSON data.

	$ bunayn app.log -e 'redis-status'
	$ bunayn app.log -e 'redis-status.memory > 256000'

## Install

Install bunext from this source using:

	$ ./install.sh
	
Alternatively, you can install bunext via NPM:

	$ [sudo] npm install bunext -g

## Options

Executing bunext without option flags or specifying the `-h` or `--help` options you'll see a list of options.  Some options will only work when paired with other options - such cases are highligted in this section.


```
$ bunext

  Usage: bunext [options] bunyan.log

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -a, --array                    Output results in array format
    -e, --expression [expression]  Filter using expression predicate
    -s, --source                   Extract source (JSON) object
    -t, --timestamp                Show timestamp in results
    -p, --prettydate               Show pretty timestamp in results
```

### Using expressions

TBD

