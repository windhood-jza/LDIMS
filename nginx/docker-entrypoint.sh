#!/bin/sh
set -e

export DOLLAR=$

echo "---> docker-entrypoint.sh: Script started."
echo "---> docker-entrypoint.sh: Value of HTTPS_ENABLED is [${HTTPS_ENABLED}]"

# 用envsubst生成主配置文件
if [ -f /etc/nginx/templates/nginx.conf.template ]; then
  echo "---> docker-entrypoint.sh: nginx.conf.template found."
  echo "---> docker-entrypoint.sh: Verifying template markers (lines around HTTPS block):"
  grep -C 5 "# START_HTTPS_BLOCK" /etc/nginx/templates/nginx.conf.template || echo "START_HTTPS_BLOCK marker not found or grep failed"
  grep -C 5 "# END_HTTPS_BLOCK" /etc/nginx/templates/nginx.conf.template || echo "END_HTTPS_BLOCK marker not found or grep failed"

  if [ "${HTTPS_ENABLED}" = "true" ]; then
    echo "---> docker-entrypoint.sh: HTTPS_ENABLED is 'true'. Processing full template."
    envsubst < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf
  else
    echo "---> docker-entrypoint.sh: HTTPS_ENABLED is NOT 'true' (it is [${HTTPS_ENABLED}]). Attempting to remove HTTPS block with sed."
    # 如果 HTTPS_ENABLED 不是 true (例如是 false 或未设置)，则移除 HTTPS 配置块
    echo "---> docker-entrypoint.sh: Running sed command with simplified pattern..."
    sed '/# START_HTTPS_BLOCK/,/# END_HTTPS_BLOCK/d' /etc/nginx/templates/nginx.conf.template > /tmp/nginx.conf.processed_by_sed
    echo "---> docker-entrypoint.sh: sed command finished. Content of /tmp/nginx.conf.processed_by_sed follows:"
    cat /tmp/nginx.conf.processed_by_sed
    echo "---> docker-entrypoint.sh: End of /tmp/nginx.conf.processed_by_sed content."
    echo "---> docker-entrypoint.sh: Piping sed output to envsubst..."
    envsubst < /tmp/nginx.conf.processed_by_sed > /etc/nginx/nginx.conf
    echo "---> docker-entrypoint.sh: envsubst finished."
  fi
else
  echo "---> docker-entrypoint.sh: ERROR - nginx.conf.template NOT found!"
fi

# 用envsubst生成 default.conf
if [ -f /etc/nginx/templates/default.conf.template ]; then
  echo "---> docker-entrypoint.sh: default.conf.template found. Processing."
  envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
else
  echo "---> docker-entrypoint.sh: ERROR - default.conf.template NOT found!"
fi

echo "---> docker-entrypoint.sh: Configuration generation finished. Starting Nginx."
# 你可以在这里添加更多模板生成逻辑（如conf.d/*.conf）

# 启动Nginx
nginx -g 'daemon off;' 