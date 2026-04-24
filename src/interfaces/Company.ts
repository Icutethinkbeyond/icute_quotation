
// CompanyProfile
export interface CompanyProfile {
    companyId: string;
    companyName: string;
    companyAddress?: string | null;
    companyTaxId?: string | null;
    branch?: string | null;
    companyPhoneNumber?: string | null;
    companyEmail?: string | null;
    companyWebsite?: string | null;
    companyRegistrationDate?: string | Date | null;
    companyBusinessType?: string | null;
    companyImage?: string | null;
    companyImagePublicId?: string | null;
    isFavorite?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface CustomerCompany {
    customerCompanyId: string;
    companyName: string;
    companyTel?: string | null;
    customerCompanyEmail?: string | null;
    taxId?: string | null;
    branch?: string | null;
    companyAddress?: string | null;
    isFavorite?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export const initialCompany: CompanyProfile = {
    companyId: '',
    companyName: '',
    companyAddress: '',
    companyTaxId: '',
    branch: '',
    companyPhoneNumber: '',
    companyEmail: '',
    companyWebsite: '',
    companyBusinessType: '',
    companyRegistrationDate: '',
    companyImage: '',
    companyImagePublicId: '',
    isFavorite: false,
};

export const initialCustomerCompany: CustomerCompany = {
    customerCompanyId: '',
    companyName: '',
    companyTel: '',
    customerCompanyEmail: '',
    taxId: '',
    branch: '',
    companyAddress: '',
    isFavorite: false,
};