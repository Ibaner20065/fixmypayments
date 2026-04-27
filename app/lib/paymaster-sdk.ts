import { ethers } from 'ethers';

// ABI for PureFiPaymaster contract
const PAYMASTER_ABI = [
  'function validateAML(address target, uint256 sessionId, uint256 ruleId, uint256 expiry, bytes calldata signature) external returns (bool)',
  'function isAMLVerified(address user) external view returns (bool)',
  'function getAMLContext(address user) external view returns (tuple(uint256 ruleId, uint256 expiry, address verifiedUser))',
  'function clearAMLContext(address user) external',
  'event PaymasterValidation(address indexed user, uint256 ruleId, uint256 expiry, bool success)',
  'event AMLContextCleared(address indexed user)',
];

// Cast contract to any to bypass TypeScript strict checking for dynamically created contract
interface PaymasterContract {
  validateAML(target: string, sessionId: string, ruleId: string, expiry: number, signature: string): Promise<any>;
  isAMLVerified(user: string): Promise<boolean>;
  getAMLContext(user: string): Promise<any>;
  clearAMLContext(user: string): Promise<any>;
  connect(signer: ethers.Signer): PaymasterContract;
}

export interface AMLVerificationResponse {
  verified: boolean;
  ruleId: string;
  expiry: number;
  sessionId: string;
  signature: string;
  message?: string;
}

export interface PaymasterConfig {
  address: string;
  issuerAddress: string;
  network: 'testnet' | 'mainnet';
  rpc: string;
}

export class PaymasterSDK {
  private contract: any;
  private provider: ethers.Provider;
  private config: PaymasterConfig;

  constructor(config: PaymasterConfig, provider: ethers.Provider) {
    this.config = config;
    this.provider = provider;
    this.contract = new ethers.Contract(config.address, PAYMASTER_ABI, provider) as unknown as PaymasterContract;
  }

  /**
   * Validate AML for a user via the Paymaster contract
   */
  async validateAML(
    signer: ethers.Signer,
    amlData: AMLVerificationResponse
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!amlData.verified) {
        return { success: false, error: 'AML verification failed: not verified' };
      }

      const target = await signer.getAddress();
      const signature = amlData.signature;

      // Call validateAML on contract
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.validateAML(
        target,
        amlData.sessionId,
        amlData.ruleId,
        amlData.expiry,
        signature
      );

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt?.hash,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if a user has valid AML verification
   */
  async isAMLVerified(address: string): Promise<boolean> {
    try {
      return await this.contract.isAMLVerified(address);
    } catch (err) {
      console.error('Error checking AML verification:', err);
      return false;
    }
  }

  /**
   * Get AML context for a user
   */
  async getAMLContext(address: string) {
    try {
      const context = await this.contract.getAMLContext(address);
      return {
        ruleId: context.ruleId.toString(),
        expiry: context.expiry.toNumber(),
        verifiedUser: context.verifiedUser,
      };
    } catch (err) {
      console.error('Error getting AML context:', err);
      return null;
    }
  }

  /**
   * Estimate gas for a transaction with Paymaster sponsorship
   * In zkSync, this would call paymaster_estimateGas RPC method
   */
  async estimateGasWithPaymaster(
    target: string,
    data: string,
    value: string = '0'
  ): Promise<{
    gasLimit: string;
    gasPrice: string;
    totalCost: string;
  } | null> {
    try {
      // For zkSync testnet, use special estimateGas call with paymasterParams
      const gasEstimate = await this.provider.estimateGas({
        to: target,
        data,
        value,
      });

      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      const gasCost = gasEstimate * gasPrice;

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        totalCost: gasCost.toString(),
      };
    } catch (err) {
      console.error('Error estimating gas:', err);
      return null;
    }
  }

  /**
   * Submit a gasless transaction via Paymaster
   */
  async submitGaslessTransaction(
    signer: ethers.Signer,
    target: string,
    data: string,
    amlData: AMLVerificationResponse
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      // First validate AML
      const amlResult = await this.validateAML(signer, amlData);
      if (!amlResult.success) {
        return {
          success: false,
          error: amlResult.error || 'AML validation failed',
        };
      }

      // Then submit the actual transaction
      const tx = await signer.sendTransaction({
        to: target,
        data,
        // In production: add paymasterParams with Paymaster address
        // paymasterParams: {
        //   paymaster: this.config.address,
        //   paymasterInput: abiEncodedInput,
        // }
      });

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt?.hash,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Transaction failed',
      };
    }
  }

  /**
   * Get current Paymaster configuration
   */
  getConfig(): PaymasterConfig {
    return this.config;
  }
}

// Demo/testing helper - generate mock AML data
export function generateMockAMLData(sessionId: string = '1'): AMLVerificationResponse {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 86400 * 30; // 30 days from now

  return {
    verified: true,
    ruleId: '0x01',
    expiry,
    sessionId,
    signature: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    message: 'Mock AML verification (for testing)',
  };
}
