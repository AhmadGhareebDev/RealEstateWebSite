# App Roles

This document summarizes the application roles and what each role is allowed to do (capabilities), without describing specific API endpoints.

## Guest (not authenticated)
- Browse listings and view listing details (public data only).
- View public agent profiles (public info only; no contact/license details).
- Cannot access protected actions: cannot contact listers to see phone/email, cannot favorite, cannot create or manage listings, cannot create/update/delete reviews.

## User (role: `user`)
- All Guest capabilities.
- Must verify email before login and access protected actions.
- Create listings of type `fsbo` only (FSBO — for sale by owner).
- Edit or delete only their own listings.
- Favorite listings (manage their own favorites).
- Create, update, and delete their own reviews for properties and agents.
- Contact listing owners (requires authentication) to retrieve phone/email for a listing.
- Cannot create `agent` listings, cannot set `isShowcase` on listings, and does not have agent-only fields (license, brokerage, isVerified).

## Agent (role: `agent`)
- All authenticated User capabilities.
- Registers via a separate agent registration flow that requires license verification; successful registration sets `isVerified`.
- Create listings of type `agent` only.
- Can set `isShowcase` on their own listings (only agents may mark listings as showcase).
- Edit or delete only their own listings.
- Their public profile exposes listing count, average rating, reviews, and `isVerified` status; private fields (phone, email, licenseNumber) are never exposed publicly.
- Can be reviewed by authenticated users; only reviewers can modify/delete their own reviews.

## Ownership & Common Rules
- Protected actions (favorites, reviews, contact info, creating/updating/deleting listings) require authentication.
- Only the resource owner (e.g., the user who created a listing or a review) may modify or delete that resource.
- There is no admin role in this system; permissions are limited to `user` and `agent` (plus unauthenticated guests).

## Note
- you need to be registered as agent or User , to be able to see the contact of an agent or owner ,
---

File generated from backend code inspection (role definitions and controllers).
