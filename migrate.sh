#!/bin/sh
find /usr/local/var/keri/db -mindepth 1 -maxdepth 1 -exec kli migrate run --name {} \;
