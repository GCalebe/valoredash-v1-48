Last login: Thu Aug 14 22:35:20 2025 from 187.59.68.130
root@comercial247:~# docker ps -a | grep valoredash
root@comercial247:~# df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            3.9G     0  3.9G   0% /dev
tmpfs           795M  1.7M  793M   1% /run
/dev/sda1        97G  7.3G   90G   8% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/loop0       64M   64M     0 100% /snap/core20/2582
/dev/loop2       92M   92M     0 100% /snap/lxd/32662
/dev/loop1       64M   64M     0 100% /snap/core20/2599
/dev/loop4       51M   51M     0 100% /snap/snapd/24718
/dev/loop3       50M   50M     0 100% /snap/snapd/24792
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/8892c0bd91e0c7f342ced62266
3e673c3476fe3f28ab264acabb4/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/fac19fe9a95c114ed97c529c45
7a2cf6dcb94fa96c4306c280efa/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/8755b065a5e21521587697fb1d
a4524e850337b933c5d06e5f217/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/feebcb48651a21f3b6c38666bb
b3b6931b560b54717fa12ff3372/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/1dfe2a2e424fc56df05806908d
91335594382d51bf37fc09d6748/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/f9b5c01ebb9dacf4c6e2ccc4e9
7aa738e902091edb0a5c3c72d71/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/751d4adb624d94e78f49f3e68c
f0307b21cd2ef8924bf4c68bd72/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/0eb3138c153aa0fc1907c32f19
b38a183c8ce5b5cfbfcc9817fc7/merged
overlay          97G  7.3G   90G   8% /var/lib/docker/overlay2/682a312be1359c31eec5497b55
b044d8ae1e511acd456a1087b9f/merged
tmpfs           795M     0  795M   0% /run/user/0
root@comercial247:~# free -h
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       1.0Gi       4.6Gi        51Mi       2.1Gi       6.4Gi
Swap:            0B          0B          0B
root@comercial247:~# curl -I https://github.com/GCalebe/valoredash-v1-48.git
HTTP/2 301
date: Fri, 15 Aug 2025 01:59:25 GMT
content-type: text/html
content-length: 162
location: https://github.com/GCalebe/valoredash-v1-48
server: github.com
x-frame-options: DENY
strict-transport-security: max-age=31536000; includeSubDomains; preload
set-cookie: _gh_sess=aDZ4ibG6Mg2SbJpwwaoXKBlgY0pMkvRSiDsuF6qUk9Kuc%2FULTIUK5ts5yig4CUD0c2
cY7FcKFR51Tfnexg39TvxinXZN9jsIpmLkIX3tInMe074H%2B3dvz%2FwYagyViCLln77t1uEvsZ4Mc5RCBUzOyMo
set-cookie: _octo=GH1.1.1117759301.1755223165; Path=/; Domain=github.com; Expires=Sat, 15
set-cookie: logged_in=no; Path=/; Domain=github.com; Expires=Sat, 15 Aug 2026 01:59:25 GM
x-github-request-id: C630:1DDAAF:25225A:2A784C:689E947D

root@comercial247:~# cd /tmp
root@comercial247:/tmp# git clone https://github.com/GCalebe/valoredash-v1-48.git
Cloning into 'valoredash-v1-48'...
remote: Enumerating objects: 6102, done.
remote: Counting objects: 100% (481/481), done.
remote: Compressing objects: 100% (224/224), done.
remote: Total 6102 (delta 346), reused 339 (delta 250), pack-reused 5621 (from 2)
Receiving objects: 100% (6102/6102), 5.77 MiB | 8.19 MiB/s, done.
Resolving deltas: 100% (4109/4109), done.
root@comercial247:/tmp# cd valoredash-v1-48
root@comercial247:/tmp/valoredash-v1-48# ls -la
total 488
drwxr-xr-x 11 root root   4096 Aug 14 23:05 .
drwxrwxrwt 13 root root   4096 Aug 14 23:05 ..
-rw-r--r--  1 root root   1824 Aug 14 23:05 .boltignore
-rw-r--r--  1 root root   1971 Aug 14 23:05 .dockerignore
-rw-r--r--  1 root root   5102 Aug 14 23:05 .env.example
drwxr-xr-x  8 root root   4096 Aug 14 23:05 .git
drwxr-xr-x  3 root root   4096 Aug 14 23:05 .github
-rw-r--r--  1 root root    701 Aug 14 23:05 .gitignore
-rw-r--r--  1 root root    384 Aug 14 23:05 .pre-commit-config.yaml
-rw-r--r--  1 root root   2348 Aug 14 23:05 CLEANUP_SUMMARY.md
-rw-r--r--  1 root root   4892 Aug 14 23:05 DEPLOY_INSTRUCTIONS.md
-rw-r--r--  1 root root  15838 Aug 14 23:05 DOCUMENTACAO_BANCO_DADOS.md
-rw-r--r--  1 root root   1784 Aug 14 23:05 Dockerfile
-rw-r--r--  1 root root   7177 Aug 14 23:05 ESTRUTURA-PROJETO.md
drwxr-xr-x  2 root root   4096 Aug 14 23:05 Prospectar
-rw-r--r--  1 root root   2628 Aug 14 23:05 README.md
drwxr-xr-x  5 root root   4096 Aug 14 23:05 arquivosDisparador
-rw-r--r--  1 root root   1223 Aug 14 23:05 check_knowledge_base.sql
-rw-r--r--  1 root root    414 Aug 14 23:05 components.json
-rw-r--r--  1 root root   1027 Aug 14 23:05 docker-compose.portainer.yml
-rw-r--r--  1 root root    790 Aug 14 23:05 eslint.config.js
-rw-r--r--  1 root root    663 Aug 14 23:05 index.html
drwxr-xr-x  2 root root   4096 Aug 14 23:05 migrations
-rw-r--r--  1 root root   4167 Aug 14 23:05 nginx.conf
-rw-r--r--  1 root root 321422 Aug 14 23:05 package-lock.json
-rw-r--r--  1 root root   3673 Aug 14 23:05 package.json
-rw-r--r--  1 root root     81 Aug 14 23:05 postcss.config.js
drwxr-xr-x  4 root root   4096 Aug 14 23:05 public
drwxr-xr-x  2 root root   4096 Aug 14 23:05 sql
drwxr-xr-x 17 root root   4096 Aug 14 23:05 src
drwxr-xr-x  3 root root   4096 Aug 14 23:05 supabase
-rw-r--r--  1 root root   2899 Aug 14 23:05 tailwind.config.ts
-rw-r--r--  1 root root    652 Aug 14 23:05 tsconfig.app.json
-rw-r--r--  1 root root    381 Aug 14 23:05 tsconfig.json
-rw-r--r--  1 root root    481 Aug 14 23:05 tsconfig.node.json
-rw-r--r--  1 root root    885 Aug 14 23:05 vite.config.ts
-rw-r--r--  1 root root    223 Aug 14 23:05 vitest.config.ts
root@comercial247:/tmp/valoredash-v1-48# ls -la Dockerfile
-rw-r--r-- 1 root root 1784 Aug 14 23:05 Dockerfile
root@comercial247:/tmp/valoredash-v1-48# ls -la docker-compose.portainer.yml
-rw-r--r-- 1 root root 1027 Aug 14 23:05 docker-compose.portainer.yml
root@comercial247:/tmp/valoredash-v1-48# ls -la package.json
-rw-r--r-- 1 root root 3673 Aug 14 23:05 package.json
root@comercial247:/tmp/valoredash-v1-48# docker build -t valoredash-local .
[+] Building 17.9s (16/22)                                                docker:default
 => [internal] load build definition from Dockerfile                                0.0s
 => => transferring dockerfile: 1.82kB                                              0.0s
 => resolve image config for docker-image://docker.io/docker/dockerfile:1           2.3s
 => docker-image://docker.io/docker/dockerfile:1@sha256:38387523653efa0039f8e1c89b  2.1s
 => => resolve docker.io/docker/dockerfile:1@sha256:38387523653efa0039f8e1c89bb74a  0.0s
 => => sha256:b6fc900718559f1a1c6e9880f98381d9c10959a025d5d8dc641a 1.26kB / 1.26kB  0.0s
 => => sha256:fdbb657bc4fdee228c0c20080da3a4cc193ef22c6637ae1210 14.09MB / 14.09MB  1.9s
 => => sha256:38387523653efa0039f8e1c89bb74a30504e76ee9f565e25c9a0 8.40kB / 8.40kB  0.0s
 => => sha256:3946d01fff9c67a3485cddda7fa127b01171827723951a9e372ee7d0 850B / 850B  0.0s
 => => extracting sha256:fdbb657bc4fdee228c0c20080da3a4cc193ef22c6637ae12109c8feba  0.2s
 => [internal] load metadata for docker.io/library/nginx:alpine                     2.2s
 => [internal] load metadata for docker.io/library/node:18-alpine                   2.0s
 => [internal] load .dockerignore                                                   0.0s
 => => transferring context: 2.01kB                                                 0.0s
 => [builder 1/7] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3e  9.0s
 => => resolve docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332  0.0s
 => => sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9 7.67kB / 7.67kB  0.0s
 => => sha256:929b04d7c782f04f615cf785488fed452b6569f87c73ff666ad5 1.72kB / 1.72kB  0.0s
 => => sha256:ee77c6cd7c1886ecc802ad6cedef3a8ec1ea27d1fb96162bf03d 6.18kB / 6.18kB  0.0s
 => => sha256:dd71dde834b5c203d162902e6b8994cb2309ae049a0eabc4ef 40.01MB / 40.01MB  5.9s
 => => sha256:1e5a4c89cee5c0826c540ab06d4b6b491c96eda01837f430bd47 1.26MB / 1.26MB  3.9s
 => => sha256:25ff2da83641908f65c3a74d80409d6b1b62ccfaab220b9ea70b80df 446B / 446B  4.3s
 => => extracting sha256:dd71dde834b5c203d162902e6b8994cb2309ae049a0eabc4efea161b2  2.6s
 => => extracting sha256:1e5a4c89cee5c0826c540ab06d4b6b491c96eda01837f430bd47f0d26  0.1s
 => => extracting sha256:25ff2da83641908f65c3a74d80409d6b1b62ccfaab220b9ea70b80df5  0.0s
 => [production 1/8] FROM docker.io/library/nginx:alpine@sha256:2459838ed006e699c2  4.8s
 => => resolve docker.io/library/nginx:alpine@sha256:2459838ed006e699c252db374550c  0.0s
 => => sha256:2459838ed006e699c252db374550c91490068bbf3b35fa8b9d 10.33kB / 10.33kB  0.0s
 => => sha256:60e48a050b6408d0c5dd59b98b6e36bf0937a0bbe99304e3e9c0 2.50kB / 2.50kB  0.0s
 => => sha256:9824c27679d3b27c5e1cb00a73adb6f4f8d556994111c12db3c5 3.80MB / 3.80MB  1.5s
 => => sha256:403e3f251637881bbdc5fb06df8da55c149c00ccb0addbcb7839fa4a 628B / 628B  1.1s
 => => sha256:4a86014ec6994761b7f3118cf47e4b4fd6bac15fc6fa262c4f 10.78kB / 10.78kB  0.0s
 => => sha256:6bc572a340ecbc60aca0c624f76b32de0b073d5efa4fa1e0b6d9 1.81MB / 1.81MB  1.9s
 => => sha256:9adfbae99cb79774fdc14ca03a0a0154b8c199a69f69316bcfce64b0 955B / 955B  1.6s
 => => extracting sha256:9824c27679d3b27c5e1cb00a73adb6f4f8d556994111c12db3c5d61a0  0.3s
 => => sha256:7a8a46741e18ed98437271669138116163f14596f411c1948fd7836e 405B / 405B  2.0s
 => => sha256:c9ebe2ff2d2cd981811cefb6df49a116da6074c770c07ee86a6a 1.21kB / 1.21kB  2.1s
 => => extracting sha256:6bc572a340ecbc60aca0c624f76b32de0b073d5efa4fa1e0b6d9da640  0.1s
 => => sha256:a992fbc61ecc9d8291c27f9add7b8a07d374c06a435d4734519b 1.40kB / 1.40kB  2.4s
 => => extracting sha256:403e3f251637881bbdc5fb06df8da55c149c00ccb0addbcb7839fa4ad  0.0s
 => => extracting sha256:9adfbae99cb79774fdc14ca03a0a0154b8c199a69f69316bcfce64b07  0.0s
 => => sha256:cb1ff4086f82493a4b8b02ec71bfed092cad25bd5bf302aec7 16.84MB / 16.84MB  3.4s
 => => extracting sha256:7a8a46741e18ed98437271669138116163f14596f411c1948fd7836e3  0.0s
 => => extracting sha256:c9ebe2ff2d2cd981811cefb6df49a116da6074c770c07ee86a6ae2ebe  0.0s
 => => extracting sha256:a992fbc61ecc9d8291c27f9add7b8a07d374c06a435d4734519b63476  0.0s
 => => extracting sha256:cb1ff4086f82493a4b8b02ec71bfed092cad25bd5bf302aec78d49798  1.3s
 => [internal] load build context                                                   0.1s
 => => transferring context: 6.65MB                                                 0.1s
 => [production 2/8] RUN apk add --no-cache curl                                    1.8s
 => [production 3/8] RUN rm /etc/nginx/conf.d/default.conf                          0.7s
 => [production 4/8] COPY nginx.conf /etc/nginx/nginx.conf                          0.1s
 => [builder 2/7] RUN apk add --no-cache git                                        1.2s
 => [builder 3/7] WORKDIR /app                                                      0.0s
 => [builder 4/7] COPY package*.json ./                                             0.0s
 => ERROR [builder 5/7] RUN npm ci                                                  0.7s
------
 > [builder 5/7] RUN npm ci:
0.613 npm error code EUSAGE
0.613 npm error
0.613 npm error The `npm ci` command can only install with an existing package-lock.json or
0.613 npm error npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or
0.613 npm error later to generate a package-lock.json file, then try again.
0.613 npm error
0.613 npm error Clean install a project
0.613 npm error
0.613 npm error Usage:
0.613 npm error npm ci
0.613 npm error
0.613 npm error Options:
0.613 npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
0.613 npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
0.613 npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
0.613 npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
0.613 npm error [--no-bin-links] [--no-fund] [--dry-run]
0.613 npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
0.613 npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
0.613 npm error
0.613 npm error aliases: clean-install, ic, install-clean, isntall-clean
0.613 npm error
0.613 npm error Run "npm help ci" for more info
0.616 npm error A complete log of this run can be found in: /root/.npm/_logs/2025-08-15T02_06_58_409Z-debug-0.log
------
Dockerfile:16
--------------------
  14 |
  15 |     # Instalar dependências
  16 | >>> RUN npm ci
  17 |
  18 |     # Copiar código fonte
--------------------
ERROR: failed to solve: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1
root@comercial247:/tmp/valoredash-v1-48#