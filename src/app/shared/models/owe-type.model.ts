export interface OweType {
    id: number;
    name: string;
    description: string;
}

export type CreateOweTypeDto = Omit<OweType, 'id'>;

export interface OweItem {
    owe_id: number;
    name: string;
}

export interface OweCategory {
    owe_type_id: number;
    items: OweItem[];
}

export interface OweByFinancialYear {
    [key: string]: OweCategory;
}

export interface FetchOweTypesParams {
    skip?: number;
    limit?: number;
    id?: number;
    name?: string;
}

export interface OweTypeState {
    oweTypes: OweType[];
    owesByFinancialYear: OweByFinancialYear | null;
    isLoading: boolean;
    error?: string;
}