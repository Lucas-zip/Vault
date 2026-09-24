// ===== Auth =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

// ===== Usuário =====
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Conta =====
export interface AccountResponse {
  id: number;
  name: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  institution?: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  type: string;
  initialBalance: number;
  institution?: string;
  description?: string;
}

// tipagem de tipo de conta
export type AccountType =
  | 'CHECKING'
  | 'SAVINGS'
  | 'WALLET'
  | 'INVESTMENT'
  | 'CREDIT_CARD';

// ===== Categoria =====
export interface CategoryResponse {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
}

// ===== Transação =====
export interface TransactionResponse {
  id: number;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  transactionDate?: string;
  observation?: string;
  status?: string;
  accountId: number;
  accountName?: string;
  categoryId: number;
  categoryName?: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  transactionDate?: string;
  accountId: number;
  categoryId: number;
  observation?: string;
}

// ===== Dashboard =====
export interface DashboardSummaryResponse {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthResult: number;
  transactionCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface DashboardAccount {
  accountId: number;
  accountName: string;
  accountType: string;
  balance: number;
}

export interface CategoryAmountResponse {
  categoryId?: number;
  categoryName: string;
  amount: number;
  count?: number;
}

export interface MonthlyEvolutionResponse {
  month: string;
  income?: number;
  expense?: number;
}

export interface PageTransactionResponse {
  content: TransactionResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ===== Orçamento =====
export interface BudgetResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  limitAmount: number;
  period: string;
  createdAt: string;
}

export interface BudgetStatusResponse {
  budgetId: number;
  categoryName: string;
  period: string;
  limitAmount: number;
  usedAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  exceeded: boolean;
}

export interface CreateBudgetRequest {
  categoryId: number;
  limitAmount: number;
  period: string;
}

// ===== Recorrência =====
export interface RecurrenceResponse {
  id: number;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  frequency: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  accountId: number;
  accountName?: string;
  categoryId: number;
  categoryName?: string;
  createdAt: string;
}

export interface CreateRecurrenceRequest {
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  frequency: string;
  startDate?: string;
  endDate?: string;
  accountId: number;
  categoryId: number;
}

// ===== Transação futura =====
export interface FutureTransactionResponse {
  id: number;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  dueDate?: string;
  payed: boolean;
  accountId: number;
  accountName?: string;
  categoryId: number;
  categoryName?: string;
  createdAt: string;
}
