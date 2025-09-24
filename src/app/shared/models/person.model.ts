export interface Person {
    id: number;
    name: string;
    family: string;
    national_code: string;
    phone_number: string;
}

export type CreatePersonDto = Omit<Person, 'id'>;

export interface PersonState {
    persons: Person[];
    isLoading: boolean;
    error?: string;
}