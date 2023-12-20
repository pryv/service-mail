SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)

export PRYV_CONF_ROOT=$SCRIPT_FOLDER

# Create default directories
mkdir -p ${PRYV_CONF_ROOT}/pryv/mail/log
sudo chown -R 9999:9999 ${PRYV_CONF_ROOT}/pryv/mail/log 

HOSTNAME=l.rec.la docker-compose -f ${PRYV_CONF_ROOT}/pryv.yml up
