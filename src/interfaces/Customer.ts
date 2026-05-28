// Customer (Company)
export interface Customer {
    id: string;
    companyId: string;
    name: string;
    taxId?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    createdAt?: string | Date;
}

export const initialCustomer: Customer = {
    id: '',
    companyId: '',
    name: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
};

// Contactor
export interface Contactor {
    contactorId: string;
    contactorName: string;
    contactorEmail?: string | null;
    contactorTel?: string | null;
    contactorAddress?: string | null;
    companyId?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | Date | null;
    isStandalone?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export const initialContactor: Contactor = {
    contactorId: "",
    contactorName: "",
    contactorEmail: "",
    contactorTel: "",
    contactorAddress: "",
    companyId: null,
    isStandalone: false,
};
