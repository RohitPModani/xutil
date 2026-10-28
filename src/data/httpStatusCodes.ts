export interface HttpStatus {
  code: number;
  phrase: string;
  /** One sentence: what the code means. */
  meaning: string;
  /** When to send it, or what a client should do about it. */
  note: string;
  /** Defining document, e.g. "RFC 9110 §15.3.1". */
  rfc: string;
  /** Heuristically cacheable by default (RFC 9110 §15.1). */
  cacheable?: true;
  deprecated?: true;
  /** Not in the IANA registry: vendor or joke codes seen in the wild. */
  unofficial?: true;
}

export interface HttpStatusClass {
  range: string;
  name: string;
  description: string;
  codes: HttpStatus[];
}

export const HTTP_STATUS_CLASSES: HttpStatusClass[] = [
  {
    range: '1xx',
    name: 'Informational',
    description: 'The request was received and the server is continuing to process it. Interim responses; the final status follows.',
    codes: [
      { code: 100, phrase: 'Continue', meaning: 'The initial part of the request was received and the client should send the body.', note: 'Sent in reply to an Expect: 100-continue header before a large upload.', rfc: 'RFC 9110 §15.2.1' },
      { code: 101, phrase: 'Switching Protocols', meaning: 'The server agrees to switch to the protocol named in the Upgrade header.', note: 'Seen when a WebSocket handshake succeeds.', rfc: 'RFC 9110 §15.2.2' },
      { code: 102, phrase: 'Processing', meaning: 'The server has accepted the request but has not completed it yet.', note: 'WebDAV. Dropped from RFC 4918 because clients did not use it; rarely seen.', rfc: 'RFC 2518 §10.1', deprecated: true },
      { code: 103, phrase: 'Early Hints', meaning: 'Headers, usually Link preload hints, sent before the final response is ready.', note: 'Lets the browser start fetching CSS and fonts while the server renders the page.', rfc: 'RFC 8297 §2' },
    ],
  },
  {
    range: '2xx',
    name: 'Success',
    description: 'The request was received, understood and accepted.',
    codes: [
      { code: 200, phrase: 'OK', meaning: 'The request succeeded and the response carries the result.', note: 'The default success code for GET, and for POST when nothing was created.', rfc: 'RFC 9110 §15.3.1', cacheable: true },
      { code: 201, phrase: 'Created', meaning: 'The request succeeded and a new resource was created.', note: 'Return it from POST or PUT that creates something, with a Location header pointing at the new resource.', rfc: 'RFC 9110 §15.3.2' },
      { code: 202, phrase: 'Accepted', meaning: 'The request was accepted for processing but the processing has not finished.', note: 'Use for background jobs; point the client at a status URL.', rfc: 'RFC 9110 §15.3.3' },
      { code: 203, phrase: 'Non-Authoritative Information', meaning: 'The request succeeded but a proxy modified the response from the origin.', note: 'Rare outside transforming proxies.', rfc: 'RFC 9110 §15.3.4', cacheable: true },
      { code: 204, phrase: 'No Content', meaning: 'The request succeeded and there is no body to return.', note: 'Typical for DELETE, or a PUT that updated in place. The browser keeps the current page.', rfc: 'RFC 9110 §15.3.5', cacheable: true },
      { code: 205, phrase: 'Reset Content', meaning: 'The request succeeded and the client should reset the document view, for example clear a form.', note: 'Rarely used; no body is allowed.', rfc: 'RFC 9110 §15.3.6' },
      { code: 206, phrase: 'Partial Content', meaning: 'The server is returning only the byte range the client asked for.', note: 'Answer to a Range request; video seeking and resumable downloads depend on it.', rfc: 'RFC 9110 §15.3.7', cacheable: true },
      { code: 207, phrase: 'Multi-Status', meaning: 'The body is an XML document with a separate status for each of several resources.', note: 'WebDAV, for operations on collections.', rfc: 'RFC 4918 §11.1' },
      { code: 208, phrase: 'Already Reported', meaning: 'The members of this binding were already listed earlier in the same multistatus response.', note: 'WebDAV, avoids repeating collection members.', rfc: 'RFC 5842 §7.1' },
      { code: 226, phrase: 'IM Used', meaning: 'The response is the result of applying instance manipulations (a delta) to the current instance.', note: 'Delta encoding; almost never seen.', rfc: 'RFC 3229 §10.4.1' },
    ],
  },
  {
    range: '3xx',
    name: 'Redirection',
    description: 'Further action is needed to complete the request, usually following a Location header.',
    codes: [
      { code: 300, phrase: 'Multiple Choices', meaning: 'The resource has several representations and the client can choose one.', note: 'Rare; servers normally pick one themselves with content negotiation.', rfc: 'RFC 9110 §15.4.1', cacheable: true },
      { code: 301, phrase: 'Moved Permanently', meaning: 'The resource has a new permanent URL given in Location.', note: 'Use for site moves and canonical URLs; search engines transfer ranking. Browsers may change POST to GET.', rfc: 'RFC 9110 §15.4.2', cacheable: true },
      { code: 302, phrase: 'Found', meaning: 'The resource is temporarily at a different URL.', note: 'Most clients change POST to GET when following it; use 307 if the method must be kept.', rfc: 'RFC 9110 §15.4.3' },
      { code: 303, phrase: 'See Other', meaning: 'The response to the request is at another URL, to be fetched with GET.', note: 'The post-redirect-get pattern: send it after a form POST to avoid double submission.', rfc: 'RFC 9110 §15.4.4' },
      { code: 304, phrase: 'Not Modified', meaning: 'The cached copy is still valid; no body is sent.', note: 'Answer to a conditional request (If-None-Match or If-Modified-Since).', rfc: 'RFC 9110 §15.4.5' },
      { code: 305, phrase: 'Use Proxy', meaning: 'The request must be made through the proxy given in Location.', note: 'Deprecated for security reasons; clients ignore it.', rfc: 'RFC 9110 §15.4.6', deprecated: true },
      { code: 306, phrase: '(Unused)', meaning: 'Formerly "Switch Proxy"; no longer used.', note: 'Reserved. Do not send.', rfc: 'RFC 9110 §15.4.7', deprecated: true },
      { code: 307, phrase: 'Temporary Redirect', meaning: 'The resource is temporarily at a different URL and the method and body must be repeated unchanged.', note: 'Like 302 but a POST stays a POST.', rfc: 'RFC 9110 §15.4.8' },
      { code: 308, phrase: 'Permanent Redirect', meaning: 'The resource has a new permanent URL and the method and body must be repeated unchanged.', note: 'Like 301 but a POST stays a POST.', rfc: 'RFC 9110 §15.4.9', cacheable: true },
    ],
  },
  {
    range: '4xx',
    name: 'Client error',
    description: 'The request appears to be wrong: bad syntax, missing credentials, no such resource. The client should fix the request before retrying.',
    codes: [
      { code: 400, phrase: 'Bad Request', meaning: 'The server cannot process the request because of a client error such as malformed syntax.', note: 'Generic client error; prefer a more specific code when one fits.', rfc: 'RFC 9110 §15.5.1' },
      { code: 401, phrase: 'Unauthorized', meaning: 'The request lacks valid authentication credentials.', note: 'Despite the name it means "not authenticated". Include a WWW-Authenticate header.', rfc: 'RFC 9110 §15.5.2' },
      { code: 402, phrase: 'Payment Required', meaning: 'Reserved for future use.', note: 'Some APIs use it for exhausted quotas or expired subscriptions.', rfc: 'RFC 9110 §15.5.3' },
      { code: 403, phrase: 'Forbidden', meaning: 'The server understood the request but refuses to authorize it.', note: 'The client is known but not allowed; re-authenticating will not help.', rfc: 'RFC 9110 §15.5.4' },
      { code: 404, phrase: 'Not Found', meaning: 'The server cannot find the requested resource.', note: 'Also used to hide the existence of a resource from an unauthorized client.', rfc: 'RFC 9110 §15.5.5', cacheable: true },
      { code: 405, phrase: 'Method Not Allowed', meaning: 'The resource exists but does not support the request method.', note: 'Must include an Allow header listing the supported methods.', rfc: 'RFC 9110 §15.5.6', cacheable: true },
      { code: 406, phrase: 'Not Acceptable', meaning: 'No representation matches the Accept headers the client sent.', note: 'Most servers ignore Accept mismatches and return a default instead.', rfc: 'RFC 9110 §15.5.7' },
      { code: 407, phrase: 'Proxy Authentication Required', meaning: 'The client must authenticate with the proxy first.', note: 'Like 401 but from a proxy, with Proxy-Authenticate.', rfc: 'RFC 9110 §15.5.8' },
      { code: 408, phrase: 'Request Timeout', meaning: 'The server timed out waiting for the request.', note: 'The client may repeat the request on a new connection.', rfc: 'RFC 9110 §15.5.9' },
      { code: 409, phrase: 'Conflict', meaning: 'The request conflicts with the current state of the resource.', note: 'Edit collisions, duplicate usernames, version mismatches.', rfc: 'RFC 9110 §15.5.10' },
      { code: 410, phrase: 'Gone', meaning: 'The resource is permanently gone and no forwarding address is known.', note: 'Stronger than 404; search engines drop the URL sooner.', rfc: 'RFC 9110 §15.5.11', cacheable: true },
      { code: 411, phrase: 'Length Required', meaning: 'The server requires a Content-Length header.', note: 'Resend with the header set.', rfc: 'RFC 9110 §15.5.12' },
      { code: 412, phrase: 'Precondition Failed', meaning: 'A precondition header such as If-Match evaluated to false.', note: 'Optimistic concurrency: the ETag no longer matches.', rfc: 'RFC 9110 §15.5.13' },
      { code: 413, phrase: 'Content Too Large', meaning: 'The request body is larger than the server is willing to process.', note: 'Formerly "Payload Too Large". Common with upload limits.', rfc: 'RFC 9110 §15.5.14' },
      { code: 414, phrase: 'URI Too Long', meaning: 'The request URI is longer than the server will interpret.', note: 'Usually a GET carrying data that belongs in a POST body.', rfc: 'RFC 9110 §15.5.15', cacheable: true },
      { code: 415, phrase: 'Unsupported Media Type', meaning: 'The request body is in a format the resource does not support.', note: 'Check the Content-Type header, for example JSON sent to a form endpoint.', rfc: 'RFC 9110 §15.5.16' },
      { code: 416, phrase: 'Range Not Satisfiable', meaning: 'None of the requested byte ranges fall within the resource.', note: 'Include Content-Range with the current length.', rfc: 'RFC 9110 §15.5.17' },
      { code: 417, phrase: 'Expectation Failed', meaning: 'The Expect header could not be met.', note: 'Only 100-continue is defined; older proxies return this when they do not understand it.', rfc: 'RFC 9110 §15.5.18' },
      { code: 418, phrase: "I'm a teapot", meaning: 'The server refuses to brew coffee because it is a teapot.', note: 'April Fools RFC. Reserved and marked unused by RFC 9110, but implemented by many frameworks.', rfc: 'RFC 2324 §2.3.2', unofficial: true },
      { code: 421, phrase: 'Misdirected Request', meaning: 'The request was sent to a server that cannot produce a response for that authority.', note: 'Seen with HTTP/2 connection reuse across hosts on a shared certificate.', rfc: 'RFC 9110 §15.5.20' },
      { code: 422, phrase: 'Unprocessable Content', meaning: 'The request is well-formed but contains semantic errors.', note: 'Validation failures in APIs: right JSON shape, wrong values. Formerly "Unprocessable Entity".', rfc: 'RFC 9110 §15.5.21' },
      { code: 423, phrase: 'Locked', meaning: 'The resource is locked.', note: 'WebDAV.', rfc: 'RFC 4918 §11.3' },
      { code: 424, phrase: 'Failed Dependency', meaning: 'The request failed because a request it depended on failed.', note: 'WebDAV.', rfc: 'RFC 4918 §11.4' },
      { code: 425, phrase: 'Too Early', meaning: 'The server will not risk processing a request that might be replayed.', note: 'TLS 1.3 0-RTT early data.', rfc: 'RFC 8470 §5.2' },
      { code: 426, phrase: 'Upgrade Required', meaning: 'The client should switch to the protocol named in the Upgrade header.', note: 'For example, requiring TLS.', rfc: 'RFC 9110 §15.5.22' },
      { code: 428, phrase: 'Precondition Required', meaning: 'The server requires the request to be conditional.', note: 'Forces clients to send If-Match to avoid lost updates.', rfc: 'RFC 6585 §3' },
      { code: 429, phrase: 'Too Many Requests', meaning: 'The client has sent too many requests in a given time.', note: 'Rate limiting. Include Retry-After so clients know when to try again.', rfc: 'RFC 6585 §4' },
      { code: 431, phrase: 'Request Header Fields Too Large', meaning: 'The header fields are too large for the server to process.', note: 'Usually oversized cookies.', rfc: 'RFC 6585 §5' },
      { code: 444, phrase: 'No Response', meaning: 'nginx closed the connection without sending a response.', note: 'Only appears in nginx logs, never on the wire.', rfc: 'nginx', unofficial: true },
      { code: 451, phrase: 'Unavailable For Legal Reasons', meaning: 'Access is denied because of a legal demand.', note: 'Court orders, censorship, geo-blocking for legal reasons. Named after Fahrenheit 451.', rfc: 'RFC 7725 §3' },
      { code: 499, phrase: 'Client Closed Request', meaning: 'The client closed the connection before nginx could respond.', note: 'nginx log code; a sign of impatient clients or slow upstreams.', rfc: 'nginx', unofficial: true },
    ],
  },
  {
    range: '5xx',
    name: 'Server error',
    description: 'The server failed to fulfil a request that appears valid. The fault is on the server side.',
    codes: [
      { code: 500, phrase: 'Internal Server Error', meaning: 'The server hit an unexpected condition that prevented it from fulfilling the request.', note: 'The generic server error: an unhandled exception, usually.', rfc: 'RFC 9110 §15.6.1' },
      { code: 501, phrase: 'Not Implemented', meaning: 'The server does not support the functionality required to fulfil the request.', note: 'Typically an unrecognised request method.', rfc: 'RFC 9110 §15.6.2', cacheable: true },
      { code: 502, phrase: 'Bad Gateway', meaning: 'A gateway or proxy received an invalid response from the upstream server.', note: 'The app behind the reverse proxy crashed, is not listening, or returned garbage.', rfc: 'RFC 9110 §15.6.3' },
      { code: 503, phrase: 'Service Unavailable', meaning: 'The server is temporarily unable to handle the request, due to overload or maintenance.', note: 'Send Retry-After. Search engines treat it as temporary.', rfc: 'RFC 9110 §15.6.4' },
      { code: 504, phrase: 'Gateway Timeout', meaning: 'A gateway or proxy did not get a timely response from the upstream server.', note: 'The upstream is alive but too slow; raise the timeout or speed up the handler.', rfc: 'RFC 9110 §15.6.5' },
      { code: 505, phrase: 'HTTP Version Not Supported', meaning: 'The server does not support the HTTP version used in the request.', note: 'Rare.', rfc: 'RFC 9110 §15.6.6' },
      { code: 506, phrase: 'Variant Also Negotiates', meaning: 'A configuration error: the chosen variant is itself a negotiation endpoint.', note: 'Transparent content negotiation; almost never seen.', rfc: 'RFC 2295 §8.1' },
      { code: 507, phrase: 'Insufficient Storage', meaning: 'The server cannot store the representation needed to complete the request.', note: 'WebDAV; out of disk or quota.', rfc: 'RFC 4918 §11.5' },
      { code: 508, phrase: 'Loop Detected', meaning: 'The server detected an infinite loop while processing the request.', note: 'WebDAV bindings.', rfc: 'RFC 5842 §7.2' },
      { code: 510, phrase: 'Not Extended', meaning: 'Further extensions to the request are required for the server to fulfil it.', note: 'From an experimental extension framework; effectively unused.', rfc: 'RFC 2774 §7' },
      { code: 511, phrase: 'Network Authentication Required', meaning: 'The client must authenticate to gain network access.', note: 'Captive portals on hotel and airport Wi-Fi.', rfc: 'RFC 6585 §6' },
      { code: 520, phrase: 'Web Server Returned an Unknown Error', meaning: 'Cloudflare got an empty, unknown or unexpected response from the origin.', note: 'Check origin logs; often a crash or a response over the header size limit.', rfc: 'Cloudflare', unofficial: true },
      { code: 521, phrase: 'Web Server Is Down', meaning: 'Cloudflare could not connect to the origin: the connection was refused.', note: 'The origin is offline or a firewall blocks Cloudflare IPs.', rfc: 'Cloudflare', unofficial: true },
      { code: 522, phrase: 'Connection Timed Out', meaning: 'Cloudflare timed out while connecting to the origin.', note: 'TCP handshake never completed; firewall or overloaded origin.', rfc: 'Cloudflare', unofficial: true },
      { code: 523, phrase: 'Origin Is Unreachable', meaning: 'Cloudflare could not reach the origin at all.', note: 'DNS or routing problem for the origin IP.', rfc: 'Cloudflare', unofficial: true },
      { code: 524, phrase: 'A Timeout Occurred', meaning: 'Cloudflare connected to the origin but did not receive a response in time.', note: 'The origin took longer than 100 seconds; move long work to a background job.', rfc: 'Cloudflare', unofficial: true },
      { code: 525, phrase: 'SSL Handshake Failed', meaning: 'Cloudflare could not negotiate TLS with the origin.', note: 'Origin has no certificate or no matching cipher; check the SSL mode.', rfc: 'Cloudflare', unofficial: true },
      { code: 526, phrase: 'Invalid SSL Certificate', meaning: 'Cloudflare could not validate the origin certificate.', note: 'Expired or self-signed certificate under Full (strict) mode.', rfc: 'Cloudflare', unofficial: true },
      { code: 527, phrase: 'Railgun Error', meaning: 'The connection between Cloudflare and the Railgun server was interrupted.', note: 'Railgun was retired in 2024; historical.', rfc: 'Cloudflare', unofficial: true, deprecated: true },
    ],
  },
];
