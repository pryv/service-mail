FROM pryvio/base:1.3.40
MAINTAINER "Tech@Pryv" <tech@pryv.com>

# mount build folder
ADD . /pd_build
RUN ls pd_build

# Set main paths that will be reused in this docker file
ARG TARGET_DIR="/app/bin"
ARG CONF_DIR="/app/conf"
ARG LOG_DIR="/app/log"

# Create software dir
RUN mkdir -p $TARGET_DIR
RUN cp -a /pd_build/bin/. $TARGET_DIR
RUN chown -R app $TARGET_DIR
RUN cd $TARGET_DIR && npm ci

# Install the config file
RUN mkdir -p $CONF_DIR
RUN cp /pd_build/config/mail.json $CONF_DIR/mail.json

# Create the log
RUN mkdir -p $LOG_DIR
RUN touch $LOG_DIR/mail.log && chown -R app:app $LOG_DIR

# Install the script that runs the api service
RUN mkdir /etc/service/mail
RUN cp /pd_build/runit/mail /etc/service/mail/run

# Remove cron and sshd entirely, unless we use them
RUN rm -r /etc/service/cron
RUN rm -r /etc/service/sshd && rm /etc/my_init.d/00_regen_ssh_host_keys.sh

# Install sendmail
RUN ["/bin/bash", "-c", "apt-get update && apt-get install -y --no-install-recommends sendmail"]

# Cleanup
RUN apt-get remove -y autoconf automake
RUN apt-get autoremove
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
RUN rm -rf /pd_build

EXPOSE 9000
