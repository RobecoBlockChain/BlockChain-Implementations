@ECHO OFF

START "Ethereum Node" geth --fast --rpc --rpcapi "db,eth,net,web3" --rpccorsdomain "*"

PING 1.1.1.1 -n 1 -w 10000 >NUL

START "Ethereum Console" geth attach