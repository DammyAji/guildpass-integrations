'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useSiweAuth } from '@/lib/wallet/providers';

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { status, timeLeft, login } = useSiweAuth();

  if (!isConnected) {
    return (
      <button className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 rounded-md">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end text-xs">
        <span className="font-mono text-zinc-500">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        {status === 'authenticated' && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Session: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</span>
        )}
        {status === 'expiring' && (
          <span className="text-amber-600 dark:text-amber-400 font-bold animate-pulse">Expires in {timeLeft}s</span>
        )}
        {status === 'unauthenticated' && (
          <button onClick={login} className="text-amber-500 hover:underline font-medium">Sign In Required</button>
        )}
      </div>
      <button onClick={() => disconnect()} className="px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded">
        Disconnect
      </button>
    </div>
  );
}
