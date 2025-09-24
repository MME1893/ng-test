const apiUrl = 'http://digcity.ir:8001/api';

export const environment = {
    production: false,
    // Base URL for reference, or for endpoints not listed below
    // apiUrl: 'https://khazane-2tn6.onrender.com/api',
    // Endpoints now contain the full URL for direct use
    endpoints: {
        financialYear: `${apiUrl}/financial-year/`,
        bank: {
            root: `${apiUrl}/bank/`,
            branch: `${apiUrl}/branch/`,
            bankAccount: `${apiUrl}/bank-account/`,
            bankAccountType: `${apiUrl}/bank-account-type/`,
        },
        person: `${apiUrl}/person/`,
        region: {
            root: `${apiUrl}/region/`,
            detail: (id: number | string) => `${apiUrl}/region/${id}`,
            uploadFile: `${apiUrl}/region/upload-file/`,
        },
        organization: `${apiUrl}/organization/`,
        company: `${apiUrl}/company/`,
        partyType: `${apiUrl}/party-type/`,
        jobPost: {
            assignment: `${apiUrl}/job-post-assignment/`,
            type: `${apiUrl}/job-post-type/`,
        },
        jobPostType: `${apiUrl}/job-post-type/`,
        jobPostAssignment: `${apiUrl}/job-post-assignment/`,
        chartOfAccount: {
            kols:`${apiUrl}/chart-of-account/kols/`,

            moeins: (kolId?: number) =>
                `${apiUrl}/chart-of-account/moeins/?kol_id=${kolId}`,

            tafzilis: (moeinId?: number) =>
                `${apiUrl}/chart-of-account/tafzilis/?moein_id=${moeinId}`,

            joezs: (tafziliId?: number) =>
                `${apiUrl}/chart-of-account/joezs/?tafzili_id=${tafziliId}`,
        },
        contribution: `${apiUrl}/contribution/`,
        contributionType: `${apiUrl}/contribution-type/`,
        contributionDetail: `${apiUrl}/contribution-detail/`,
        fundTransfer: `${apiUrl}/transfer-issue-header/confirm`,

        // --- NEW ENDPOINTS FOR OWE TYPE ---
        oweType: {
            // Corresponds to: GET, POST /api/owe-type/
            root: `${apiUrl}/owe-type/`,
            // Corresponds to: GET, PUT, DELETE /api/owe-type/{id}
            detail: (id: number | string) => `${apiUrl}/owe-type/${id}`,
            // Corresponds to: GET /api/owe-type/owe/{fin_year}
            byFinancialYear: (finYear: number) => `${apiUrl}/owe-type/owe/${finYear}`,
        },
        regionalDebtHeader: {
            root: `${apiUrl}/regional-debt-header/`,
            detail: (id: number) => `${apiUrl}/regional-debt-header/${id}`,
            submitDebt: `${apiUrl}/regional-debt-header/submit-debt`,
        },
        transferRequests: (partyType: string, finYear: string) => `${apiUrl}/transfer-request/${partyType}/${finYear}/`,
        menuItems: (finYear: number) => `${apiUrl}/contribution/${finYear}/`
    },
};