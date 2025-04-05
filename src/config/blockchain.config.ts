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
    ethereum: {
      rpcUrl:
        process.env.ETHEREUM_RPC_URL ||
        'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      contractAddress:
        process.env.ETHEREUM_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.ETHEREUM_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 1,
      name: 'Ethereum Mainnet',
      symbol: 'ETH',
      blockExplorer: 'https://etherscan.io',
    },
    bsc: {
      rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
      contractAddress:
        process.env.BSC_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.BSC_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 56,
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      blockExplorer: 'https://bscscan.com',
    },
    polygon: {
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      contractAddress:
        process.env.POLYGON_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.POLYGON_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 137,
      name: 'Polygon Mainnet',
      symbol: 'MATIC',
      blockExplorer: 'https://polygonscan.com',
    },
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
    base: {
      rpcUrl: process.env.BASE_TESTNET_RPC_URL || 'https://goerli.base.org',
      contractAddress:
        process.env.BASE_TESTNET_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      nftContractAddress:
        process.env.BASE_TESTNET_NFT_CONTRACT_ADDRESS ||
        '0x0000000000000000000000000000000000000000',
      chainId: 84531,
      name: 'Base Goerli Testnet',
      symbol: 'ETH',
      blockExplorer: 'https://goerli.basescan.org',
    },
  };

  return {
    networks,
  };
});
