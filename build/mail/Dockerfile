FROM pryv/base:1.2.13
MAINTAINER "Tech@Pryv" <tech@pryv.com>

ADD . /pd_build
RUN /pd_build/install.sh

# Fully qualified domain name configuration for sendmail on localhost.
# Without this sendmail will not work.
RUN echo "127.0.0.1 localhost localhost.localdomain $HOSTNAME" >> /etc/hosts

# Ports:
#   9000        mail api
#
EXPOSE 9000

