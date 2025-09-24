export interface MenuItem {
    title: string;
    icon?: string;
    link?: string;
    children?: MenuItem[];
    data?: any;
}

export const menuItems: MenuItem[] = [
    {
        title: 'داشبورد',
        icon: 'appstore',
        link: '/dashboard',
    },
    {
        title: 'اطلاعات پایه',
        icon: 'database',
        children: [
            { title: 'سال مالی', icon: 'calendar', link: '/dashboard/financial-year' },
            { title: 'گروه حساب بانکی', icon: 'credit-card', link: '/dashboard/bank-account-group' },
            { title: 'بانک‌ها', icon: 'bank', link: '/dashboard/banks' },
            { title: 'مناطق شهرداری', icon: 'environment', link: '/dashboard/municipal-areas' },
            { title: 'سازمان‌های شهرداری', icon: 'apartment', link: '/dashboard/municipal-orgs' },
            { title: 'شرکت‌های شهرداری', icon: 'shop', link: '/dashboard/municipal-companies' },
            { title: 'افراد', icon: 'team', link: '/dashboard/partners' },
            { title: 'سر فصل حسابداری', icon: 'book', link: '/dashboard/accounting-ledger' },
            // { title: 'درصد صندوق ذخیره مناطق', icon: 'fund', link: '/dashboard/area-fund-percentage' },
            // { title: 'درصد صندوق ذخیره سازمان‌ها', icon: 'fund', link: '/dashboard/org-fund-percentage' },
            // { title: 'سهم متمرکز', icon: 'cluster', link: '/dashboard/central-share' },
            // { title: 'سهم اتوبوسرانی', icon: 'car', link: '/dashboard/bus-share' },
        ],
    },
    {
        title: 'عملیات',
        icon: 'gold',
        children: [
            { title: 'مانده ابتدای دوره', icon: 'database', link: '/dashboard/beginning-period-balance' },
            { title: 'دارایی‌های غیر نقدی', icon: 'gift', link: '/dashboard/non-cash-assets' },
            { title: 'تسهیلات', icon: 'solution', link: '/dashboard/loans' },
            { title: 'جا به جایی وجه', icon: 'swap', link: '/dashboard/fund-transfer' },
        ],
    },
    {
        title: 'گزارش',
        icon: 'line-chart',
        children: [
            { title: 'گزارش ۱', icon: 'file-done', link: '/dashboard/report-1' },
            { title: 'گزارش ۲', icon: 'file-done', link: '/dashboard/report-2' },
        ],
    },
];
