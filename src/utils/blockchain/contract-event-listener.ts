import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { FirebaseService } from '../../firebase/firebase.service';

// ABI เฉพาะส่วนที่เกี่ยวข้องกับ event ConsultPaid
const ABI_FRAGMENT = [
  'event ConsultPaid(address indexed user, uint256 receiptId)',
  'function getCurrentReceiptId() view returns (uint256)',
];

@Injectable()
export class ContractEventListener implements OnModuleInit {
  private readonly logger = new Logger(ContractEventListener.name);
  private providers: Map<string, ethers.providers.Provider> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor(
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) { }

  async onModuleInit() {
    await this.setupProviders();
    await this.setupContracts();
    this.startListening();
  }

  private async setupProviders() {
    // อ่านค่า configuration สำหรับเครือข่ายต่างๆ
    // สามารถรองรับหลาย chain ได้
    const networks = this.configService.get<Record<string, string>>(
      'BLOCKCHAIN_NETWORKS',
    );

    if (!networks) {
      this.logger.warn('No blockchain networks configured');
      return;
    }

    // สร้าง provider สำหรับแต่ละเครือข่าย
    Object.entries(networks).forEach(([networkName, rpcUrl]) => {
      this.providers.set(
        networkName,
        new ethers.providers.JsonRpcProvider(rpcUrl),
      );
      this.logger.log(`Provider set up for network: ${networkName}`);
    });
  }

  private async setupContracts() {
    // อ่านค่า configuration สำหรับ contract addresses บนเครือข่ายต่างๆ
    const contractAddresses =
      this.configService.get<Record<string, string>>('CONTRACT_ADDRESSES');

    if (!contractAddresses) {
      this.logger.warn('No contract addresses configured');
      return;
    }

    // สร้าง contract instance สำหรับแต่ละเครือข่าย
    this.providers.forEach((provider, networkName) => {
      const contractAddress = contractAddresses[networkName];
      if (contractAddress) {
        const contract = new ethers.Contract(
          contractAddress,
          ABI_FRAGMENT,
          provider,
        );
        this.contracts.set(networkName, contract);
        this.logger.log(
          `Contract set up for network: ${networkName} at address: ${contractAddress}`,
        );
      }
    });
  }

  private startListening() {
    // เริ่มการฟัง event สำหรับทุก contract
    this.contracts.forEach((contract, networkName) => {
      this.logger.log(
        `Starting to listen for ConsultPaid events on network: ${networkName}`,
      );

      // 1. Listening to events
      contract.on('ConsultPaid', async (user, receiptId, event) => {
        try {
          this.logger.log(
            `ConsultPaid event detected on ${networkName}: User: ${user}, ReceiptId: ${receiptId.toString()}`,
          );

          // บันทึกข้อมูลลง Firestore
          await this.storeEventData(
            user,
            receiptId,
            event.blockNumber,
            event.transactionHash,
            networkName,
          );
        } catch (error) {
          this.logger.error(
            `Error processing ConsultPaid event: ${error.message}`,
            error.stack,
          );
        }
      });
    });
  }

  // 2. Query historic events
  async queryHistoricEvents(
    fromBlock: number,
    toBlock: number | string = 'latest',
  ) {
    for (const [networkName, contract] of this.contracts.entries()) {
      try {
        this.logger.log(
          `Querying historic ConsultPaid events on ${networkName} from block ${fromBlock} to ${toBlock}`,
        );

        const events = await contract.queryFilter(
          contract.filters.ConsultPaid(),
          fromBlock,
          toBlock,
        );

        this.logger.log(
          `Found ${events.length} historic events on ${networkName}`,
        );

        // บันทึกข้อมูลทุก event ที่พบ
        for (const event of events) {
          const [user, receiptId] = event.args;
          await this.storeEventData(
            user,
            receiptId,
            event.blockNumber,
            event.transactionHash,
            networkName,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error querying historic events on ${networkName}: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  private async storeEventData(
    walletAddress: string,
    receiptId: ethers.BigNumber,
    blockNumber: number,
    txHash: string,
    networkName: string,
  ) {
    try {
      // ตรวจสอบว่ามีข้อมูลนี้แล้วหรือไม่
      const querySnapshot = await this.firebaseService.firestore
        .collection('fortunes')
        .where('walletAddress', '==', walletAddress)
        .where('receiptId', '==', receiptId.toString())
        .where('network', '==', networkName)
        .get();

      if (!querySnapshot.empty) {
        this.logger.log(
          `Event already recorded for wallet: ${walletAddress}, receiptId: ${receiptId.toString()}`,
        );
        return;
      }

      // บันทึกข้อมูลใหม่
      await this.firebaseService.firestore.collection('fortunes').add({
        walletAddress,
        receiptId: receiptId.toString(),
        used: false,
        blockNumber,
        txHash,
        network: networkName,
        createdAt: new Date(),
      });

      this.logger.log(
        `Event data stored for wallet: ${walletAddress}, receiptId: ${receiptId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Error storing event data: ${error.message}`,
        error.stack,
      );
    }
  }
}
