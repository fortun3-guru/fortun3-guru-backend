# Fortun3 Guru Backend

A NestJS-based backend service for the Fortun3 Guru platform - a blockchain-powered fortune telling application that leverages transaction data to generate personalized fortune readings, with NFT minting capabilities.

## Features

- Fortune telling based on blockchain transaction data
- NFT minting for fortune readings
- Multi-chain EVM support
- Blockchain event listening (ConsultPaid and MintingPaid events)
- Authentication and user management
- Integration with Worldcoin for identity verification
- IPFS integration for NFT metadata storage

## Tech Stack

- NestJS (Node.js framework)
- Firebase (Functions, Firestore)
- ethers.js v5 for blockchain interactions
- Pinata SDK for IPFS integration
- Swagger for API documentation

## Project Structure

```
fortun3-guru-backend/
├── src/
│   ├── apis/
│   │   ├── auth/          # Authentication module
│   │   ├── blockchain/    # Blockchain event listeners and controllers
│   │   ├── fortune/       # Fortune telling service and API endpoints
│   │   ├── nft/           # NFT minting and IPFS services
│   │   ├── user/          # User management
│   │   └── worldcoin/     # Worldcoin integration
│   ├── config/            # Application configuration
│   ├── decorators/        # Custom decorators
│   ├── firebase/          # Firebase integration
│   ├── guards/            # Auth guards
│   ├── interceptors/      # Request/response interceptors
│   └── utils/             # Utility functions
├── app.module.ts          # Main application module
└── main.ts                # Application entry point
```

## Main API Endpoints

### Fortune Telling

- `POST /fortune/tell` - Generate fortune readings based on blockchain transaction data
- `GET /fortune/consult/:id` - Retrieve a specific fortune consultation by ID
- `POST /fortune/mint-nft` - Mint an NFT from a fortune consultation

### Blockchain

- `POST /blockchain/query-consult-events` - Query historic ConsultPaid events
- `POST /blockchain/query-minting-events` - Query historic MintingPaid events

### NFT

- NFT metadata and minting management endpoints

## Setup and Installation

### Prerequisites

- Node.js v20
- Firebase project setup
- Blockchain provider API keys

### Environment Variables

Copy the example environment file to set up your local environment:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file to include your API keys and configuration values.

### Installation

```bash
npm install
```

### Running the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

### Deployment

Deploy to Firebase Functions:

```bash
npm run deploy
```

## API Documentation

Once the application is running, Swagger API documentation is available at:

```
http://localhost:3000/api
```

## License

UNLICENSED
