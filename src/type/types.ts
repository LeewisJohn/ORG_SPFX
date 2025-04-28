export interface OrganizationItem {
    Id: string;
    Title?: string;
    User?: any;
    Department?: string;
    Description?: string;
    Location?: string;
    ParentId?: number | null;
    Link?: string;
    Orders?: number;
    Format?: string;
}
