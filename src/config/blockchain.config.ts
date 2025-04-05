import { registerAs } from '@nestjs/config';

export interface BlockchainNetworkConfig {
  rpcUrl: string;
  contractAddress: string;
  nftContractAddress: string;
  chainId: number;
  name: string;
  symbol: string;
  blockExplorer: string;
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
    },
    base_testnet: {
      rpcUrl: process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org',
      contractAddress:
        process.env.BASE_TESTNET_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.BASE_TESTNET_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 84531,
      name: 'Base Goerli Testnet',
      symbol: 'ETH',
      blockExplorer: 'https://sepolia.basescan.org',
    },
  };

  return {
    networks,
  };
});
