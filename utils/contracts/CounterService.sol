// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {F3} from '../tokens/F3.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/security/ReentrancyGuard.sol';

error InvalidExchangeRate();
error USDCTransferFailed();
error F3TransferFailed();
error InsufficientF3Balance();
error InvalidPrice();
error WithdrawFailed();

/// @title CounterService
/// @notice A service contract for managing token exchanges and payments
/// @dev Handles USDC to F3 token exchanges and payment services for consultation and minting
contract CounterService is Ownable, ReentrancyGuard {
    /// @notice Emitted when USDC is exchanged for F3 tokens
    /// @param user Address of the user performing the exchange
    /// @param usdcAmount Amount of USDC tokens exchanged
    /// @param f3Amount Amount of F3 tokens received
    event Exchange(address indexed user, uint256 usdcAmount, uint256 f3Amount);

    /// @notice Emitted when a consultation payment is made
    /// @param user Address of the user making the payment
    /// @param receiptId Unique identifier for the payment receipt
    event ConsultPaid(address indexed user, uint256 receiptId);

    /// @notice Emitted when a minting payment is made
    /// @param user Address of the user making the payment
    /// @param receiptId Unique identifier for the payment receipt
    event MintingPaid(address indexed user, uint256 receiptId);

    /// @notice Emitted when service prices are updated
    /// @param service Name of the service (consult/minting)
    /// @param newPrice New price in F3 tokens
    event PriceUpdated(string service, uint256 newPrice);

    /// @notice Emitted when tokens are withdrawn from the contract
    /// @param token Address of the token being withdrawn
    /// @param to Address receiving the tokens
    /// @param amount Amount of tokens withdrawn
    event Withdraw(address indexed token, address indexed to, uint256 amount);

    /// @notice Address of the F3 token contract
    F3 public f3Token;

    /// @notice Address of the USDC token contract
    IERC20 public usdcToken;

    /// @notice Exchange rate for USDC to F3 conversion (1 USDC = exchangeRate F3)
    uint256 public exchangeRate;

    /// @notice Internal counter for generating unique receipt IDs
    uint256 private _receiptId;

    /// @notice Price in F3 tokens for consultation service
    uint256 public consultPrice;

    /// @notice Price in F3 tokens for minting service
    uint256 public mintingPrice;

    /// @notice Initializes the contract with token addresses and default values
    /// @param _f3Token Address of the F3 token contract
    /// @param _usdcToken Address of the USDC token contract
    constructor(address _f3Token, address _usdcToken) {
        f3Token = F3(_f3Token);
        usdcToken = IERC20(_usdcToken);
        exchangeRate = 10; // Default 1:10 rate
        _receiptId = 0;
        consultPrice = 1 ether; // Default 1 F3 token
        mintingPrice = 1 ether; // Default 1 F3 token
    }

    /// @notice Returns the current receipt ID
    /// @return Current value of the receipt ID counter
    function getCurrentReceiptId() public view returns (uint256) {
        return _receiptId;
    }

    /// @notice Updates the F3 token contract address
    /// @param _f3Token New address of the F3 token contract
    function setF3Token(address _f3Token) external onlyOwner {
        f3Token = F3(_f3Token);
    }

    /// @notice Updates the USDC token contract address
    /// @param _usdcToken New address of the USDC token contract
    function setUSDCToken(address _usdcToken) external onlyOwner {
        usdcToken = IERC20(_usdcToken);
    }

    /// @notice Updates the exchange rate for USDC to F3 conversion
    /// @param _rate New exchange rate (1 USDC = _rate F3)
    function setExchangeRate(uint256 _rate) external onlyOwner {
        if (_rate == 0) revert InvalidExchangeRate();
        exchangeRate = _rate;
    }

    /// @notice Updates the prices for consultation and minting services
    /// @param _consultPrice New price for consultation in F3 tokens
    /// @param _mintingPrice New price for minting in F3 tokens
    function setPrices(
        uint256 _consultPrice,
        uint256 _mintingPrice
    ) external onlyOwner {
        if (_consultPrice == 0 || _mintingPrice == 0) revert InvalidPrice();
        consultPrice = _consultPrice;
        mintingPrice = _mintingPrice;
        emit PriceUpdated('consult', _consultPrice);
        emit PriceUpdated('minting', _mintingPrice);
    }

    /// @notice Withdraws tokens from the contract
    /// @param token Address of the token to withdraw
    /// @param to Address to receive the tokens
    /// @param amount Amount of tokens to withdraw
    function withdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (amount == 0) revert InvalidPrice();
        if (!IERC20(token).transfer(to, amount)) revert WithdrawFailed();
        emit Withdraw(token, to, amount);
    }

    /// @notice Exchanges USDC tokens for F3 tokens
    /// @param usdcAmount Amount of USDC tokens to exchange
    function exchange(uint256 usdcAmount) external {
        // Transfer USDC from the caller to this contract
        if (!usdcToken.transferFrom(msg.sender, address(this), usdcAmount))
            revert USDCTransferFailed();

        // Calculate F3 amount based on exchange rate
        uint256 f3Amount = usdcAmount * exchangeRate;

        // Mint F3 tokens to the caller
        f3Token.mint(msg.sender, f3Amount);

        emit Exchange(msg.sender, usdcAmount, f3Amount);
    }

    /// @notice Pays for consultation service with F3 tokens
    /// @return Receipt ID for the payment
    function payForConsult() external nonReentrant returns (uint256) {
        if (f3Token.balanceOf(msg.sender) < consultPrice)
            revert InsufficientF3Balance();

        if (!f3Token.transferFrom(msg.sender, address(this), consultPrice))
            revert F3TransferFailed();

        _receiptId++;
        emit ConsultPaid(msg.sender, _receiptId);
        return _receiptId;
    }

    /// @notice Pays for minting service with F3 tokens
    /// @return Receipt ID for the payment
    function payForMinting() external nonReentrant returns (uint256) {
        if (f3Token.balanceOf(msg.sender) < mintingPrice)
            revert InsufficientF3Balance();

        if (!f3Token.transferFrom(msg.sender, address(this), mintingPrice))
            revert F3TransferFailed();

        _receiptId++;
        emit MintingPaid(msg.sender, _receiptId);
        return _receiptId;
    }
}
