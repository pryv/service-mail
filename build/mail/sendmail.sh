#!/bin/bash
set -e

line=$(head -n 1 /etc/hosts)
line2=$(echo $line | awk '{print $2}')
 
run echo "$line $line2.localdomain" >> /etc/hosts
run yes 'Y' | sendmailconfig