#!/bin/bash
echo 'run after_install.sh: ' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
echo 'cd /home/ec2-user/w3g-project/NestJs-REST-API/' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
cd /home/ec2-user/w3g-project/NestJs-REST-API >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
echo 'npm install' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
npm i --legacy-peer-deps >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
echo 'pm2 stop w3g-server' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
sudo pm2 stop w3g-server >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
echo 'npm build' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
npm run build >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
echo 'pm2 start w3g-server' >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
sudo pm2 start w3g-server >> /home/ec2-user/w3g-project/NestJs-REST-API/deploy.log
