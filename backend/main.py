# import json
# from flask import jsonify, redirect
import json
from fastapi import FastAPI, Request, APIRouter, status, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, List, Optional, Union
import datetime

from google.cloud import storage
# from google.cloud import firestore

# This example sets up an endpoint using the Flask framework.
# Watch this video to get started: https://youtu.be/7Ul1vfmsDck.

import os
import stripe
# import firebase_admin
from firebase_admin import credentials, firestore, initialize_app, auth, storage
import firebase_admin

# Initialize Firestore DB
# cred = credentials.Certificate('./key-dev.json')
cred = credentials.Certificate('./key-prod.json')
default_app = initialize_app(cred)
db = firestore.client()

users_ref = db.collection('users')
contracts_ref = db.collection('contract_items')

from flask import Flask, redirect, jsonify, request

# Replace this endpoint secret with your endpoint's unique secret
# If you are testing with the CLI, find the secret by running 'stripe listen'
# If you are using an endpoint defined with the API or dashboard, look in your webhook settings
# at https://dashboard.stripe.com/webhooks
def get_endpoint_cred(name: str):
    secret = os.environ.get(name)
    if secret:
        return secret

endpoint_secret = get_endpoint_cred("STRIPE_ENDPOINT_SECRET")
# stripe.api_key = get_endpoint_cred("STRIPE_API_KEY_TEST")
stripe.api_key = get_endpoint_cred("STRIPE_API_KEY_LIVE")
# storage_client = storage.bucket('bucketname')
valid_promo_codes = os.environ.get('VALID_PROMO_CODES', 'Promo codes is not set.').split(',')

# Application Default credentials are automatically created.
# app = firebase_admin.initialize_app()
# db = firestore.client()

app = FastAPI()

origins = [
    "https://beta.kaveatapp.com",
    "https://kaveatapp-da986--qa-8adg8btc.web.app",
    "http://localhost:4200"
#"http://localhost:8100",
#    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Access-Control-Allow-Origin", 
    "Access-Control-Allow-Headers", 
    "Origin", 
    "X-Requested-With", 
    "Access-Control-Request-Method", 
    "Access-Control-Request-Headers", 
    "Authorization"
    ]
)


@app.post("/stripe-webhook", status_code=200)
async def webhook(request: Request, response: Response):

    try:
        event = await request.json()
        eventBody = await request.body()
        data = event['data']
        eventType = event['type']
    # except json.JSONDecodeError:
    #     return 'empty request body!'
    except Exception as e:
        print('⚠️  Webhook error while parsing basic request.' + str(e))
        response.status_code = 400
        return {}

    if endpoint_secret:
        # Only verify the event if there is an endpoint secret defined
        # Otherwise use the basic event deserialized with json
        sig_header = request.headers['stripe-signature']
        try:
            event = stripe.Webhook.construct_event(
                eventBody, sig_header, endpoint_secret
            )
        except stripe.error.SignatureVerificationError as e:
            print('⚠️  Webhook signature verification failed. ' + str(e))
            response.status_code = 422
            return {}

    # Handle the event
    # MINIMUM EVENT TYPES TO MONITOR
    if event and eventType == 'checkout.session.completed':
        # Payment is successful and the subscription is created.
        # You should provision the subscription and save the customer ID to your database.
        # 1) Check mode to determine if it is a subscription or one-time payment
        checkoutSession = data['object']
        mode = checkoutSession['mode']
        customerId = checkoutSession['customer'] # null if ppu
        customerEmail = checkoutSession['customer_email'] or checkoutSession['customer_details']['email'] # null if ppu
        clientReferenceId = checkoutSession['client_reference_id'] # id of contract this is associated with
        user_docs = users_ref.where('email', '==', customerEmail).limit(1).stream()
        contract_ref = contracts_ref.document(clientReferenceId)
        contract_ref.set({'paid': True, 'paidTime': datetime.datetime.fromtimestamp(checkoutSession['created'])}, merge = True)
        if mode == 'payment':
            if user_docs:
                # check if existing customer or new/guest
                if customerId:
                    for doc in user_docs:
                        doc.reference.update({'stripeId': customerId, 'mode': mode, 'paymentId': checkoutSession['payment_intent']})
                else:
                    for doc in user_docs:
                        doc.reference.update({'mode': mode, 'paymentId': checkoutSession['payment_intent']})
        else:
            # provision subscription and save customer ID
            if user_docs:
                # save customer and session.url in db
                for doc in user_docs:
                    doc.reference.update({'stripeId': customerId, 'mode': mode, 'paymentId': checkoutSession['subscription']})
                    # update all outstanding unpaid contracts to paid
                    for cid in doc.get('contracts'):
                        c_ref = contracts_ref.document(cid)
                        if c_ref.get().to_dict()['paid'] is not True:
                            c_ref.set({'paid': True, 'paidTime': datetime.datetime.fromtimestamp(checkoutSession['created'])}, merge = True)


        return checkoutSession
    elif eventType == 'invoice.paid':
        # Continue to provision the subscription as payments continue to be made.
        # Store the status in your database and check when a user accesses your service.
        # This approach helps you avoid hitting rate limits.
        invoice = data['object']
        customerId = invoice['customer']
        # customerEmail = invoice['customer_email']
        status = invoice['status']
        paid = invoice['paid']
        user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
        if user_docs:
            for doc in user_docs:
                doc.reference.update({'invoicePaid': paid})

        return invoice
    elif eventType == 'invoice.payment_failed':
        # The payment failed or the customer does not have a valid payment method.
        # The subscription becomes past_due. Notify your customer and send them to the
        # customer portal to update their payment information.
        invoice = data['object']
        customerId = invoice['customer']
        status = invoice['status'] # open
        paid = invoice['paid']
        user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
        if user_docs:
            for doc in user_docs:
                doc.reference.update({'invoicePaid': paid})

        return invoice
    elif eventType == 'payment_intent.succeeded':
        payment_intent = data['object']  # contains a stripe.PaymentIntent
        print('Payment for {} succeeded for customer {}'.format(payment_intent['amount'], payment_intent['customer']))
        # Then define and call a method to handle the successful payment intent.
        # handle_payment_intent_succeeded(payment_intent)
        # save payment_intent['customer'] in DB
        return payment_intent
    elif eventType == 'payment_method.attached':
        payment_method = data['object']  # contains a stripe.PaymentMethod
        # Then define and call a method to handle the successful attachment of a PaymentMethod.
        # handle_payment_method_attached(payment_method)
        return payment_method
    elif eventType == 'customer.created':
        # created only when user pays for subscription
        customer = data['object']  # contains a stripe.Customer
        print('New customer {} created for {}'.format(customer['id'], customer['email']))
        # save in db
        user_docs = users_ref.where('email', '==', customer['email']).limit(1).stream()
        if user_docs:
            # save customer and session.url in db
            for doc in user_docs:
                doc.reference.update({'stripeId': customer['id']})

        return customer
    # CUSTOMER PORTAL: https://stripe.com/docs/customer-management/integrate-customer-portal
    elif eventType == 'customer.subscription.updated':
        # check subscription.items.data[0].price attribute
        # in the subscription object to find the price the customer is subscribed to. Then, grant access to the new product. 
        # For downgrades, check the same attribute and adjust or revoke access as needed.
        # TODO
        subscription = data['object']
        customerId = subscription['customer']
        plan = subscription['plan']
        cancelPeriodEnd = subscription['cancel_at_period_end']
        user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()

        if user_docs:
            # plan status = active
            for doc in user_docs:
                doc.reference.update({'plan': plan['id'], 'planStatus': subscription['status'], 'currentPeriodEnd': subscription['current_period_end']})
    

        return subscription
    elif eventType == 'customer.subscription.deleted':
        # When you receive this event, revoke the customer’s access to the product
        # If a customer changes their mind, they can reactivate their subscription prior to the end of the billing period.
        # TODO
        subscription = data['object']
        customerId = subscription['customer']
        plan = subscription['plan']
        user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
        if user_docs:
            # plan status = cancelled
            for doc in user_docs:
                doc.reference.update({'stripeId': None, 'plan': None, 'planStatus': plan['status'], 'invoicePaid': False, 'currentPeriodEnd': None, 'mode': None})

        return subscription
    elif eventType == 'billing_portal.session.created':
        # A portal session describes the instantiation of the customer portal for a particular customer
        # https://stripe.com/docs/api/customer_portal/session
        # TODO
        session = data['object']  # contains a billing_portal.Session
        customerId = session['customer']
        # save in db
        user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
        if user_docs:
            # save session.url in db
            for doc in user_docs:
                doc.reference.update({'billingPortal': session['url']})

    else:
        # Unexpected event type
        print('Unhandled event type {}'.format(event['type']))
    
    return {}

@app.post('/create-customer-portal-session')
async def customer_portal(customerId: str):
    try:
        # Authenticate your user.
        session = stripe.billing_portal.Session.create(
            customer=customerId,
            return_url='https://kaveatapp-da986--test-v2-c75ioczw.web.app/home-dashboard/settings', # update this based on environment
        )
    except Exception as e:
        return str(e)

    return str(session.url)

@app.post("/new-user", status_code=201)
async def new_user(request: Request, response: Response):
    # check if Auth in header and is a bearer token
    if not 'Authorization' in request.headers or not request.headers.get('Authorization').startswith('Bearer '):
        response.status_code = 403
        return 'Missing or invalid Auth token'

    idToken = request.headers.get('Authorization').split('Bearer ')[1]
    print(idToken)
    # decode token and verify
    try:
        decodedToken = auth.verify_id_token(idToken)
        uid = decodedToken['uid']
        print(uid)
        callingUser = auth.get_user(uid)
    except Exception as e:
        response.status_code = 403
        return str(e)

    callingUser = db.collection('users').document(uid).get()
       
    # This code will process each non-file field in the form
    newUser = await request.json()

    user_ref = db.collection('users').document(newUser['uid'])
    user_ref.set(newUser)
    print('Created new user!')

    # response.headers = {
    #     'Access-Control-Allow-Origin': '*'
    # }
    
    # return ('Created new user!', 201, responseHeaders)
    return 'Created new user!'

@app.post("/update-user", status_code=200)
async def update_user(request: Request, response: Response):
    # check if Auth in header and is a bearer token
    if not 'Authorization' in request.headers or not request.headers.get('Authorization').startswith('Bearer '):
        response.status_code = 403
        return 'Missing or invalid Auth token'

    idToken = request.headers.get('Authorization').split('Bearer ')[1]
    # decode token and verify
    try:
        decodedToken = auth.verify_id_token(idToken)
        uid = decodedToken['uid']
        callingUser = auth.get_user(uid)
    except Exception as e:
        response.status_code = 403
        return str(e)

    callingUser = db.collection('users').document(uid).get()
    if not callingUser.exists:
        response.status_code = 403
        return 'Unauthorized caller'

    data = await request.json()
    
    user = db.collection('users').document(uid)
    user.update(data)

    # response.headers = {
    #     'Access-Control-Allow-Origin': '*'
    # }
    
    return 'Updated user'

@app.get("/get-user", status_code=200)
async def get_user(request: Request, response: Response):
    # check if Auth in header and is a bearer token
    if not 'Authorization' in request.headers or not request.headers.get('Authorization').startswith('Bearer '):
        response.status_code = 403
        return 'Missing or invalid Auth token'

    idToken = request.headers.get('Authorization').split('Bearer ')[1]
    # decode token and verify
    try:
        decodedToken = auth.verify_id_token(idToken)
        uid = decodedToken['uid']
        callingUser = auth.get_user(uid)
    except Exception as e:
        response.status_code = 403
        return str(e)

    callingUser = db.collection('users').document(uid).get()
    if not callingUser.exists:
        response.status_code = 403
        return 'Unauthorized caller'
    
    # responseHeaders = {
    #     'Access-Control-Allow-Origin': '*'
    # }
    # return (callingUser.to_dict(), 200, responseHeaders)
    return callingUser.to_dict()

@app.get("/get-valid-codes", status_code=200)
async def get_valid_codes(request: Request, response: Response):
    # check if Auth in header and is a bearer token
    if not 'Authorization' in request.headers or not request.headers.get('Authorization').startswith('Bearer '):
        response.status_code = 403
        return 'Missing or invalid Auth token'

    idToken = request.headers.get('Authorization').split('Bearer ')[1]
    # decode token and verify
    try:
        decodedToken = auth.verify_id_token(idToken)
        uid = decodedToken['uid']
        callingUser = auth.get_user(uid)
    except Exception as e:
        response.status_code = 403
        return str(e)

    callingUser = db.collection('users').document(uid).get()
    if not callingUser.exists:
        response.status_code = 403
        return 'Unauthorized caller'
    
    return valid_promo_codes

# payment success page
@app.get("/session")
async def get_session(sessionId: str):
    try:
        sub = stripe.checkout.Session.retrieve(sessionId)
        if sub["mode"] == "subscription":
            item = stripe.Subscription.retrieve(sub["subscription"])
        else:
            item = stripe.PaymentIntent.retrieve(sub["payment_intent"])
    except Exception as e:
        return str(e)
    return item

# not used currently - testing purposes only
@app.post("/create-checkout-session")
async def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    'price': 'price_1MMIMiFZThvYfqo6HCYKirxm',
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url='http://localhost:8100' + '/home-dashboard/upload/payment/success',
            cancel_url='http://localhost:8100' + '/home-dashboard/main',
        )
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)

# not used currently - testing purposes only
@app.post('/create-customer')
async def create_customer(customerName: str, customerEmail: str):
    # Authenticate your user.
    try:
        customer = stripe.Customer.create(
            email=customerEmail,
            name=customerName,
        )
        # TODO: save id field to customer object in firestore
    except Exception as e:
        return str(e)

    return customer

# not used currently - testing purposes only
@app.get("/subscription")
async def get_subscription(subId: str):
    try:
        sub = stripe.Subscription.retrieve(subId)
    except Exception as e:
        return str(e)
    return sub

if __name__== '__main__':
    app.run(port=4242)