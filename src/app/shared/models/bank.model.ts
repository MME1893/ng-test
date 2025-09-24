export interface StatCard {
  title: string;
  value: string;
  icon: string;
}

export interface Bank {
  id: number;
  name: string;
  description?: string;
}

export interface BankAccountType {
    id: number;
    name: string;
    description?: string;
}

export interface BankAccount {
    id: number;
    accountNo: string;
    shebaNo: string;
    description?: string;
    bank_id: number;
    account_type_id: number;
}
