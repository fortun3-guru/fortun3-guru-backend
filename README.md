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

ระบบนี้รวมถึง Event Relayer ที่ใช้สำหรับติดตาม event `ConsultPaid` จาก smart contract โดยใช้ ethers.js v5 และบันทึกข้อมูลไปยัง Firebase Firestore

### ความสามารถหลัก:

- **รองรับหลาย Blockchain (Multichain)**: สามารถเชื่อมต่อและติดตาม event จากหลายเครือข่าย blockchain พร้อมกัน
- **ติดตาม Event แบบ Real-time**: ตรวจจับ event `ConsultPaid` ทันทีที่เกิดขึ้นบน blockchain
- **ค้นหา Event ย้อนหลัง**: สามารถค้นหา event ที่เกิดขึ้นก่อนหน้าผ่าน API endpoint
- **บันทึกข้อมูลอัตโนมัติ**: บันทึกข้อมูล event ลงใน Firestore collection ชื่อ `fortunes` โดยอัตโนมัติ

### การตั้งค่า:

1. กำหนดค่า Blockchain Networks และ Contract Addresses ใน `.env.local` ไฟล์:

```
BLOCKCHAIN_NETWORKS={"ethereum":"https://mainnet.infura.io/v3/YOUR_INFURA_KEY","bsc":"https://bsc-dataseed.binance.org"}
CONTRACT_ADDRESSES={"ethereum":"0xYourContractAddress","bsc":"0xYourContractAddress"}
```

### การใช้งาน API:

#### ค้นหา Event ย้อนหลัง:

```
POST /blockchain/query-events
Body: {
  "fromBlock": 1000000,
  "toBlock": "latest"
}
```

### โครงสร้างข้อมูลใน Firestore:

ข้อมูล event จะถูกบันทึกในคอลเลกชั่น `fortunes` ด้วยโครงสร้างดังนี้:

```
{
  "walletAddress": "0x...",       // ที่อยู่กระเป๋าที่จ่ายเงิน
  "receiptId": "123",             // ID ใบเสร็จจาก event
  "used": false,                  // สถานะการใช้งาน
  "blockNumber": 1000000,         // หมายเลข block ที่เกิด event
  "txHash": "0x...",              // hash ของธุรกรรม
  "network": "ethereum",          // ชื่อเครือข่าย blockchain
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
