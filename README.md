# httpdup

Node.js utility to forward HTTP requests to a primary host while also duplicating the requests to one or more secondary hosts.
Based on [duplicator](https://github.com/agnoster/duplicator).

Supports:

* Arbitrary number of secondary hosts
* Host header rewriting for secondary hosts (for vhosts)
* Compressed or otherwise binary request/response bodies

Does not support:

* HTTPS
* Host header rewriting for the primary host

## Installation

`npm install -g httpdup`

## Options

```
  --version        Show version number                                 [boolean]
  --help, -h       Show help                                           [boolean]
  --listen, -l     Port to listen on                      [number] [default: 80]
  --primary, -p    Host providing the response                          [string]
  --secondary, -s  Host(s) to duplicate to                               [array]
  --keep-host, -k  Do not modify HTTP Host header                      [boolean]

At least one primary or secondary host is required.
```

## Example

Let's say we want an alternative port on main.example.net which acts the same as the HTTP server on port 80, but also duplicates all requests to dev.example.net and staging.example.net.
We run the httpdup server on main.example.net:

```
httpdup --listen 8080 --primary main.example.net:80 --secondary dev.example.net:80 --secondary staging.example.net:80
```

Now we perform an HTTP request:

```
curl http://localhost:8080
```

This should return the response from main.example.net, while also sending the same HTTP request to dev.example.net and staging.example.net (ignoring those responses).

Because the Host header is adapted for every secondary host, this should work even if some or all of the hosts are vhosts on the same server. All data other than the HTTP Host header is left intact.

## Notes

Host header replacement is the only HTTP awareness in this utility. When the `-k` flag is used to disable this feature, it functions as a raw TCP proxy like duplicator (but with support for specifying multiple hosts).
