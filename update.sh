#!/bin/bash

rm -rf cookies kittens lib decoder.html index.html license.txt

if wget -mkEpnpH https://coderpatsy.bitbucket.io; then
    echo "Download done"
else
    echo "Download failed"
fi