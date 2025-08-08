// @ts-nocheck
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const BR_PHONE_REGEX = /^(\+55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/;

export const isEmpty = (v: any) => v === undefined || v === null || v.toString().trim().length === 0;
export const toNumber = (v: any) => (v === undefined || v === null || v === '' ? undefined : Number(v));


