#for local testing/or local docker container
image=docker-image-parus-smart-html
container=docker-container-parus-smart-html
port=3138
#should coming from git commit hash
version=1
REACT_APP_ENV=local

docker image rm $image
docker build -t $image -f Dockerfile .
docker stop $container
docker rm $container
docker run --restart=always --env PORT=80 -d -p $port:80 --name $container $image