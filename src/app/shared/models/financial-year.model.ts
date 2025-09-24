export interface FinancialYear {
    year: number;
}

export type FinancialYearState = {
    years: FinancialYear[];
    isLoading: boolean;
    selectedYear: number | null;
    error: null | string;
}