export enum CustomerType {
  CORPORATION = "CORPORATION",
  INDIVIDUAL = "INDIVIDUAL",
}

// Customer (Company / Corporation)
export interface Customer {
    id: string;
    companyId: string;
    customerType: CustomerType;
    name: string;
    taxId?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    website?: string | null;
    note?: string | null;
    branch?: string | null;
    registrationDate?: string | Date | null;
    businessType?: string | null;
    capital?: number | null;
    directorName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    nationalId?: string | null;
    dateOfBirth?: string | Date | null;
    occupation?: string | null;
    createdAt?: string | Date;
}

export const initialCustomer: Customer = {
    id: '',
    companyId: '',
    customerType: CustomerType.CORPORATION,
    name: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    note: '',
    branch: '',
    businessType: '',
    capital: 0,
    directorName: '',
    firstName: '',
    lastName: '',
    nationalId: '',
    occupation: '',
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
