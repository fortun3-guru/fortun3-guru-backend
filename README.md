<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Event Relayer สำหรับ Smart Contract

ระบบนี้รวมถึง Event Relayer ที่ใช้สำหรับติดตาม event จาก smart contract โดยใช้ ethers.js v5 และบันทึกข้อมูลไปยัง Firebase Firestore

### ความสามารถหลัก:

- **รองรับหลาย Blockchain (Multichain)**: สามารถเชื่อมต่อและติดตาม event จากหลายเครือข่าย blockchain พร้อมกัน
- **ติดตาม Event แบบ Real-time**: ตรวจจับ event ทันทีที่เกิดขึ้นบน blockchain
- **ค้นหา Event ย้อนหลัง**: สามารถค้นหา event ที่เกิดขึ้นก่อนหน้าผ่าน API endpoint
- **บันทึกข้อมูลอัตโนมัติ**: บันทึกข้อมูล event ลงใน Firestore collection โดยอัตโนมัติ

ระบบนี้มี Event Listener 2 ตัว:

1. **ConsultPaid Event Listener**: ตรวจจับ event `ConsultPaid` และบันทึกลงคอลเลกชัน `fortunes`
2. **MintingPaid Event Listener**: ตรวจจับ event `MintingPaid` และบันทึกลงคอลเลกชัน `nfts`

### การตั้งค่า:

1. กำหนดค่า Blockchain Networks และ Contract Addresses ใน `.env.local` ไฟล์:

```
# Ethereum Mainnet
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
ETHEREUM_CONTRACT_ADDRESS=0xYourContractAddress

# BSC Mainnet
BSC_RPC_URL=https://bsc-dataseed.binance.org
BSC_CONTRACT_ADDRESS=0xYourContractAddress

# Polygon Mainnet
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_CONTRACT_ADDRESS=0xYourContractAddress

# Sepolia Testnet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-infura-key
SEPOLIA_CONTRACT_ADDRESS=0xYourContractAddress

# Base Testnet
BASE_TESTNET_RPC_URL=https://goerli.base.org
BASE_TESTNET_CONTRACT_ADDRESS=0xYourContractAddress
```

ระบบจะใช้ NestJS ConfigService เพื่อจัดการค่า configuration ที่กำหนดไว้

### การใช้งาน API:

#### ค้นหา ConsultPaid Event ย้อนหลัง:

```
POST /blockchain/query-consult-events
Body: {
  "fromBlock": 1000000,
  "toBlock": "latest"
}
```

#### ค้นหา MintingPaid Event ย้อนหลัง:

```
POST /blockchain/query-minting-events
Body: {
  "fromBlock": 1000000,
  "toBlock": "latest"
}
```

### โครงสร้างข้อมูลใน Firestore:

#### Collection: fortunes (ConsultPaid Events)

```
{
  "walletAddress": "0x...",       // ที่อยู่กระเป๋าที่จ่ายเงิน
  "receiptId": "123",             // ID ใบเสร็จจาก event
  "used": false,                  // สถานะการใช้งาน
  "blockNumber": 1000000,         // หมายเลข block ที่เกิด event
  "txHash": "0x...",              // hash ของธุรกรรม
  "network": "ethereum",          // ชื่อเครือข่าย blockchain
  "chainId": 1,                   // Chain ID ของเครือข่าย
  "blockExplorer": "https://etherscan.io", // URL ของ block explorer
  "createdAt": Timestamp          // เวลาที่บันทึกข้อมูล
}
```

#### Collection: nfts (MintingPaid Events)

```
{
  "walletAddress": "0x...",       // ที่อยู่กระเป๋าที่จ่ายเงิน
  "receiptId": "123",             // ID ใบเสร็จจาก event
  "used": false,                  // สถานะการใช้งาน
  "blockNumber": 1000000,         // หมายเลข block ที่เกิด event
  "txHash": "0x...",              // hash ของธุรกรรม
  "network": "ethereum",          // ชื่อเครือข่าย blockchain
  "chainId": 1,                   // Chain ID ของเครือข่าย
  "blockExplorer": "https://etherscan.io", // URL ของ block explorer
  "createdAt": Timestamp          // เวลาที่บันทึกข้อมูล
}
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
