/**
 * Tray'd Wallet Page
 * @description Manage wallets, deposits, withdrawals, and view transaction history
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Send,
  Plus,
  CreditCard,
  Building2,
  QrCode,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency, formatRelativeTime, maskAddress } from '@/lib/utils';
import { useAuthStore } from '@/store';

// ============================================================
// TYPES
// ============================================================

interface WalletData {
  id: string;
  type: 'fiat' | 'crypto' | 'margin' | 'earnings' | 'bonus';
  currency: string;
  balance: number;
  availableBalance: number;
  frozenBalance: number;
  icon?: string;
}

interface TransactionData {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'trade' | 'fee' | 'refund' | 'bonus';
  status: 'completed' | 'pending' | 'processing' | 'failed';
  amount: number;
  fee: number;
  currency: string;
  description: string;
  timestamp: Date;
  txHash?: string;
}

// ============================================================
// MOCK DATA
// ============================================================

function generateWallets(): WalletData[] {
  return [
    {
      id: 'wallet-1',
      type: 'fiat',
      currency: 'USD',
      balance: 12500.00,
      availableBalance: 12500.00,
      frozenBalance: 0,
    },
    {
      id: 'wallet-2',
      type: 'crypto',
      currency: 'USDT',
      balance: 8432.56,
      availableBalance: 8232.56,
      frozenBalance: 200.00,
    },
    {
      id: 'wallet-3',
      type: 'crypto',
      currency: 'BTC',
      balance: 0.4521,
      availableBalance: 0.4521,
      frozenBalance: 0,
    },
    {
      id: 'wallet-4',
      type: 'crypto',
      currency: 'ETH',
      balance: 5.234,
      availableBalance: 5.234,
      frozenBalance: 0,
    },
    {
      id: 'wallet-5',
      type: 'earnings',
      currency: 'USDT',
      balance: 2500.00,
      availableBalance: 2500.00,
      frozenBalance: 0,
    },
    {
      id: 'wallet-6',
      type: 'bonus',
      currency: 'USDT',
      balance: 150.00,
      availableBalance: 150.00,
      frozenBalance: 0,
    },
  ];
}

function generateTransactions(): TransactionData[] {
  return [
    {
      id: 'tx-1',
      type: 'deposit',
      status: 'completed',
      amount: 5000.00,
      fee: 12.50,
      currency: 'USD',
      description: 'Bank Transfer Deposit',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: 'tx-2',
      type: 'trade',
      status: 'completed',
      amount: 342.18,
      fee: 0.51,
      currency: 'USDT',
      description: 'BTC/USDT Buy Order Filled',
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: 'tx-3',
      type: 'withdrawal',
      status: 'processing',
      amount: -1000.00,
      fee: 5.00,
      currency: 'USDT',
      description: 'Crypto Withdrawal to External Wallet',
      timestamp: new Date(Date.now() - 172800000),
      txHash: '0x7a3b...8f2c',
    },
    {
      id: 'tx-4',
      type: 'transfer',
      status: 'completed',
      amount: -2500.00,
      fee: 0,
      currency: 'USDT',
      description: 'Transfer to Earnings Wallet',
      timestamp: new Date(Date.now() - 259200000),
    },
    {
      id: 'tx-5',
      type: 'bonus',
      status: 'completed',
      amount: 45.80,
      fee: 0,
      currency: 'USDT',
      description: 'Daily Trading Volume Reward',
      timestamp: new Date(Date.now() - 432000000),
    },
    {
      id: 'tx-6',
      type: 'deposit',
      status: 'completed',
      amount: 2500.00,
      fee: 62.50,
      currency: 'USD',
      description: 'Card Deposit (****4521)',
      timestamp: new Date(Date.now() - 604800000),
    },
    {
      id: 'tx-7',
      type: 'trade',
      status: 'completed',
      amount: -89.32,
      fee: 0.13,
      currency: 'USDT',
      description: 'SOL/USDT Sell Order Filled',
      timestamp: new Date(Date.now() - 691200000),
    },
    {
      id: 'tx-8',
      type: 'fee',
      status: 'completed',
      amount: -15.50,
      fee: 0,
      currency: 'USDT',
      description: 'Trading Fee Rebate (VIP Level 2)',
      timestamp: new Date(Date.now() - 864000000),
    },
  ];
}

// ============================================================
// WALLET CARD COMPONENT
// ============================================================

interface WalletCardProps {
  wallet: WalletData;
  isSelected: boolean;
  onSelect: () => void;
}

function WalletCard({ wallet, isSelected, onSelect }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  
  const totalValue = wallet.currency === 'BTC' 
    ? wallet.balance * 67543 // Approximate BTC value
    : wallet.balance;

  const getWalletIcon = () => {
    switch (wallet.type) {
      case 'fiat': return <CreditCard className="h-5 w-5" />;
      case 'crypto': return <Wallet className="h-5 w-5" />;
      case 'earnings': return <TrendingUp className="h-5 w-5" />;
      case 'bonus': return <Plus className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getWalletColor = () => {
    switch (wallet.type) {
      case 'fiat': return 'from-blue-500 to-cyan-500';
      case 'crypto': return 'from-violet-500 to-purple-600';
      case 'earnings': return 'from-emerald-500 to-green-600';
      case 'bonus': return 'from-orange-500 to-amber-500';
      case 'margin': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={cn("h-10 w-10", !isSelected && "opacity-70")}>
              <AvatarFallback className={cn(
                "text-white text-sm font-bold bg-gradient-to-br",
                getWalletColor()
              )}>
                {wallet.currency.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className="font-semibold">{wallet.currency}</p>
              <p className="text-xs text-muted-foreground capitalize">{wallet.type} Wallet</p>
            </div>
          </div>

          {/* Show/Hide Balance */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setShowBalance(!showBalance);
            }}
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>

        {/* Balance */}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">Total Balance</p>
          <p className="text-xl font-bold tabular-nums">
            {showBalance ? (
              <>
                {wallet.currency === 'USD' ? '$' : ''}
                {wallet.balance.toLocaleString(undefined, { 
                  minimumFractionDigits: wallet.currency === 'BTC' || wallet.currency === 'ETH' ? 6 : 2,
                  maximumFractionDigits: wallet.currency === 'BTC' || wallet.currency === 'ETH' ? 6 : 2 
                })}
                {' '}<span className="text-sm font-normal text-muted-foreground">{wallet.currency}</span>
              </>
            ) : (
              '•••••'
            )}
          </p>
        </div>

        {/* Available / Frozen */}
        {wallet.frozenBalance > 0 && (
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">
              Available: <span className="text-foreground tabular-nums">{wallet.availableBalance.toLocaleString()}</span>
            </span>
            <span className="text-orange-500">
              Frozen: <span className="tabular-nums">{wallet.frozenBalance.toLocaleString()}</span>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <ArrowDownLeft className="mr-1 h-3 w-3" />
            Deposit
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// DEPOSIT FORM COMPONENT
// ============================================================

function DepositForm({ selectedWallet }: { selectedWallet: WalletData | null }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedWallet) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Select a wallet to deposit</p>
        </CardContent>
      </Card>
    );
  }

  const handleDeposit = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    alert(`Deposit of ${amount} ${selectedWallet.currency} initiated!`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ArrowDownLeft className="mr-2 h-5 w-5 text-emerald-500" />
          Deposit {selectedWallet.currency}
        </CardTitle>
        <CardDescription>Add funds to your {selectedWallet.type} wallet</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount ({selectedWallet.currency})</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-mono text-lg"
          />
          
          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(val))}
                className="text-sm"
              >
                ${val.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">
                <Building2 className="mr-2 h-4 w-4" />
                Bank Transfer
              </SelectItem>
              <SelectItem value="card">
                <CreditCard className="mr-2 h-4 w-4" />
                Debit/Credit Card
              </SelectItem>
              <SelectItem value="paystack">
                Paystack
              </SelectItem>
              {(selectedWallet.type === 'crypto') && (
                <SelectItem value="crypto">
                  <QrCode className="mr-2 h-4 w-4" />
                  Crypto Deposit
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Info */}
        {amount && parseFloat(amount) > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono font-medium">${parseFloat(amount).toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Fee (~2.5%)</span>
              <span className="font-mono text-orange-500">${(parseFloat(amount) * 0.025).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-medium">
              <span>You'll receive</span>
              <span className="font-mono text-emerald-500">
                ${(parseFloat(amount) * 0.975).toLocaleString()} {selectedWallet.currency}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button 
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
          disabled={!amount || isProcessing}
          onClick={handleDeposit}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Deposit {amount || '0'} {selectedWallet.currency}
            </>
          )}
        </Button>

        {/* Security Note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-500 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <p>All deposits are secured with SSL encryption and processed within 1-3 business days for bank transfers.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// WITHDRAWAL FORM COMPONENT
// ============================================================

function WithdrawalForm({ selectedWallet }: { selectedWallet: WalletData | null }) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedWallet) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Select a wallet to withdraw</p>
        </CardContent>
      </Card>
    );
  }

  const handleWithdraw = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    alert(`Withdrawal of ${amount} ${selectedWallet.currency} initiated!`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ArrowUpRight className="mr-2 h-5 w-5 text-red-500" />
          Withdraw {selectedWallet.currency}
        </CardTitle>
        <CardDescription>Withdraw funds from your {selectedWallet.type} wallet</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Available Balance */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="font-mono font-medium">
              {selectedWallet.availableBalance.toLocaleString()} {selectedWallet.currency}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount ({selectedWallet.currency})</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-mono text-lg"
            max={selectedWallet.availableBalance}
          />
          
          {/* Quick percentages */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                onClick={() => setAmount(String((selectedWallet.availableBalance * percent) / 100))}
                className="text-sm"
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        {/* Destination Address (for crypto) */}
        {selectedWallet.type === 'crypto' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Address</label>
            <Input
              type="text"
              placeholder="Enter wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono"
            />
          </div>
        )}

        {/* Bank Details (for fiat) */}
        {selectedWallet.type === 'fiat' && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/30">
            <p className="text-sm font-medium">Bank Account Details</p>
            <div className="grid gap-2">
              <Input placeholder="Account Holder Name" />
              <Input placeholder="Account Number" />
              <Input placeholder="Bank Name" />
              <Input placeholder="Routing Number (if applicable)" />
            </div>
          </div>
        )}

        {/* Fee Info */}
        {amount && parseFloat(amount) > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Withdrawal Amount</span>
              <span className="font-mono">{amount} {selectedWallet.currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network/Fee</span>
              <span className="font-mono text-orange-500">
                {selectedWallet.type === 'crypto' ? '~$5-20' : '$10 + Bank Fees'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-medium">
              <span>You'll receive</span>
              <span className="font-mono text-primary">
                ~{Math.max(0, parseFloat(amount) - (selectedWallet.type === 'fiat' ? 10 : 10))} {selectedWallet.currency}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button 
          className="w-full py-6 bg-red-500 hover:bg-red-600 text-white font-semibold"
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > selectedWallet.availableBalance || isProcessing}
          onClick={handleWithdraw}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Withdraw {amount || '0'} {selectedWallet.currency}
            </>
          )}
        </Button>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 text-orange-500 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Withdrawals typically process within 1-24 hours. Please ensure your destination address/account details are correct.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// TRANSACTION HISTORY COMPONENT
// ============================================================

function TransactionHistory() {
  const transactions = generateTransactions();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="h-4 w-4" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4" />;
      case 'transfer': return <Send className="h-4 w-4" />;
      case 'trade': return <RefreshCw className="h-4 w-4" />;
      case 'bonus': return <Plus className="h-4 w-4" />;
      case 'fee': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'bonus' || (type === 'deposit' && amount > 0)) return 'text-emerald-500 bg-emerald-500/10';
    if (type === 'withdrawal' || amount < 0) return 'text-red-500 bg-red-500/10';
    if (type === 'trade') return amount >= 0 ? 'text-blue-500 bg-blue-500/10' : 'text-orange-500 bg-orange-500/10';
    return 'text-muted-foreground bg-muted/10';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-0 text-[10px]">Completed</Badge>;
      case 'pending':
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-0 text-[10px]">
          {status === 'pending' ? 'Pending' : 'Processing'}
        </Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-[10px]">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
              {/* Icon */}
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                getTransactionColor(tx.type, tx.amount)
              )}>
                {getTransactionIcon(tx.type)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(tx.timestamp.toISOString())}
                  </span>
                  {tx.txHash && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {maskAddress(tx.txHash)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="hidden sm:block">
                {getStatusBadge(tx.status)}
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className={cn(
                  "font-mono font-medium text-sm tabular-nums",
                  tx.amount >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                </p>
                {tx.fee > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Fee: {tx.fee.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN WALLET PAGE
// ============================================================

export default function WalletPage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const activeTabFromUrl = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(activeTabFromUrl || 'overview');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const wallets = generateWallets();
  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || null;

  // Calculate totals
  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => {
      if (w.currency === 'BTC') return sum + w.balance * 67543; // Approximate value
      return sum + w.balance;
    }, 0);
  }, [wallets]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground mt-1">
            Manage your funds across multiple currencies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Total Balance</p>
            <p className="text-xl font-bold tabular-nums">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-6">
          {/* Wallet Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {wallets.map(wallet => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                isSelected={selectedWalletId === wallet.id}
                onSelect={() => setSelectedWalletId(selectedWalletId === wallet.id ? null : wallet.id)}
              />
            ))}
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TransactionHistory />
          </motion.div>
        </TabsContent>

        {/* Deposit Tab */}
        <TabsContent value="deposit" className="mt-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <DepositForm selectedWallet={selectedWallet} />
          </motion.div>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="mt-6">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <WithdrawalForm selectedWallet={selectedWallet} />
          </motion.div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TransactionHistory />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
