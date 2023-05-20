import { NegotationStatus } from '../enums/negotiationStatus.enum';
import { Contract } from './contract.model';
import { Payment } from './payment.model';

export interface User {
    uid?: string;
    firstName: string;
    lastName: string;
    email: string;
    consentTimestamp: number;
    contracts: Contract[];
    emailVerified: boolean;
    userType?: string; // creator or agent (enterprise)
    // referralCode?: string;
    occupation?: string;
    city?: string;
    country?: string;
    payment?: Payment[];
    socialHandle?: string;
    socialPlatform?: string;
    signedContracts?: number;
    receivedContracts?: number;
    negotiationStatus?: NegotationStatus;
    completedOnboarding: boolean;
    stripeId?: string;
    billingPortal?: string; // may not need since temporary session
    mode?: string; // subscription or payment_intent
    paymentId?: string; // subscription or payment_intent ID
    invoicePaid?: boolean; // should be paid
    plan?: string; // type of subscription plan
    planStatus?: string; // active if updated, cancelled if deleted
    currentPeriodEnd?: number; // epoch time for end of current subscription period
}
