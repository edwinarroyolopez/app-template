// src/modules/payables/types/vendors.types.ts

export enum VendorType {
    FUEL_STATION = 'FUEL_STATION',
    MECHANIC = 'MECHANIC',
    SUPPLIER = 'SUPPLIER',
    OTHER = 'OTHER',
}

export interface Vendor {
    _id: string;
    workspaceId: string;
    name: string;
    type: VendorType;
    phone?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVendorInput {
    name: string;
    type?: VendorType;
    phone?: string;
    notes?: string;
}

export interface UpdateVendorInput {
    name?: string;
    type?: VendorType;
    phone?: string;
    notes?: string;
}

export interface ListVendorsQuery {
    includeInactive?: boolean;
    type?: VendorType;
    q?: string;
}
