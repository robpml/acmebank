#!/bin/sh
export MLCP=/Users/rpughsle/ml/mlcp-1.3-3/bin/mlcp.sh
PORT=8070
USER=admin
PASSWORD=marklogic
INPUT_PATH=/Users/rpughsle/ml/workspace/acmebank/data/trades/swaps
INPUT_FILE_TYPE=documents

date
$MLCP import -host roberts-macbook-pro.local -port $PORT \
    -username $USER -password $PASSWORD \
    -mode local \
    -input_file_path $INPUT_PATH \
    -input_file_type $INPUT_FILE_TYPE \
    -output_uri_prefix /trades/swaps \
    -output_uri_suffix .xml \
    -output_uri_replace "Users/rpughsle/ml/workspace/acmebank/data/trades/swaps/,''" \
    -output_collections /trades/swaps



