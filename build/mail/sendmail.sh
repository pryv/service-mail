#!/bin/bash
set -e
 
echo "127.0.0.1 localhost localhost.localdomain $HOSTNAME" >> /etc/hosts
yes 'Y' | sendmailconfig