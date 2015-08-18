#!/bin/sh
export MLCP=/Users/rpughsle/ml/mlcp-1.3-3/bin/mlcp.sh
PORT=8070
USER=admin
PASSWORD=marklogic
INPUT_PATH=/Users/rpughsle/ml/workspace/acmebank/sample-data

date
$MLCP import -host roberts-macbook-pro.local -port $PORT \
    -username $USER -password $PASSWORD \
    -mode local \
    -input_file_path $INPUT_PATH \
    -document_type text

