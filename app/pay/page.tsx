'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Smartphone, 
  CreditCard, 
  Coins, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Scan,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { web3 } from '../lib/web3';

type PaymentMethod = 'upi' | 'card' | 'web3';

export default function PayPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('0');
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [recipient, setRecipient] = useState({ 
    name: 'Indrayudh', 
    handle: 'indrayudh@okaxis',
    wallet: '0x323349666E39C29323f66D468641a0F98E98642a' // Example zkSync address
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if already connected
    const checkConn = async () => {
      try {
        const signer = await web3.connect();
        const addr = await signer.getAddress();
        setWalletAddress(addr);
      } catch (e) {
        // Silent fail if not connected yet
      }
    };
    if (method === 'web3') checkConn();
  }, [method]);

  // Handle keypad input
  const handleKeypress = (key: string) => {
    if (status !== 'idle') return;
    
    setAmount(prev => {
      if (key === 'back') {
        return prev.length > 1 ? prev.slice(0, -1) : '0';
      }
      if (key === '.') {
        return prev.includes('.') ? prev : prev + '.';
      }
      if (prev === '0' && key !== '.') {
        return key;
      }
      // Limit to 2 decimal places
      if (prev.includes('.') && prev.split('.')[1].length >= 2) {
        return prev;
      }
      return prev + key;
    });
  };

  const connectWallet = async () => {
    try {
      const signer = await web3.connect();
      const addr = await signer.getAddress();
      setWalletAddress(addr);
    } catch (e: any) {
      alert("Wallet Error: " + e.message);
    }
  };

  const handlePay = async () => {
    if (amount === '0' || isProcessing) return;
    
    if (method === 'web3' && !walletAddress) {
      return connectWallet();
    }

    setIsProcessing(true);
    
    try {
      if (method === 'web3') {
        // Real zkSync Gasless Execution
        // Note: Using a generic paymaster for demonstration
        const PAYMASTER_ADDRESS = "0x323349666E39C29323f66D468641a0F98E98642a"; 
        
        // Encode a simple transfer or contract call
        const dummyData = "0x"; // Simplified for now
        
        await web3.executeGasless(
          recipient.wallet,
          dummyData,
          PAYMASTER_ADDRESS
        );
      } else {
        // Simulate real payment processing for UPI/Card
        await new Promise(r => setTimeout(r, 2000));
      }
      
      // Log transaction to our DB
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fb-id-token')}`
        },
        body: JSON.stringify({ 
          raw_text: `Paid ₹${amount} to ${recipient.name} via ${method.toUpperCase()}${method === 'web3' ? ' (GASLESS)' : ''}`,
          force: true
        })
      });
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#CCFF00] rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <span className="font-bold tracking-tight text-lg">FASTPAY</span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <History size={24} />
        </button>
      </header>

      <main className="max-w-md mx-auto p-6 pb-32">
        {/* Recipient Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#CCFF00] to-[#88FF00] rounded-full flex items-center justify-center mb-4 border-4 border-white/10 shadow-2xl">
            <span className="text-3xl font-black text-black">{recipient.name[0]}</span>
          </div>
          <h1 className="text-xl font-bold">{recipient.name}</h1>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest">{recipient.handle}</p>
        </motion.div>

        {/* Amount Display */}
        <div className="relative mb-12 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-[#CCFF00]">₹</span>
            <span className="text-7xl font-black tracking-tighter tabular-nums leading-none">
              {amount}
            </span>
          </div>
          {parseFloat(amount) > 5000 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 text-xs font-bold uppercase tracking-wider"
            >
              <AlertCircle size={14} />
              High Value Transaction
            </motion.div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { id: 'upi', icon: Smartphone, label: 'UPI' },
            { id: 'card', icon: CreditCard, label: 'CARD' },
            { id: 'web3', icon: Coins, label: 'WEB3' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id as PaymentMethod)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                method === m.id 
                  ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-lg' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              <m.icon size={24} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeypress(key)}
              className="h-16 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-2xl font-bold font-mono"
            >
              {key === 'back' ? <ArrowLeft size={24} /> : key}
            </button>
          ))}
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 text-white/30 text-xs font-medium uppercase tracking-widest mb-10">
          <ShieldCheck size={14} />
          Encrypted by FixMyPayments Protocol
        </div>
      </main>

      {/* Pay Button / Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePay}
            disabled={amount === '0' || isProcessing || status !== 'idle'}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all ${
              status === 'success' 
                ? 'bg-green-500 text-white shadow-green-500/20' 
                : amount === '0' 
                  ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                  : 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/20 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full"
                />
                {method === 'web3' ? 'GASLESS EXECUTION...' : 'SECURING PAYMENT...'}
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 size={24} />
                PAYMENT SENT!
              </>
            ) : (
              method === 'web3' && !walletAddress ? 'CONNECT WALLET' : `PROCEED TO PAY ₹${amount}`
            )}
          </button>
        </div>
      </div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-[#CCFF00] rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(204,255,0,0.5)]">
                <CheckCircle2 size={48} className="text-black" />
              </div>
              <h2 className="text-3xl font-black mb-2">Transaction Success!</h2>
              <p className="text-white/40 mb-12">₹{amount} successfully sent to {recipient.name}</p>
              
              <div className="w-full max-w-xs p-6 bg-white/5 rounded-3xl border border-white/10 mb-12">
                <div className="flex justify-between mb-4">
                  <span className="text-white/40 text-sm">Ref ID</span>
                  <span className="font-mono text-sm">{Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-sm">Method</span>
                  <span className="font-mono text-sm uppercase">{method}</span>
                </div>
              </div>

              <button 
                onClick={() => router.push('/dashboard')}
                className="px-12 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all"
              >
                DONE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&family=Space+Mono:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}
