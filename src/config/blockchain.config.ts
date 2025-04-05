import { registerAs } from '@nestjs/config';

export interface BlockchainNetworkConfig {
  rpcUrl: string;
  contractAddress: string;
  nftContractAddress: string;
  chainId: number;
  name: string;
  symbol: string;
  blockExplorer: string;
  protocol: string;
  network: string;
  norditSupport: boolean;
}

export type BlockchainConfigType = {
  networks: Record<string, BlockchainNetworkConfig>;
};

export default registerAs('blockchain', (): BlockchainConfigType => {
  // รองรับ network จากหลายโครงสร้าง
  const networks: Record<string, BlockchainNetworkConfig> = {
    sepolia: {
      rpcUrl:
        process.env.SEPOLIA_RPC_URL ||
        'https://sepolia.infura.io/v3/your-infura-project-id',
      contractAddress:
        process.env.SEPOLIA_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.SEPOLIA_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 11155111,
      name: 'Sepolia Testnet',
      symbol: 'ETH',
      blockExplorer: 'https://sepolia.etherscan.io',
      protocol: 'ethereum',
      network: 'sepolia',
      norditSupport: true,
    },
    base_sepolia: {
      rpcUrl: process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org',
      contractAddress:
        process.env.BASE_TESTNET_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.BASE_TESTNET_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 84531,
      name: 'Base Sepolia',
      symbol: 'ETH',
      blockExplorer: 'https://sepolia.basescan.org',
      protocol: 'base',
      network: 'sepolia',
      norditSupport: true,
    },
    celo_mainnet: {
      rpcUrl:
        process.env.CELO_MAINNET_RPC_URL ||
        'https://celo-mainnet.infura.io/v3/your-infura-project-id',
      contractAddress:
        process.env.CELO_MAINNET_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.CELO_MAINNET_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 42220,
      name: 'Celo Mainnet',
      symbol: 'CELO',
      blockExplorer: 'https://celoscan.io',
      protocol: 'celo',
      network: 'mainnet',
      norditSupport: false,
    },
  };

  return {
    networks,
  };
});
