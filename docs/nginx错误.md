n ready for connections. Bind-address: '::' port: 33060, socket: /var/run/mysqld/mysqlx.sock
ldims_db        | 2025-05-16T02:30:54.031749Z 0 [System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.42'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server - GPL.
ldims_frontend exited with code 1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_worker    |
ldims_nginx     |
ldims_backend   |
ldims_worker    | > ldims-backend@1.0.0 start:worker
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_backend   | > ldims-backend@1.0.0 start
ldims_worker    | > node dist/workers/contentExtractionWorker.js
ldims_nginx     |     set  0;
ldims_backend   | > node dist/app.js
ldims_worker    |
ldims_nginx     |     if ( = "true") {
ldims_backend   |
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_worker    | Redis config loaded: host=redis, port=6379, password provided=true
ldims_nginx     |     if ( = "http") {
ldims_worker    | BullMQ queue 'content-extraction' initialized.
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_worker    | [Worker] Setting up content extraction worker with concurrency: 15
ldims_nginx     |
ldims_worker    | [Worker] Content extraction worker listening to queue 'content-extraction'...
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx exited with code 0
ldims_worker    | Ignoring invalid configuration option passed to Connection: options. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection
ldims_nginx     |     location /api/ {
ldims_worker    | Ignoring invalid configuration option passed to Connection: options. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_worker    | 数据库连接成功
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_backend   | Redis config loaded: host=redis, port=6379, password provided=true
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_backend   | BullMQ queue 'content-extraction' initialized.
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_backend   | [App] ImportService injected into TaskQueueService.
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_backend   | [Router] API router created and mounted.
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_backend   | 服务器运行在端口 3000
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_backend   | Ignoring invalid configuration option passed to Connection: options. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_backend   | Ignoring invalid configuration option passed to Connection: options. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection
ldims_nginx     |     ssl_session_timeout 10m;
ldims_backend   | Ignoring invalid configuration option passed to Connection: options. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_backend   | 数据库连接成功
ldims_nginx     |     ssl_session_tickets off;
ldims_backend   | 数据库连接成功
ldims_nginx     |     ssl_stapling on;
ldims_backend   | 初始化数据库连接成功
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx exited with code 0
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx exited with code 1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx exited with code 1
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     | map   {
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx exited with code 1
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     | }
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_frontend  | 2025/05/16 02:31:00 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     # 安全头部
ldims_nginx     | set  "false";
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:31:00 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     | server {
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     listen 80;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend exited with code 1
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | map   {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     default upgrade;
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     |         # WebSocket支持
ldims_nginx     | }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | map   {
ldims_nginx     | set  "false";
ldims_nginx exited with code 1
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     '' close;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     | server {
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     |     listen 80;
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     set  0;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | server {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |
ldims_nginx     |     listen 80;
ldims_nginx     |         set  1;
ldims_nginx     |     # SSL配置
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     set  0;
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         set  1;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         set  "1";
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     }
ldims_nginx     |     location / {
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # 安全头部
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     location / {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     }
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     }
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | server {
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     }
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     | map   {
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     | }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     # 安全头部
ldims_nginx     | set  "false";
ldims_nginx     | map   {
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx exited with code 1
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     | server {
ldims_nginx     | }
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     listen 80;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     # 安全头部
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     location / {
ldims_nginx     |     set  0;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     if ( = "true") {
ldims_nginx     | server {
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  1;
ldims_nginx     |     listen 80;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         set  "1";
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     }
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | map   {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     default upgrade;
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |     '' close;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | map   {
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     default upgrade;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     |         # WebSocket支持
ldims_nginx     | }
ldims_nginx     | server {
ldims_nginx     | }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |     listen 80;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     set  0;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     | server {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |     listen 80;
ldims_nginx     |         set  1;
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | server {
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     set  0;
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |
ldims_nginx     |         set  1;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     # SSL配置
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |         set  "1";
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     }
ldims_nginx     |     location / {
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         return 301 https://;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # 安全头部
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     location / {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     }
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     location / {
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | map   {
ldims_nginx exited with code 1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_nginx     | }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | set  "false";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     }
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     listen 80;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     | map   {
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     default upgrade;
ldims_nginx     |     set  0;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     '' close;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     | }
ldims_nginx     |         set  1;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_frontend exited with code 1
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     if ( = "http") {
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     # 安全头部
ldims_nginx     | set  "false";
ldims_nginx     |         set  "1";
ldims_nginx     | map   {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     default upgrade;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     '' close;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     | server {
ldims_nginx     |         return 301 https://;
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     listen 80;
ldims_nginx     |     }
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     # 安全头部
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     | set  "false";
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:30:44 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     location / {
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | server {
ldims_frontend  | 2025/05/16 02:30:44 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     listen 80;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     location / {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     set  0;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         set  1;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     if ( = "http") {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  "1";
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_frontend  | 2025/05/16 02:30:45 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "11") {
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         return 301 https://;
ldims_frontend  | 2025/05/16 02:30:45 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     }
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     }
ldims_frontend  | 2025/05/16 02:30:46 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | server {
ldims_nginx     |
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |
ldims_nginx     | map   {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | 2025/05/16 02:30:46 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     default upgrade;
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     location /api/ {
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     }
ldims_nginx     |     '' close;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # SSL配置
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     | map   {
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     default upgrade;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     '' close;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         # WebSocket支持
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     | }
ldims_nginx     | server {
ldims_nginx     | }
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |
ldims_nginx     |     listen 80;
ldims_nginx     |
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | 2025/05/16 02:30:47 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | 2025/05/16 02:30:47 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     set  0;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     }
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | server {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     listen 80;
ldims_nginx     |         set  1;
ldims_nginx     |     # SSL配置
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     | server {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     listen 443 ssl http2;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     set  0;
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         set  1;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # SSL配置
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     location / {
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     if ( = "http") {
ldims_nginx     |
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_frontend  | 2025/05/16 02:30:48 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         set  "1";
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     }
ldims_nginx     |     location / {
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_frontend  | 2025/05/16 02:30:48 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         return 301 https://;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |
ldims_nginx     |     ssl_stapling on;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     location / {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     ssl_stapling_verify on;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     }
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # 安全头部
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_frontend  | 2025/05/16 02:30:50 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_frontend  | 2025/05/16 02:30:50 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 主页面路由到前端
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:30:53 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     |     location /api/ {
ldims_frontend  | 2025/05/16 02:30:53 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_nginx     | }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     }
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | set  "false";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     | server {
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     }
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     listen 80;
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |
ldims_nginx     | map   {
ldims_nginx exited with code 1
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     # SSL配置
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     | map   {
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:31:00 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     default upgrade;
ldims_nginx     |     set  0;
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     '' close;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_frontend  | 2025/05/16 02:31:00 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |     ssl_stapling on;
ldims_nginx     | }
ldims_nginx     |         set  1;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     if ( = "http") {
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     | set  "false";
ldims_nginx     |         set  "1";
ldims_nginx     | map   {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     default upgrade;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     | server {
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     '' close;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     listen 80;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     | server {
ldims_nginx     |         return 301 https://;
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     listen 80;
ldims_nginx     |     }
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     # 安全头部
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     | set  "false";
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     set  0;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:31:14 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     location / {
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | server {
ldims_frontend  | 2025/05/16 02:31:14 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     listen 80;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # SSL配置
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | map   {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     default upgrade;
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |     }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         # WebSocket支持
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | server {
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | set  "false";
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     | server {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     | server {
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     | }
ldims_nginx     |     listen 80;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     # SSL配置
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     | server {
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     set  0;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # SSL配置
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     location / {
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     # 安全头部
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         return 301 https://;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     }
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     location / {
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     location / {
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         # WebSocket支持
ldims_nginx     | }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | set  "false";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     }
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     listen 80;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     | map   {
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     # SSL配置
ldims_nginx     |     default upgrade;
ldims_nginx     | map   {
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     '' close;
ldims_nginx     |     default upgrade;
ldims_nginx     |     set  0;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | }
ldims_nginx     |     '' close;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |         set  1;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | set  "false";
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     if ( = "http") {
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |         set  "1";
ldims_nginx     | map   {
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     | server {
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     listen 80;
ldims_nginx     | server {
ldims_nginx     |         return 301 https://;
ldims_nginx     | }
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     listen 80;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     # 安全头部
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     | set  "false";
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     set  0;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  1;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | server {
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     listen 80;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location / {
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend exited with code 1
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | server {
ldims_nginx     |
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     location /api/ {
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # SSL配置
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | 2025/05/16 02:30:44 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | map   {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     default upgrade;
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:30:44 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |     }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         # WebSocket支持
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | server {
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     | set  "false";
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     | server {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     | server {
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     listen 80;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     # SSL配置
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     | server {
ldims_frontend  | 2025/05/16 02:30:45 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     listen 443 ssl http2;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     set  0;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | 2025/05/16 02:30:45 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |
ldims_nginx     |
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # SSL配置
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     location / {
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     # 安全头部
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         return 301 https://;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     }
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |
ldims_nginx     |     ssl_stapling on;
ldims_frontend  | 2025/05/16 02:30:46 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     location / {
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     ssl_stapling_verify on;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:30:46 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # 安全头部
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     location / {
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 主页面路由到前端
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | 2025/05/16 02:30:47 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | 2025/05/16 02:30:47 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     |     location /api/ {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         # WebSocket支持
ldims_nginx     | }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | set  "false";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | 2025/05/16 02:30:48 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | server {
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     }
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_frontend  | 2025/05/16 02:30:48 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     listen 80;
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | 2025/05/16 02:30:59 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |
ldims_nginx     | map   {
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     # SSL配置
ldims_nginx     |     default upgrade;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     '' close;
ldims_nginx     |     set  0;
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | }
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |         set  1;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     }
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | set  "false";
ldims_nginx     |     if ( = "http") {
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     | map   {
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     |     default upgrade;
ldims_frontend  | 2025/05/16 02:30:50 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     | server {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     '' close;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     listen 80;
ldims_nginx     |         return 301 https://;
ldims_nginx     | }
ldims_frontend  | 2025/05/16 02:30:50 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     # 安全头部
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     | set  "false";
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     set  0;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | server {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     listen 80;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |     set  0;
ldims_frontend  | 2025/05/16 02:30:53 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         set  1;
ldims_frontend  | 2025/05/16 02:30:53 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     if ( = "http") {
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  "1";
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "11") {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         return 301 https://;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_frontend  | 2025/05/16 02:31:00 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | 2025/05/16 02:31:00 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | server {
ldims_nginx     | map   {
ldims_nginx exited with code 1
ldims_nginx     |
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     '' close;
ldims_nginx     |     location /api/ {
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     | 2025/05/16 02:30:59 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | set  "false";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | 2025/05/16 02:31:14 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | map   {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     default upgrade;
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:31:14 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     listen 80;
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | server {
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     | set  "false";
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     set  0;
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     | server {
ldims_nginx     |     # SSL配置
ldims_nginx     |     # 安全头部
ldims_nginx     |         set  1;
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     listen 80;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     }
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  "1";
ldims_nginx     | server {
ldims_frontend  | 2025/05/16 02:31:40 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |     listen 443 ssl http2;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     set  0;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | 2025/05/16 02:31:40 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |     # SSL配置
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         return 301 https://;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     }
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     location / {
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | }
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     '' close;
ldims_nginx     | server {
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     # SSL配置
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     }
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |
ldims_nginx     | server {
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | server {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     listen 80;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     # SSL配置
ldims_nginx     |     default upgrade;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     '' close;
ldims_nginx     |     set  0;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | }
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     }
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     | 2025/05/16 02:30:59 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | set  "false";
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     # 安全头部
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     | map   {
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     | server {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     listen 80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     | }
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     # 安全头部
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     | set  "false";
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     set  0;
ldims_nginx     |     location / {
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | server {
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     listen 80;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     set  0;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  "1";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | server {
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     '' close;
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | 2025/05/16 02:31:01 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | set  "false";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     listen 80;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | server {
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     set  0;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_nginx     |     # SSL配置
ldims_nginx     |     # 安全头部
ldims_nginx     |         set  1;
ldims_nginx     | }
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  "1";
ldims_nginx     | server {
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # 安全头部
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | 2025/05/16 02:30:59 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     '' close;
ldims_nginx     | server {
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     # SSL配置
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | server {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         # WebSocket支持
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     listen 80;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     |     set  0;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | }
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     | 2025/05/16 02:31:01 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | set  "false";
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     # 安全头部
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     | map   {
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     default upgrade;
ldims_nginx     | server {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     '' close;
ldims_nginx     |     listen 80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     | }
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     | set  "false";
ldims_nginx     |     set  0;
ldims_nginx     |     location / {
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | server {
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     listen 80;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |     set  0;
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         set  1;
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     location /api/ {
ldims_nginx     |     }
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         return 301 https://;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | server {
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     '' close;
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | set  "false";
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | server {
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     listen 80;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | server {
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     set  0;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     }
ldims_nginx     |     # SSL配置
ldims_nginx     |     # 安全头部
ldims_nginx     |         set  1;
ldims_nginx     | }
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  "1";
ldims_nginx     | server {
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # 安全头部
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | 2025/05/16 02:31:01 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     '' close;
ldims_nginx     | server {
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     # SSL配置
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | server {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         # WebSocket支持
ldims_nginx     | 2025/05/16 02:30:59 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     listen 80;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |
ldims_nginx     |     '' close;
ldims_nginx     |     set  0;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     | }
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     | 2025/05/16 02:31:05 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | set  "false";
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     # 安全头部
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | server {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     listen 80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     set  0;
ldims_nginx     |     location / {
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     location /api/ {
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | server {
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     default upgrade;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     '' close;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | set  "false";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     listen 80;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | server {
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     set  0;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     # SSL配置
ldims_nginx     |     # 安全头部
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | 2025/05/16 02:31:05 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     '' close;
ldims_nginx     | server {
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     # SSL配置
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     }
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | server {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     | 2025/05/16 02:31:01 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     listen 80;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     default upgrade;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     '' close;
ldims_nginx     |     set  0;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     | }
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     # 安全头部
ldims_nginx     |
ldims_nginx     |         set  "1";
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     }
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | server {
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     listen 80;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     }
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     set  0;
ldims_nginx     |     location / {
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     location /api/ {
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | server {
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     default upgrade;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     '' close;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     | }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     # SSL配置
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | set  "false";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     listen 80;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | server {
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     set  0;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     # SSL配置
ldims_nginx     |     # 安全头部
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |
ldims_nginx     |         return 301 https://;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | 2025/05/16 02:31:12 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |         # WebSocket支持
ldims_nginx     | server {
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     | 2025/05/16 02:31:05 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | map   {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     | }
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     # 安全头部
ldims_nginx     |
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | server {
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     listen 80;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     set  0;
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | 2025/05/16 02:30:59 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     '' close;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | }
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |     listen 80;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     set  0;
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     # SSL配置
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     location / {
ldims_nginx     |
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location / {
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |         # WebSocket支持
ldims_nginx     |
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |         # WebSocket支持
ldims_nginx     | server {
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     | 2025/05/16 02:31:12 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     | map   {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     default upgrade;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     '' close;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     | }
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |     # 安全头部
ldims_nginx     |
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     | server {
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     listen 80;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     set  0;
ldims_nginx     |     location / {
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         set  1;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         set  "1";
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |     }
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     }
ldims_nginx     |         return 301 https://;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     location / {
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |
ldims_nginx     |     location /api/ {
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |     }
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     | 2025/05/16 02:31:01 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     | map   {
ldims_nginx     |
ldims_nginx     |     default upgrade;
ldims_nginx     |         # WebSocket支持
ldims_nginx     |     '' close;
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     | }
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     |
ldims_nginx     | set  "false";
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_nginx     |     }
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | }
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |     listen 80;
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     | server {
ldims_nginx     |
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |     set  0;
ldims_nginx     |
ldims_nginx     |     if ( = "true") {
ldims_nginx     |     # SSL配置
ldims_nginx     |         set  1;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     if ( = "http") {
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |         set  "1";
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     }
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     if ( = "11") {
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |         return 301 https://;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     }
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_frontend exited with code 1
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |     location / {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     # 安全头部
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |     }
ldims_frontend  | 2025/05/16 02:30:44 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |
ldims_nginx     |
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | 2025/05/16 02:30:44 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     location / {
ldims_nginx     |     location /api/ {
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     }
ldims_nginx     |         # WebSocket支持
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | 2025/05/16 02:30:45 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | 2025/05/16 02:30:45 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |     }
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         # WebSocket支持
ldims_nginx     | server {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |     listen 443 ssl http2;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     }
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_frontend  | 2025/05/16 02:30:46 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | 2025/05/16 02:31:25 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_frontend  | 2025/05/16 02:30:46 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     ssl_session_timeout 10m;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     ssl_session_tickets off;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     ssl_stapling on;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     ssl_stapling_verify on;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     # 安全头部
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_frontend  | 2025/05/16 02:30:47 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_frontend  | 2025/05/16 02:30:47 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     # 主页面路由到前端
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     location / {
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:30:48 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     location /api/ {
ldims_frontend  | 2025/05/16 02:30:48 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         # WebSocket支持
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:30:50 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     }
ldims_frontend  | 2025/05/16 02:30:50 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | } --- End of Nginx Conf ---
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | 2025/05/16 02:31:05 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     | map   {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     default upgrade;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     '' close;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     | set  "false";
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |
ldims_frontend  | 2025/05/16 02:30:53 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     | server {
ldims_frontend  | 2025/05/16 02:30:53 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     listen 80;
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |     set  0;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     if ( = "true") {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         set  1;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |     }
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     if ( = "http") {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         set  "1";
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     }
ldims_frontend  | 2025/05/16 02:31:00 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     if ( = "11") {
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         return 301 https://;
ldims_frontend  | 2025/05/16 02:31:00 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     }
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |     location / {
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     }
ldims_frontend  | 2025/05/16 02:31:14 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     # API路由代理到后端服务
ldims_frontend  | 2025/05/16 02:31:14 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     location /api/ {
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |         proxy_set_header Host ;
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |         # WebSocket支持
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |         proxy_http_version 1.1;
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |         proxy_set_header Connection ;
ldims_frontend  | 2025/05/16 02:31:40 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |         client_max_body_size 15M;
ldims_frontend  | 2025/05/16 02:31:40 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     }
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     | }
ldims_frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
ldims_nginx     | server {
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
ldims_nginx     |     listen 443 ssl http2;
ldims_frontend  | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
ldims_nginx     |     server_name 10.1.2.239;
ldims_frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
ldims_nginx     |
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
ldims_nginx     |     # SSL配置
ldims_frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_frontend  | 2025/05/16 02:32:33 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_frontend  | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:12
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_frontend  | 2025/05/16 02:32:33 [emerg] 1#1: the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_frontend  | nginx: [emerg] the closing bracket in "PORT" variable is missing in /etc/nginx/conf.d/default.conf:45
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:12 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:25 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:52 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx exited with code 1
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }


ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)

ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:30:55 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:30:56 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:30:57 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:30:58 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:30:59 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:01 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;




ldims_nginx     |     if ( = "true") {

ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:05 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:12 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:25 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:31:52 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | map   {
ldims_nginx     |     default upgrade;
ldims_nginx     |     '' close;
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # 初始化环境变量到Nginx变量
ldims_nginx     | set  "false";
ldims_nginx     |
ldims_nginx     | # 重定向HTTP到HTTPS (如果HTTPS_ENABLED=true)
ldims_nginx     | server {
ldims_nginx     |     listen 80;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # 如果启用了HTTPS，则将所有HTTP流量重定向到HTTPS
ldims_nginx     |     set  0;
ldims_nginx     |     if ( = "true") {
ldims_nginx     |         set  1;
ldims_nginx     |     }
ldims_nginx     |     if ( = "http") {
ldims_nginx     |         set  "1";
ldims_nginx     |     }
ldims_nginx     |     if ( = "11") {
ldims_nginx     |         return 301 https://;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # 如果未启用HTTPS，则直接提供HTTP内容
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | }
ldims_nginx     |
ldims_nginx     | # HTTPS服务器配置 (仅当HTTPS_ENABLED=true时有效)
ldims_nginx     | server {
ldims_nginx     |     listen 443 ssl http2;
ldims_nginx     |     server_name 10.1.2.239;
ldims_nginx     |
ldims_nginx     |     # SSL配置
ldims_nginx     |     ssl_certificate /etc/nginx/ssl/fullchain.pem;
ldims_nginx     |     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ldims_nginx     |     ssl_protocols TLSv1.2 TLSv1.3;
ldims_nginx     |     ssl_prefer_server_ciphers off;
ldims_nginx     |     ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
ldims_nginx     |     ssl_session_timeout 10m;
ldims_nginx     |     ssl_session_cache shared:SSL:10m;
ldims_nginx     |     ssl_session_tickets off;
ldims_nginx     |     ssl_stapling on;
ldims_nginx     |     ssl_stapling_verify on;
ldims_nginx     |
ldims_nginx     |     # 安全头部
ldims_nginx     |     add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
ldims_nginx     |     add_header X-Frame-Options DENY always;
ldims_nginx     |     add_header X-Content-Type-Options nosniff always;
ldims_nginx     |     add_header X-XSS-Protection "1; mode=block" always;
ldims_nginx     |     add_header Referrer-Policy "same-origin" always;
ldims_nginx     |
ldims_nginx     |     # 主页面路由到前端
ldims_nginx     |     location / {
ldims_nginx     |         proxy_pass http://frontend:80;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     |
ldims_nginx     |     # API路由代理到后端服务
ldims_nginx     |     location /api/ {
ldims_nginx     |         proxy_pass http://backend:3000;
ldims_nginx     |         proxy_set_header Host ;
ldims_nginx     |         proxy_set_header X-Real-IP ;
ldims_nginx     |         proxy_set_header X-Forwarded-For ;
ldims_nginx     |         proxy_set_header X-Forwarded-Proto ;
ldims_nginx     |
ldims_nginx     |         # WebSocket支持
ldims_nginx     |         proxy_http_version 1.1;
ldims_nginx     |         proxy_set_header Upgrade ;
ldims_nginx     |         proxy_set_header Connection ;
ldims_nginx     |
ldims_nginx     |         client_max_body_size 15M;
ldims_nginx     |     }
ldims_nginx     | } --- End of Nginx Conf ---
ldims_nginx     | 2025/05/16 02:32:45 [emerg] 1#1: invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1
ldims_nginx     | nginx: [emerg] invalid number of arguments in "map" directive in /etc/nginx/conf.d/default.conf:1