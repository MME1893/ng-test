export interface Region {
    id: number;
    name: string;
}

export interface RegionState {
    regions: Region[];
    isLoading: boolean;
    error?: string;
}