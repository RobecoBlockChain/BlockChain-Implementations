@ECHO OFF

START "Robeco Node B" geth --datadir ".\robecochain_b" --networkid 12345 --ipcdisable --port 30306 --rpc --rpcport 8546 console >b.log 2>&1

::START "Robeco Node B" geth --datadir ".\robecochain_b" --networkid 12345 --ipcdisable --nodiscover --port 30306 --rpcport 8546 console >b.log 2>&1

::START "Robeco Node B" geth --networkid 12345 --port 30306 --rpc --rpcport 8546 --rpcapi "db,eth,net,web3" --rpccorsdomain "*" --datadir ".\robecochain_b" --identity "RobecoNodeB" console >b.log 2>&1
:: PING 1.1.1.1 -n 1 -w 10000 >NUL
:: START "Robeco Node B - Console" geth attach
