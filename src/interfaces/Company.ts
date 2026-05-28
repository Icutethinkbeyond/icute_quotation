// Company
export interface Company {
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

export const initialCompany: Company = {
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
