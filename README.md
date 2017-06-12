#ML-Statistics
ml-Statistics - Pushes the marklogic statistics information to the slack channel.

This application pushes the below content to slack channel
  1. Time(at which we fetch the ml statistics information)
  2. CPU Utilization in %
  3. Memory Utilization in MB
  4. App Server Request rate for nbc-park and nbc-snl-node applications


Configuration Options for ml-Statistics:

* `port` - int, the port the ML database is listening on.
   Default: `8002`
* `protocol` - string, Signifies whether we need to send the secure protocol for the http request.
   Default: `https`
* `timeout` - int, Signifies how much time we hold up for the http request call invoked.
* `host` - string, the host the ML database can be reached at.
* `auth` -  object, Authentication details to run the configuration scripts
  * `sendImmediately` - bool, defaults to true, which causes a basic
     authentication header to be sent.If sendImmediately is false, then request
     will retry with a proper authentication header after receiving a 401
     response from the server
  * `username` - string, The user for which we run the configuration scripts.
  * `password` - string, The password for which we run the configuration scripts.
* `format` - string, the format of the content for http response.
   Default: `json`
* `channelName:` - string, the slack channel name to push the marklogic statistics notifications.
* `groupId:` - string, appServers that belong to the group in marklogic.
* `groupName:` - string, the header name of the message notification.
* `period:` - string, determines the kind of content to fetch from REST-API calls.
   Default: `json`
* `webhook` - string, the slack configuration endpoint instance to post the updates to the channel.
* `appServers` - array, appserver Names to fetch the request rate for the respective applications
  Default: `["nbc-park", "nbc-snl-node"]`
