#!/bin/bash
echo 'run application_start.sh: ' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
echo 'pm2 restart  w3g-server' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
sudo pm2 restart  w3g-server >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
sudo pm2 save >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log