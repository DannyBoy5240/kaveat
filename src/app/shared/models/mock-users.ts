/* eslint-disable max-len */
import { CONTRACTS } from './mock-contracts';
import { User } from './user.model';

export const USERS: User[] = [
  { uid: '1', firstName: 'Bombasto', lastName: 'Lambasto', email: 'bl@email.com', emailVerified: false, contracts: CONTRACTS, completedOnboarding: false, consentTimestamp: 1674936315000 },
  { uid: '2', firstName: 'Tornado', lastName: 'Sharknado', email: 'ts@email.com', emailVerified: false, contracts: CONTRACTS, completedOnboarding: false, consentTimestamp: 1674936315000 },
  { uid: '3', firstName: 'Magneta', lastName: 'Blue', email: 'mb@email.com', emailVerified: true, contracts: CONTRACTS, completedOnboarding: true, consentTimestamp: 1674936315000 }
];
