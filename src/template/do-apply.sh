#!/bin/bash

set -e

chmod +x /tmp/apply-scripts-cache/*.sh
ls -1 /tmp/apply-scripts-cache/* | bash 

# Clean up
apt-get autoremove -y
apt-get clean -y
rm -rf /var/lib/apt/lists/*