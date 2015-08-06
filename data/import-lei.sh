#!/bin/sh
export MLCP=/Users/rpughsle/ml/mlcp-1.3-3/bin/mlcp.sh
PORT=8070
USER=admin
PASSWORD=marklogic
INPUT_PATH=/Users/rpughsle/Downloads/lei/GMEIIssuedFullFile_20150205T023545.xml
INPUT_FILE_TYPE=aggregates

date
$MLCP import -host roberts-macbook-pro.local -port $PORT \
    -username $USER -password $PASSWORD \
    -mode local \
    -input_file_path $INPUT_PATH \
    -input_file_type $INPUT_FILE_TYPE \
    -aggregate_record_namespace "www.leiutility.org" \
    -aggregate_record_element LegalEntity \
    -aggregate_uri_id LEI \
    -output_uri_prefix /lei/ \
    -output_uri_suffix .xml \
    -output_collections lei



