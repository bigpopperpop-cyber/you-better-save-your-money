
export enum AccountType {
  SAVINGS = 'Savings'
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal'
}

export const DEFAULT_CATEGORIES = [
  'Food',
  'Games',
  'Savings Goal',
  'Gifts',
  'Entertainment',
  'Allowance',
  'Chores',
  'Other'
];

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  account: AccountType;
  comment: string;
  category: string;
}

export interface ChartDataPoint {
  date: string;
  balance: number;
}
