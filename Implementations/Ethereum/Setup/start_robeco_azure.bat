@ECHO OFF

START "Robeco Azure Chain" geth --verbosity 6 --datadir ".\robecochain_azure" --networkid 11110000 --nodiscover --port 30303 --rpc --rpcport 8545 >azure.log 

PING 1.1.1.1 -n 1 -w 10000 >NUL
START "Robeco Azure Chain - Console" geth attach

:: --bootnodes enode://51d35036ff2da5a390b8de3cdce647b8059962631f4d374a5589b3722e3f7eb64801dfafc59981eef1313bfb7ad8fdad51b207de1d3f29dd59c4cc7f57172baf@40.68.223.124:30303,enode://31627b46a10ae5c2d15a1fa98d43dbddb19a0adfa1d9e9a046c7dbc90ac25a643728a6802299db16cf17f6b4d9d28061b07018207d09abdc70070ed3f50b724d@40.68.223.124:30303

::START "Robeco Node A" geth --datadir ".\robecochain_a" --networkid 12345 --ipcdisable --nodiscover --port 30305 --rpcport 8545 console >a.log 2>&1

:: START "Robeco Node A" geth --networkid 12345 --port 30305 --rpc --rpcport 8545 --rpcapi "db,eth,net,web3" --rpccorsdomain "*" --datadir ".\robecochain_a" --identity "RobecoNodeA" console  >a.log 2>&1
:: PING 1.1.1.1 -n 1 -w 10000 >NUL
:: START "Robeco Node A - Console" geth attach


