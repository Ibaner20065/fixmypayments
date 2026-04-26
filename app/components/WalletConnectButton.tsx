'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnectButton() {
  return (
    <ConnectButton
      label="CONNECT WALLET"
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
    />
  );
}
