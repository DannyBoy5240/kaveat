# # import json
# # from flask import jsonify, redirect
# import json
# from fastapi import FastAPI, Request, APIRouter, status, Response
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import Any, List, Optional, Union

# # This example sets up an endpoint using the Flask framework.
# # Watch this video to get started: https://youtu.be/7Ul1vfmsDck.

# import os
# import stripe
# # import firebase_admin
# from firebase_admin import credentials, firestore, initialize_app
# # Initialize Firestore DB
# cred = credentials.Certificate('./key-dev.json')
# default_app = initialize_app(cred)
# db = firestore.client()
# users_ref = db.collection('users')

# from flask import Flask, redirect, jsonify, request

# # Replace this endpoint secret with your endpoint's unique secret
# # If you are testing with the CLI, find the secret by running 'stripe listen'
# # If you are using an endpoint defined with the API or dashboard, look in your webhook settings
# # at https://dashboard.stripe.com/webhooks
# def get_endpoint_cred(name: str):
#     secret = os.environ.get(name)
#     if secret:
#         return secret

# endpoint_secret = get_endpoint_cred("STRIPE_ENDPOINT_SECRET")
# stripe.api_key = get_endpoint_cred("STRIPE_API_KEY_TEST")

# # Application Default credentials are automatically created.
# # app = firebase_admin.initialize_app()
# # db = firestore.client()

# app = FastAPI()

# origins = [
#     "http://localhost.tiangolo.com",
#     "https://localhost.tiangolo.com",
#     "http://localhost",
#     "http://localhost:8102",
#     "http://127.0.0.1:8000",
#     "localhost"
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class Line(BaseModel):
#     x: List[int]
#     y: List[int]
#     type: str
#     name: Optional[str]

# class Item(BaseModel):
#     name: str
#     description: Union[str, None] = None
#     price: float
#     tax: Union[float, None] = None

# @app.post("/stripe-webhook", status_code=200)
# async def webhook(request: Request, response: Response):

#     # event = None
#     try:
#         event = await request.json()
#         eventBody = await request.body()
#         data = event['data']
#         eventType = event['type']
#     # except json.JSONDecodeError:
#     #     return 'empty request body!'
#     except Exception as e:
#         print('⚠️  Webhook error while parsing basic request.' + str(e))
#         response.status_code = 400
#         return {}

#     if endpoint_secret:
#         # Only verify the event if there is an endpoint secret defined
#         # Otherwise use the basic event deserialized with json
#         sig_header = request.headers['stripe-signature']
#         try:
#             event = stripe.Webhook.construct_event(
#                 eventBody, sig_header, endpoint_secret
#             )
#         except stripe.error.SignatureVerificationError as e:
#             print('⚠️  Webhook signature verification failed. ' + str(e))
#             response.status_code = 422
#             return {}

#     # Handle the event
#     # MINIMUM EVENT TYPES TO MONITOR
#     if event and eventType == 'checkout.session.completed':
#         # Payment is successful and the subscription is created.
#         # You should provision the subscription and save the customer ID to your database.
#         # 1) Check mode to determine if it is a subscription or one-time payment
#         checkoutSession = data['object']
#         mode = checkoutSession['mode']
#         customerId = checkoutSession['customer'] # null if ppu
#         customerEmail = checkoutSession['customer_email'] or checkoutSession['customer_details']['email'] # null if ppu
#         user_docs = users_ref.where('email', '==', customerEmail).limit(1).stream()
#         if mode == 'payment':
#             if user_docs:
#                 # check if existing customer or new/guest
#                 if customerId:
#                     for doc in user_docs:
#                         doc.reference.update({'stripeId': customerId, 'mode': mode, 'paymentId': checkoutSession['payment_intent']})
#                 else:
#                     for doc in user_docs:
#                         doc.reference.update({'mode': mode, 'paymentId': checkoutSession['payment_intent']})
#         else:
#             # provision subscription and save customer ID
#             if user_docs:
#                 # save customer and session.url in db
#                 for doc in user_docs:
#                     doc.reference.update({'stripeId': customerId, 'mode': mode, 'paymentId': checkoutSession['subscription']})
#         print(data)
#         return checkoutSession
#     elif eventType == 'invoice.paid':
#         # Continue to provision the subscription as payments continue to be made.
#         # Store the status in your database and check when a user accesses your service.
#         # This approach helps you avoid hitting rate limits.
#         invoice = data['object']
#         customerId = invoice['customer']
#         # customerEmail = invoice['customer_email']
#         status = invoice['status']
#         paid = invoice['paid']
#         user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
#         if user_docs:
#             for doc in user_docs:
#                 doc.reference.update({'invoicePaid': paid})
#         print(data)
#         return invoice
#     elif eventType == 'invoice.payment_failed':
#         # The payment failed or the customer does not have a valid payment method.
#         # The subscription becomes past_due. Notify your customer and send them to the
#         # customer portal to update their payment information.
#         invoice = data['object']
#         customerId = invoice['customer']
#         status = invoice['status'] # open
#         paid = invoice['paid']
#         user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
#         if user_docs:
#             for doc in user_docs:
#                 doc.reference.update({'invoicePaid': paid})
#         print(data)
#         return invoice
#     elif eventType == 'payment_intent.succeeded':
#         payment_intent = data['object']  # contains a stripe.PaymentIntent
#         print('Payment for {} succeeded for customer {}'.format(payment_intent['amount'], payment_intent['customer']))
#         # Then define and call a method to handle the successful payment intent.
#         # handle_payment_intent_succeeded(payment_intent)
#         # save payment_intent['customer'] in DB
#         return payment_intent
#     elif eventType == 'payment_method.attached':
#         payment_method = data['object']  # contains a stripe.PaymentMethod
#         # Then define and call a method to handle the successful attachment of a PaymentMethod.
#         # handle_payment_method_attached(payment_method)
#         return payment_method
#     elif eventType == 'customer.created':
#         # created only when user pays for subscription
#         customer = data['object']  # contains a stripe.Customer
#         print('New customer {} created for {}'.format(customer['id'], customer['email']))
#         # save in db
#         user_docs = users_ref.where('email', '==', customer['email']).limit(1).stream()
#         if user_docs:
#             # CREATE BILLING PORTAL
#             # Authenticate your user.
#             # session = stripe.billing_portal.Session.create(
#             #     customer=customer['id'],
#             #     return_url='http://localhost:8100/home-dashboard/settings',
#             # )
#             # save customer and session.url in db
#             for doc in user_docs:
#                 doc.reference.update({'stripeId': customer['id']})
#                 # doc.update({'stripeId': customer['id'], 'billingPortal': session.url})

#         return customer
#     # CUSTOMER PORTAL: https://stripe.com/docs/customer-management/integrate-customer-portal
#     elif eventType == 'customer.subscription.updated':
#         # check subscription.items.data[0].price attribute
#         # in the subscription object to find the price the customer is subscribed to. Then, grant access to the new product. 
#         # For downgrades, check the same attribute and adjust or revoke access as needed.
#         # TODO
#         subscription = data['object']
#         customerId = subscription['customer']
#         plan = subscription['plan']
#         cancelPeriodEnd = subscription['cancel_at_period_end']
#         user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()

#         if user_docs:
#             # plan status = active
#             for doc in user_docs:
#                 doc.reference.update({'plan': plan['id'], 'planStatus': subscription['status'], 'currentPeriodEnd': subscription['current_period_end']})
    
#         print(data)
#         return subscription
#     elif eventType == 'customer.subscription.deleted':
#         # When you receive this event, revoke the customer’s access to the product
#         # If a customer changes their mind, they can reactivate their subscription prior to the end of the billing period.
#         # TODO
#         subscription = data['object']
#         customerId = subscription['customer']
#         plan = subscription['plan']
#         user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
#         if user_docs:
#             # plan status = cancelled
#             for doc in user_docs:
#                 doc.reference.update({'stripeId': None, 'plan': None, 'planStatus': plan['status'], 'invoicePaid': False, 'currentPeriodEnd': None, 'mode': None})
#         print(data)
#         return subscription
#     elif eventType == 'billing_portal.session.created':
#         # A portal session describes the instantiation of the customer portal for a particular customer
#         # https://stripe.com/docs/api/customer_portal/session
#         # TODO
#         session = data['object']  # contains a billing_portal.Session
#         customerId = session['customer']
#         # save in db
#         user_docs = users_ref.where('stripeId', '==', customerId).limit(1).stream()
#         if user_docs:
#             # save session.url in db
#             for doc in user_docs:
#                 doc.reference.update({'billingPortal': session['url']})
#         print(session)
#     else:
#         # Unexpected event type
#         print('Unhandled event type {}'.format(event['type']))
    
#     return {}

# @app.post('/create-customer-portal-session')
# async def customer_portal(customerId: str):
#     try:
#         print(customerId)
#         # Authenticate your user.
#         session = stripe.billing_portal.Session.create(
#             customer=customerId,
#             return_url='http://localhost:8100/home-dashboard/settings',
#         )
        
#         # save session.url in db
#         # users_ref.document(uid).update({'billingPortal': session.url})
#     except Exception as e:
#         return str(e)

#     return str(session.url)

# @app.post('/create-customer')
# async def create_customer(customerName: str, customerEmail: str):
#     # Authenticate your user.
#     try:
#         customer = stripe.Customer.create(
#             email=customerEmail,
#             name=customerName,
#         )
#         # TODO: save id field to customer object in firestore
#     except Exception as e:
#         return str(e)

#     return customer

# @app.post("/create-checkout-session")
# async def create_checkout_session():
#     try:
#         checkout_session = stripe.checkout.Session.create(
#             line_items=[
#                 {
#                     # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
#                     'price': 'price_1MMIMiFZThvYfqo6HCYKirxm',
#                     'quantity': 1,
#                 },
#             ],
#             mode='payment',
#             success_url='http://localhost:8100' + '/home-dashboard/upload/payment/success',
#             cancel_url='http://localhost:8100' + '/home-dashboard/main',
#         )
#     except Exception as e:
#         return str(e)

#     return redirect(checkout_session.url, code=303)

# @app.get("/subscription")
# async def get_subscription(subId: str):
#     try:
#         sub = stripe.Subscription.retrieve(subId)
#     except Exception as e:
#         return str(e)
#     return sub

# @app.get("/session")
# async def get_session(sessionId: str):
#     try:
#         sub = stripe.checkout.Session.retrieve(sessionId)
#         if sub["mode"] == "subscription":
#             item = stripe.Subscription.retrieve(sub["subscription"])
#         else:
#             item = stripe.PaymentIntent.retrieve(sub["payment_intent"])
#     except Exception as e:
#         return str(e)
#     return item

# # @app.get("/cancel-subscription")
# # async def cancel_subscription(subId: str):
# #     try:
# #         sub = stripe.Subscription.delete(subId)
# #     except Exception as e:
# #         return str(e)
# #     return sub

# # get user data from Firestore
# # @app.get("/user")
# # async def getUser(uid: str):
# #     try:
# #         # should return at most one
# #         docs = db.collection(u'users').where(u'uid', u'==', uid).limit().stream()
# #     except Exception as e:
# #         return str(e)
# #     return docs[0]

# if __name__== '__main__':
#     app.run(port=4242)