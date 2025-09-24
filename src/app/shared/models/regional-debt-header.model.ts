export interface DebtDetail {
    owe_type_id: number;
    owe_id: number;
    amount: number;
}

export interface DebtHeader {
    region_id: number;
    fin_year_id: number;
    description: string;
}

export interface SubmitDebtPayload {
    header: DebtHeader;
    detail: DebtDetail[];
}

export interface RegionalDebtState {
  isLoading: boolean;
  error?: string;
}
