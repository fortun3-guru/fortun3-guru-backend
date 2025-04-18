import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { FirebaseService } from '../../firebase/firebase.service';
import { BlockchainConfigType } from '../../config/blockchain.config';

// ABI เฉพาะส่วนที่เกี่ยวข้องกับ event MintingPaid
const ABI_FRAGMENT = [
  'event MintingPaid(address indexed user, uint256 receiptId)',
  'function getCurrentReceiptId() view returns (uint256)',
];

@Injectable()
export class MintingEventListener implements OnModuleInit {
  private readonly logger = new Logger(MintingEventListener.name);
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
    const blockchainConfig =
      this.configService.get<BlockchainConfigType>('blockchain');

    if (!blockchainConfig || !blockchainConfig.networks) {
      this.logger.warn('No blockchain networks configured');
      return;
    }

    // สร้าง provider สำหรับแต่ละเครือข่าย
    Object.entries(blockchainConfig.networks).forEach(
      ([networkName, networkConfig]) => {
        this.providers.set(
          networkName,
          new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl),
        );
        this.logger.log(`Provider set up for network: ${networkName}`);
      },
    );
  }

  private async setupContracts() {
    const blockchainConfig =
      this.configService.get<BlockchainConfigType>('blockchain');

    if (!blockchainConfig || !blockchainConfig.networks) {
      this.logger.warn('No blockchain networks configured');
      return;
    }

    // สร้าง contract instance สำหรับแต่ละเครือข่าย
    Object.entries(blockchainConfig.networks).forEach(
      ([networkName, networkConfig]) => {
        const provider = this.providers.get(networkName);
        if (provider && networkConfig.contractAddress) {
          const contract = new ethers.Contract(
            networkConfig.contractAddress,
            ABI_FRAGMENT,
            provider,
          );
          this.contracts.set(networkName, contract);
          this.logger.log(
            `Contract set up for network: ${networkName} at address: ${networkConfig.contractAddress}`,
          );
        }
      },
    );
  }

  private startListening() {
    // เริ่มการฟัง event สำหรับทุก contract
    this.contracts.forEach((contract, networkName) => {
      this.logger.log(
        `Starting to listen for MintingPaid events on network: ${networkName}`,
      );

      // 1. Listening to events
      contract.on('MintingPaid', async (user, receiptId, event) => {
        try {
          this.logger.log(
            `MintingPaid event detected on ${networkName}: User: ${user}, ReceiptId: ${receiptId.toString()}`,
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
            `Error processing MintingPaid event: ${error.message}`,
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
          `Querying historic MintingPaid events on ${networkName} from block ${fromBlock} to ${toBlock}`,
        );

        const events = await contract.queryFilter(
          contract.filters.MintingPaid(),
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
        .collection('nfts')
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

      // ข้อมูลเครือข่าย
      const blockchainConfig =
        this.configService.get<BlockchainConfigType>('blockchain');
      const networkConfig = blockchainConfig?.networks[networkName];

      // บันทึกข้อมูลใหม่
      await this.firebaseService.firestore.collection('nfts').add({
        walletAddress,
        receiptId: receiptId.toString(),
        used: false,
        blockNumber,
        txHash,
        network: networkName,
        chainId: networkConfig?.chainId || 0,
        blockExplorer: networkConfig?.blockExplorer || '',
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