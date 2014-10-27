# bunext

Bunyan is a logging [library](https://github.com/trentm/node-bunyan) for node.js applications which writes log entries in the JSON format.  Bunext (Bunyan Extractor), is a commandline tool for extracting data and working with Bunyan log files and the JSON they contain.

## Current status

__WARNING__: bunext is currently under development and considered `alpha` software at this time! Feel free to try it and submit feedback.

## Usage

bunext is a commandline tool so you'll use it at your shell prompt. It requires a bunyan log file to operate on. A typical bunyan log file consists of text containing concatinated stringified JSON.

```
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"msg":"SiteServer (v.0.2.0) server listening on port 8123","time":"2014-10-18T19:37:55.283Z","v":0}
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"job":{"scheduled":"monitor_redis:0 * * * *"},"msg":"","time":"2014-10-18T19:37:55.907Z","v":0}
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"job":{"scheduled":"node_status:0 * * * *"},"msg":"","time":"2014-10-18T19:37:55.907Z","v":0}
{"name":"siteserver","hostname":"phoenix.local","pid":23798,"level":30,"node_status":{"architecture":"x64","platform":"darwin","nodeVersion":"v0.10.29","memory":{"rss":52682752,"heapTotal":40378624,"heapUsed":26613240},"uptime":"2 seconds"},"msg":"","time":"2014-10-18T19:37:55.910Z","v":0}
```

Given a log file called app.log you can invoke bunext to see the file's JSON data. This allows you to view the JSON in a pretty print format.  While easier to read, this format is of limited value when your log file consists of thousands of entries.

	$ bunext app.log

Using bunext options you can specify a date range and expression predicates which help you quickly filter and extract the information you're looking for.

You can also invoke JavaScript expressions against the file's JSON data.

	$ bunext -d '10/10/14 - 10/30/14' -e 'redis-status.memory > 256000' app.log
	
You can learn more about those and other options later in this doc, hopefully this gives you a sense of how useful bunext can be.	

## Install

You can install bunext from its github source, using using:

	$ ./install.sh
	
Alternatively, you can install bunext via NPM:

	$ [sudo] npm install bunext -g

The first install method above is useful when you want to work with the bunext source code and potentially contribute pull requests.  The second method useful when you need to quickly install bunext on machines in the wild where you need to debug the source of an application problem by reviewing your log files.

## Options

Executing bunext without option flags or specifying the `-h` or `--help` options you'll see a list of options.  Some options will only work when paired with other options - such cases are highligted in this section.


```
$ bunext

  Usage: bunext [options] bunyan.log

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -a, --array                    Output results in array format
    -d, --dates [start,end]        Specify a date range
    -e, --expression [expression]  Filter using expression predicate
    -s, --source                   Extract source (JSON) object
    -t, --timestamp                Show timestamp in results
    -p, --prettydate               Show pretty timestamp in results

```

### -V, --version
Output bunext version number

	$ bunext -V
	0.0.1

### -a, --array
Output data in an array format. This is useful when you want to collect specific data an into an array that you'll use in code.

	$ bunext -a -e 'request_info.xForwardedFor' test.log
	[
		"199.116.73.139, 
		"172.31.8.142",
		"107.178.200.192,
	]

### -d, --dates
Filtering by a date range is one of the most important things you can do when narrowing in on a server error. Monitoring tools will tell you when an issue occurred and you can use that information with bunext.

Here we ask bunex to search the test.log file for entries who's level is set to 60 (Fatal error) between October 10 and October 30th.

	$ bunext -d '10/10/14 - 10/30/14' -e 'level===60' test.log

### -e, --expression
The ability to use JavaScript expressions to query bunyan log data is one of the most useful features of bunext. When combined with a date range you have a powerful query engine in your arsinal.

Bunext expects a JavaScript expression that results in a boolean value or a primitive type.

	$ bunext -e 'level===60' test.log
	$ bunext --expression 'redis-status.memory > 256000' app.log

### -s, --source
The source option flag instructs bunext to return the source JSON data for a matching query.

	$ bunext -s -e 'level===60' test.log

### -t, --timestamp
All bunyan log entries include a time field in each JSON entry. That field indicates when bunyan wrote the log entry. Because the time field is guarenteed to exists we can request it to be included in our queries.

	$ bunext -t -d '10/10/14 - 10/30/14' -e 'redis-status.memory > 256000' app.log

### -p, --prettydate
The time entry in our last section can be a bit difficult to read quickly.  Using the prettydate format you can request a more human readable format.

	$ bunext -p -d '10/10/14 - 10/30/14' -e 'redis-status.memory > 256000' app.log

