export interface Contribution {
    id: number;
    date: string;
    party_id: number;
    party_type: string;
    total_amount: number;
    description?: string;
    fin_year: number; // Added required field
    contribution_type_id: number; // Added required field
}

export interface ContributionDetail {
    id: number;
    contribution_id: number;
    chart_of_account_id?: number; // Made optional as per new API
    party_id?: number; // Added from new API
    amount: number;
    percentage?: number; // Added from new API
    amnt_or_prcntg: boolean; // true for percentage, false for amount
    description?: string;
}

export interface DisplayShare extends Contribution {
    party_name: string;
    detail: ContributionDetail;
}

export interface DisplayBusShare extends Contribution {
    party_name: string; // e.g., 'منطقه ۱ شهرداری'
    detail: ContributionDetail; // Each bus share will have one corresponding detail
}

export interface DisplayOrgReserve extends Contribution {
    party_name: string; // e.g., 'سازمان حمل و نقل'
    detail: ContributionDetail; // Each reserve will have one corresponding detail
}

export interface DisplayAreaReserve {
    // Properties from the base Contribution model
    id: number;
    date: string;
    party_id: number;
    party_type: string;
    total_amount: number;
    description?: string;
    fin_year: number; // The missing property is now explicitly defined
    contribution_type_id: number;

    // Custom properties for display
    party_name: string;
    detail: ContributionDetail;
}