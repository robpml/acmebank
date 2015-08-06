xquery version "1.0-ml";
declare namespace html = "http://www.w3.org/1999/xhtml";

for $collection in cts:collections()
return
xdmp:estimate(fn:collection($collection))