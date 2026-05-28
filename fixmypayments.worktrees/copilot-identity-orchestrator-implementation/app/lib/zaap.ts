// ZAAP Transaction Bundler — 3-step DeFi atomic transaction
// Step 1: WITHDRAW from lending or LP
// Step 2: SWAP to target asset
// Step 3: ZAAP transfer or NFT purchase

export interface ZaapStep {
  stepNum: 1 | 2 | 3;
  action: 'withdraw' | 'swap' | 'transfer';
  params: Record<string, string | number>;
}

export interface ZaapBundle {
  id: string;
  steps: ZaapStep[];
  wallet: string;
  status: 'draft' | 'submitted' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  txHash?: string;
}

const SUPPORTED_POOLS = {
  AAVE: { name: 'Aave', address: '0x...' },
  MUTE: { name: 'Mute.io', address: '0x...' },
};

const SUPPORTED_SWAP_TOKENS = {
  ETH: { symbol: 'ETH', address: '0x...' },
  USDC: { symbol: 'USDC', address: '0x...' },
  ZAAP: { symbol: 'ZAAP', address: process.env.NEXT_PUBLIC_ZAAP_TOKEN_ADDRESS || '0x...' },
};

export function createZaapBundle(wallet: string): ZaapBundle {
  return {
    id: `zaap_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    steps: [],
    wallet,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}

export function addWithdrawStep(
  bundle: ZaapBundle,
  poolName: keyof typeof SUPPORTED_POOLS,
  tokenAddress: string,
  amount: string
): ZaapBundle {
  if (bundle.steps.length > 0) {
    throw new Error('Withdraw must be the first step');
  }

  return {
    ...bundle,
    steps: [
      ...bundle.steps,
      {
        stepNum: 1,
        action: 'withdraw',
        params: {
          pool: poolName,
          token: tokenAddress,
          amount,
        },
      },
    ],
  };
}

export function addSwapStep(
  bundle: ZaapBundle,
  fromToken: string,
  toToken: keyof typeof SUPPORTED_SWAP_TOKENS,
  amount: string
): ZaapBundle {
  if (bundle.steps.length !== 1 || bundle.steps[0].action !== 'withdraw') {
    throw new Error('Swap must follow Withdraw');
  }

  return {
    ...bundle,
    steps: [
      ...bundle.steps,
      {
        stepNum: 2,
        action: 'swap',
        params: {
          fromToken,
          toToken,
          amount,
        },
      },
    ],
  };
}

export function addTransferStep(
  bundle: ZaapBundle,
  recipient: string,
  amount: string
): ZaapBundle {
  if (bundle.steps.length !== 2 || bundle.steps[1].action !== 'swap') {
    throw new Error('Transfer must follow Swap');
  }

  return {
    ...bundle,
    steps: [
      ...bundle.steps,
      {
        stepNum: 3,
        action: 'transfer',
        params: {
          recipient,
          amount,
        },
      },
    ],
  };
}

export function isComplete(bundle: ZaapBundle): boolean {
  return bundle.steps.length === 3;
}

export function validateBundle(bundle: ZaapBundle): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (bundle.steps.length !== 3) {
    errors.push('Bundle must have exactly 3 steps');
  }

  if (bundle.steps[0]?.action !== 'withdraw') {
    errors.push('Step 1 must be withdraw');
  }

  if (bundle.steps[1]?.action !== 'swap') {
    errors.push('Step 2 must be swap');
  }

  if (bundle.steps[2]?.action !== 'transfer') {
    errors.push('Step 3 must be transfer');
  }

  if (!bundle.wallet || !bundle.wallet.startsWith('0x')) {
    errors.push('Invalid wallet address');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
