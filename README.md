# bunext

Bunyan is a logging [library](https://github.com/trentm/node-bunyan) for node.js applications which writes log entries in the JSON format.  Bunext (Bunyan Extractor), is a commandline tool for extracting data and working with Bunyan log files and the JSON they contain.

[![NPM Stats](https://nodei.co/npm/bunext.png?downloads=true)](https://npmjs.org/package/bunext)

## Current status

__WARNING__: bunext is currently under development and considered `alpha` software at this time! That said, it's already proven useful in my own work with bunyan! Feel free to try it and submit feedback.

## Usage

Bunext is a commandline tool so you'll use it at your shell prompt. It requires a bunyan log file to operate on. A typical bunyan log file consists of text containing concatinated stringified JSON.

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

You can install bunext from its GitHub source, using using:

	$ ./install.sh
	
Alternatively, you can install bunext via NPM:

	$ [sudo] npm install bunext -g

The first install method above is useful when you want to work with the bunext source code and potentially contribute pull requests.  The second method is useful when you need to quickly install bunext on machines where you need to debug the source of an application problem by reviewing your log files.

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
    -r, --raw                      Output raw bunyan data
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

and...

    $ bunext -ate 'redis_status.used_memory' temp.log

    [
    "2014-10-25T18:37:01.454Z | 3081232",
    "2014-10-25T18:47:31.376Z | 3081232",
    "2014-10-25T19:47:20.964Z | 3081232",
    "2014-10-25T19:50:18.845Z | 3081232",
    "2014-10-25T19:55:16.202Z | 3081232",
    "2014-10-25T19:55:43.546Z | 3373328",
    "2014-10-25T20:01:47.410Z | 617488",
    ]

You may need to cleanup the resulting output in order for the output to be useable.  Bunext uses a simple and rather naive method of building an array. For example, if your JSON has double quotes they won't be escaped. User beware.

### -d, --dates
Filtering by a date range is one of the most important things you can do when narrowing in on a server error. Monitoring tools will tell you when an issue occurred and you can use that information with bunext.

Here we ask bunex to search the test.log file for entries who's level is set to 60 (Fatal error) between October 10 and October 30th.

	$ bunext -d '10/10/14 - 10/30/14' -e 'level===60' test.log

### -e, --expression
The ability to use JavaScript expressions to query bunyan log data is one of the most useful features of bunext. When combined with a date range you have a powerful query engine in your arsinal.

Bunext expects a JavaScript expression that results in a boolean value or a primitive type.

	$ bunext -e 'level===60' test.log

In the example above, we used the expression 'level===60'.  This will return true as the log file in question does have entries where level is indeed 60.  However, we're probably not expecting to see the following as output:

	true
	true
	true
	true
	true
	true

The reason is ofcourse that the expression evalutes to true in some cases.  If we want to see the associated JSON object we need to specify the -s, --source option flag.

	$ bunext -s -e 'level===60' test.log

Then we might see something like this:

```
{
  "name": "siteserver",
  "hostname": "ip-172-31-40-196",
  "pid": 12438,
  "level": 60,
  "err": {
    "message": "Object true has no method 'then'",
    "name": "TypeError",
  },
  "msg": "Object true has no method 'then'",
  "time": "2014-10-09T22:33:41.920Z",
  "v": 0
}
```

In this next example lets consider the following log entry:

```
{
  "name": "siteserver",
  "hostname": "ip-172-31-40-161",
  "pid": 1677,
  "level": 30,
  "event": "monitor",
  "redis_status": {
    "redis_version": "2.8.4",
    "uptime_in_seconds": "857892",
    "uptime_in_days": "9",
    "used_memory": "3081232",
    "db2": "keys=4,expires=0,avg_ttl=0",
    "db3": "keys=1,expires=0,avg_ttl=0"
  },
  "msg": "",
  "time": "2014-10-25T18:37:01.454Z",
  "v": 0
}
```

Lets say we're interested in exporting the memory usage of Redis over a period of time.  The `used_memory` field is actually stored inside of the redis_status object.  To reference it, we simply use an expression of `redis_status.used_memory`

	$ bunext -e 'redis_status.used_memory' siteserver.log

	3081232
    3081232
    3081232
    3081232
    3081232
    3373328
    617488

That's cool.  However, not that useful in its current form.  Let's use the `-t` option to view the time stamp for each entry:

	$ bunext -te 'redis_status.used_memory' siteserver.log

	2014-10-25T18:37:01.454Z | 3081232
	2014-10-25T18:47:31.376Z | 3081232
	2014-10-25T19:47:20.964Z | 3081232
	2014-10-25T19:50:18.845Z | 3081232
	2014-10-25T19:55:16.202Z | 3081232
	2014-10-25T19:55:43.546Z | 3373328
	2014-10-25T20:01:47.410Z | 617488

Now that's better!

> Note that we used `-te` above.  That's just a shorthand for `-t -e`

This gets better as we use conditional expressions to further filter the output

	$ bunext -te 'redis_status.used_memory < 3081232' siteserver.log

	2014-10-25T20:01:47.410Z | 617488

### -r, --raw
The -r and --raw flags tell bunext to output raw bunyan entries.  This is useful in a number of use cases, such as performing multi-staged queries and concatinating entries from multiple servers prior to further querying the resulting data.

Consider this sample bunyan entry:

```
{"name":"siteserver","hostname":"ip-172-31-40-161","pid":1811,"level":30,"event":"monitor","node_status":{"architecture":"x64","platform":"linux","nodeVersion":"v0.10.25","memory":{"rss":46936064,"heapTotal":54096128,"heapUsed":20113944},"uptime":"1 minute, 30.171894613999932 seconds"},"msg":"","time":"2014-10-25T18:49:00.346Z","v":0}
```

Let's format it a bit to have an easier look:

```
{
  "name": "siteserver",
  "hostname": "ip-172-31-40-161",
  "pid": 1811,
  "level": 30,
  "event": "monitor",
  "node_status": {
    "architecture": "x64",
    "platform": "linux",
    "nodeVersion": "v0.10.25",
    "memory": {
      "rss": 46936064,
      "heapTotal": 54096128,
      "heapUsed": 20113944
    },
    "uptime": "1 minute, 30.171894613999932 seconds"
  },
  "msg": "",
  "time": "2014-10-25T18:49:00.346Z",
  "v": 0
}
```

Here we're interested in extracting memory usage for a node server. First we want to filter all JSON entries where `event===monitor` then where `node_status.memory.heapUsed` is greater than some amount of bytes.

Using the raw flag we can extract all of the raw bunyan JSON entries which contain an event of monitor and save that in a temp file.

	$ bunext -re 'event==="monitor"' siteserver.log > temp.log

Then we can operate on the temp file to extract the heapUsed data.

	$ bunext -te 'node_status.memory.heapUsed > 20113944' temp.log

	2014-10-25T19:52:00.819Z | 20140080
	2014-10-25T19:53:00.818Z | 20185648
	2014-10-25T19:54:00.818Z | 20220424
	2014-10-25T19:55:00.819Z | 20253272
	2014-10-25T20:04:00.370Z | 20152888
	2014-10-25T20:05:00.383Z | 20187744
	2014-10-25T20:06:00.387Z | 20220672
	2014-10-25T20:07:00.387Z | 20254424

### -s, --source
The source option flag instructs bunext to return the source JSON data for a matching query. Unlike the raw option the source JSON is extracted and formatted for readability.

	$ bunext -s -e 'level===60' test.log

### -t, --timestamp
All bunyan log entries include a time field in each JSON entry. That field indicates when bunyan wrote the log entry. Because the time field is guarenteed to exists we can request it to be included in our queries.

	$ bunext -t -d '10/10/14 - 10/30/14' -e 'redis-status.memory > 256000' app.log

### -p, --prettydate
The time entry in our last section can be a bit difficult to read quickly.  Using the prettydate format you can request a more human readable format.

	$ bunext -p -d '10/10/14 - 10/30/14' -e 'redis-status.memory > 256000' app.log

