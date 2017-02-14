@ECHO OFF

START "Robeco Node A" geth --datadir ".\robecochain_a" --networkid 12345 --ipcdisable --port 30305 --rpc --rpcport 8545 console >a.log 2>&1


::START "Robeco Node A" geth --datadir ".\robecochain_a" --networkid 12345 --ipcdisable --nodiscover --port 30305 --rpcport 8545 console >a.log 2>&1

:: START "Robeco Node A" geth --networkid 12345 --port 30305 --rpc --rpcport 8545 --rpcapi "db,eth,net,web3" --rpccorsdomain "*" --datadir ".\robecochain_a" --identity "RobecoNodeA" console  >a.log 2>&1
:: PING 1.1.1.1 -n 1 -w 10000 >NUL
:: START "Robeco Node A - Console" geth attach


