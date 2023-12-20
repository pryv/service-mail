FROM eu.gcr.io/pryvio/base:1.9.0
LABEL maintainer="Pryv<tech@pryv.com>"

# Set main paths that will be reused in this docker file
ARG TARGET_DIR="/app/bin"
ARG CONF_DIR="/app/conf"
ARG LOG_DIR="/app/log"

# Create software dir
RUN mkdir -p $TARGET_DIR
COPY ../../ $TARGET_DIR
RUN chown -R app $TARGET_DIR

# Install the config file
RUN mkdir -p $CONF_DIR
COPY ./build/mail/config/mail.json $CONF_DIR/mail.json

# Create the log
RUN mkdir -p $LOG_DIR
RUN touch $LOG_DIR/mail.log && chown -R app:app $LOG_DIR

# Install the script that runs the api service
RUN mkdir /etc/service/mail
COPY ./build/mail/runit/mail /etc/service/mail/run

WORKDIR $TARGET_DIR
RUN cd $TARGET_DIR; ls $TARGET_DIR
RUN npm ci




# Install sendmail
RUN ["/bin/bash", "-c", "apt-get update && apt-get install -y --no-install-recommends sendmail"]

# Cleanup
RUN apt-get remove -y autoconf automake
RUN apt-get autoremove
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 9000
