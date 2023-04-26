if [[ -d .git ]] && [[ 1 == "1" ]]; then
	git pull; 
fi; 

if [[ ! -z ${NODE_PACKAGES} ]]; then 
	/usr/local/bin/npm install ${NODE_PACKAGES}; 
fi; 

if [[ ! -z ${UNNODE_PACKAGES} ]]; then
	/usr/local/bin/npm uninstall ${UNNODE_PACKAGES};
fi; 

if [ -f /home/container/package.json ]; then
	/usr/local/bin/npm install; 
fi; 

/usr/local/bin/npm run build;
/usr/local/bin/npm run start; 
