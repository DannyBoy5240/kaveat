// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCnQtrYJeXTa6NFV_mOhDEvTyw3yAKYC5Q",
    authDomain: "kaveatapp-dev.firebaseapp.com",
    projectId: "kaveatapp-dev",
    storageBucket: "kaveatapp-dev.appspot.com",
    messagingSenderId: "937856362571",
    appId: "1:937856362571:web:1b1ed92b0b2c01983345ce",
    measurementId: "G-56M9CJQL7X"
  },
  baseUrl: 'https://us-central1-kaveatapp-dev.cloudfunctions.net',
  //baseUrl: 'https://us-central1-kaveatapp-da986.cloudfunctions.net',
  //apiUrl: 'http://localhost:4242',
  apiUrl: 'https://backend-xz4g7ocyda-ue.a.run.app',
  contractMetaEndpoint: 'get-contract-meta-dev',
  contractFileEndpoint: 'get-contract-file',
  // contractAnalysisDataEndpoint: 'spreadsheet-to-contract-data',
  // updateResultEndpoint: 'update-result-file',
  updateContractMetadataEndpoint: 'update-contract-metadata',
  grabContractsEndpoint: 'grab-contracts-dev',
  saveEndpoint: 'save-to-spreadsheet', // save-dev
  paymentSessionEndpoint: 'session',
  paymentCustomerPortalEndpoint: 'create-customer-portal-session',
  newUserEndpoint: 'new-user',
  updateUserEndpoint: 'update-user',
  getUserEndpoint: 'get-user',
  subscriptionEndpoint: 'subscription',
  stripePK: 'pk_test_51M2gIHFZThvYfqo6wejHDOhd11PSzJ7B83isr86jHFYTYY9uR0EQHwCKRqD9V3MfPN5voWS4p6ZlvGTdiJxs3dut00WeOmnrnb',
  stripePriceTableId: 'prctbl_1MMIRJFZThvYfqo63iva1Ssr',
  basePaymentLink: 'https://buy.stripe.com/test_4gwbJGfwubKveys3cf',
  validCodes: 'get-valid-codes'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
