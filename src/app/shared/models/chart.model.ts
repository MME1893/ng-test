export interface ChartOfAccount {
    id: number;
    accounting_code: number;
    accounting_name: string;
    parent_id: number | null;

    title?: string;
    key?: number;
    children?: ChartOfAccount[];
    isLeaf?: boolean;
}