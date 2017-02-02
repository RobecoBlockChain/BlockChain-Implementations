@ECHO OFF

START "Robeco Node 1" geth --ipcdisable --port 30301 --rpc --rpcapi "db,eth,net,web3" --rpccorsdomain "*" --datadir ".\robecochain_a" --identity "RobecoNode1" >a.log 2>&1

PING 1.1.1.1 -n 1 -w 10000 >NUL

START "Robeco Node 1 Console" geth attach

geth --ipcdisable --port 30302 --datadir ".\robecochain_b" --identity "RobecoNode2" >b.log 2>&1


