#!/bin/bash
set -e
source /pd_build/buildconfig

# Install the application.
run /pd_build/release.sh

# Remove cron and sshd entirely, unless we use them
run rm -r /etc/service/cron
run rm -r /etc/service/sshd && rm /etc/my_init.d/00_regen_ssh_host_keys.sh

# Install and setup sendmail
minimal_apt_get_install sendmail
echo "127.0.0.1 localhost localhost.localdomain $HOSTNAME" >> /etc/hosts && yes 'Y' | sendmailconfig 

# Clean up after ourselves.
run /pd_build/finalize.sh
