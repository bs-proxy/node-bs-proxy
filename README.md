# node-cr-proxy
[![licence](https://img.shields.io/aur/license/yaourt.svg?style=flat)](https://github.com/bs-proxy/node-bs-proxy/blob/master/LICENSE)

Brawl Stars Proxy - Intercepts the traffic between your Brawl Stars App and their servers, decrypts the protocol and decodes the messages.
Please note this is based on https://github.com/royale-proxy/node-cr-proxy

## How to use it?

### Setting up the proxy server

#### Prerequisites
* Install [nodejs](https://nodejs.org/en) (>=6.8.0)
* Install [node-gyp](https://github.com/nodejs/node-gyp)

#### Clone the code

`git clone https://github.com/bs-proxy/node-bs-proxy && cd node-bs-proxy`

`npm install`
  
### Setting up your device

#### iPhone
  * Please use a dns to link the traffic to this proxy.

#### Running the proxy

  `node index`

  `node index --verbose` will display the contents of the messages on the screen as well as show debug info when messages are missing/incomplete
  
  `node index --dump ./packets` will save decrypted packets into the packets folder with a format of messageId/messageId.bin & txt (ex: 10101/10101.bin & 10101/10101.txt) -- Make sure the folder exists. The txt is the hex dump where as the .bin is a buffer dump.
  
  `node index --replay ./packets/10101/10101.bin` will decode the 10101 packet using definitions, useful when trying to decode a new message
  
  `node index --help` will show you the command line help
  
## What's the status?

This is a work in progress, but the proxy is pretty much complete. We do need help defining the network messages, so head over to [bs-messages](https://github.com/bs-proxy/bs-messages), clone and contribute!
