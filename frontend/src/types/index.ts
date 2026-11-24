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

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
  transactionDate?: string;
}

// ===== Dashboard =====
/** Resumo do limite mensal total de gastos. */
export interface MonthlyBudgetStatusResponse {
  period: string;
  defined: boolean;
  limitAmount: number | null;
  spentAmount: number | null;
  remainingAmount: number | null;
  percentageUsed: number | null;
  exceeded: boolean;
}

export interface DashboardSummaryResponse {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthResult: number;
  transactionCount: number;
  pendingCount: number;
  overdueCount: number;
  monthlyBudget?: MonthlyBudgetStatusResponse;
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
  executionCount?: number;
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

export interface UpdateRecurrenceRequest {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  frequency: string;
  startDate: string;
  endDate?: string;
  accountId: number;
  categoryId?: number;
  active?: boolean;
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

// ===== Metas financeiras =====
export type GoalModality =
  | 'TRADITIONAL'
  | 'INVESTMENT_CALCULATOR'
  | 'DEPOSIT_CALENDAR';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type GoalMovementType = 'DEPOSIT' | 'WITHDRAWAL';

export type DepositStrategy = 'FIXED' | 'INCREASING' | 'CUSTOM' | 'RANDOM';

export interface GoalResponse {
  id: number;
  name: string;
  description?: string;
  targetAmount: number;
  initialAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  startDate: string;
  targetDate?: string;
  modality: GoalModality;
  depositStrategy?: DepositStrategy;
  color?: string;
  status: GoalStatus;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  initialAmount?: number;
  startDate: string;
  targetDate?: string;
  modality: GoalModality;
  depositStrategy?: DepositStrategy;
  color?: string;
}

export interface UpdateGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  startDate: string;
  targetDate?: string;
  modality: GoalModality;
  depositStrategy?: DepositStrategy;
  color?: string;
}

export interface GoalMovementResponse {
  id: number;
  type: GoalMovementType;
  amount: number;
  movementDate: string;
  description?: string;
  createdAt: string;
}

export interface CreateGoalMovementRequest {
  type: GoalMovementType;
  amount: number;
  movementDate: string;
  description?: string;
}

export interface GoalDepositPlanResponse {
  id: number;
  depositDate: string;
  plannedAmount: number;
  done: boolean;
  actualAmount?: number;
}

export interface GoalSummaryResponse {
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  totalSaved: number;
  totalTargetActive: number;
}

export interface GoalSlotPlanResponse {
  id: number;
  slotIndex: number;
  plannedAmount: number;
  done: boolean;
  actualAmount?: number;
}

export interface GenerateSlotPlanRequest {
  slotCount: number;
  strategy?: DepositStrategy;
}

export interface UpdateSlotRequest {
  slotIndex: number;
  done: boolean;
  actualAmount?: number;
}

export interface GoalDetailResponse {
  goal: GoalResponse;
  movements: GoalMovementResponse[];
  depositPlan: GoalDepositPlanResponse[];
  slotPlan: GoalSlotPlanResponse[];
}

export interface InvestmentSimulationRequest {
  initialAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  rate: number;
  ratePeriod?: 'ANNUAL' | 'MONTHLY';
  months?: number;
}

export interface EvolutionPoint {
  month: number;
  year: number;
  invested: number;
  interest: number;
  balance: number;
}

export interface InvestmentSimulationResponse {
  monthlyRate: number;
  monthsToGoal: number;
  yearsToGoal: number;
  remainingMonths: number;
  totalInvested: number;
  totalInterest: number;
  finalAmount: number;
  requiredMonthlyContribution?: number;
  evolution: EvolutionPoint[];
  disclaimer: string;
}
