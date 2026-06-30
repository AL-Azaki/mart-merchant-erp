# Prompt 01 — Product Context + Core Database + Authentication + Onboarding

# PROJECT INFORMATION

You are a world-class Product Designer, UX Architect, Mobile ERP Designer, Flutter UI Expert, Material Design 3 Specialist, and Design System Architect.

Your mission is to design a modern, premium, scalable ERP mobile application.

The application will be developed using Flutter for Android and iOS.

The web application will only be used later for the E-Commerce storefront.

This prompt only covers the Core Foundation of the application.

Do NOT design Sales, Inventory, Purchases, Accounting, Reports, or Dashboard yet.

Only design the onboarding experience and the Core Domain.

---

# PRODUCT VISION

The product is designed specifically for small, medium, and growing businesses in Yemen and later the Middle East.

The system should be simple enough for a small grocery store owner with no technical background, while still being powerful enough for companies with multiple branches, employees, warehouses, and accounting requirements.

The design philosophy is:

Simple First.

Professional Always.

Powerful When Needed.

Every screen should reduce user effort.

Every action should require the minimum possible number of taps.

The interface must never overwhelm the user.

The application should feel friendly, fast, clean, and modern.

---

# PRODUCT NAME

Merchant One

Tagline

One Business.
One Platform.
Everything Connected.

---

# LOGO CONCEPT

Design a premium minimalist logo.

The logo should combine:

• Letter M
• Store
• Business
• Connection
• Growth

The logo must work as:

App Icon

Splash Logo

Navigation Logo

Website Logo

The logo should remain recognizable even at 24x24 pixels.

---

# TARGET USERS

Small grocery stores

Retail stores

Wholesale stores

Mini markets

Restaurants

Coffee shops

Pharmacies

Electronics stores

Fashion stores

Growing companies

Businesses with multiple branches

---

# PRODUCT PRINCIPLES

Fast

Minimal

Professional

Modern

Easy to Learn

Easy to Scale

Accounting Ready

Offline Friendly Design

RTL First

Accessible

---

# CORE DATABASE CONTEXT

The entire application must strictly follow the existing database architecture.

Core Domain Entities

Account

Business

Branch

User

Role

Permission

BusinessUser

UserRole

RolePermission

SystemSetting

Authentication

Theme

Language

Every screen must respect these relationships.

Database Relationships

Account

↓

owns

↓

Business (1:N)

Business

↓

contains

↓

Branch (1:N)

Business

↓

contains

↓

Users (1:N)

Users

↓

assigned to

↓

Roles (N:N)

Roles

↓

contain

↓

Permissions (N:N)

Business

↓

contains

↓

Settings

The UI should clearly reflect these relationships.

---

# FIRST USER JOURNEY

The complete onboarding flow must be:

Splash

↓

Welcome

↓

Onboarding

↓

Language Selection

↓

Theme Selection

↓

Login

↓

Register

↓

Business Setup

↓

First Branch Setup

↓

Success

↓

Dashboard (placeholder only)

Never skip any step.

---

# DESIGN SYSTEM

Use Material Design 3.

Use an 8-point spacing system.

Radius

Inputs = 16

Cards = 20

Dialogs = 24

Bottom Sheets = 28

Buttons = 16

Use soft shadows.

Large white spaces.

Rounded layouts.

Minimal borders.

No visual clutter.

---

# COLOR PALETTE

Primary

#2563EB

Primary Container

#DBEAFE

Secondary

#14B8A6

Background

#F8FAFC

Surface

#FFFFFF

Success

#16A34A

Warning

#F59E0B

Error

#DC2626

Text Primary

#0F172A

Text Secondary

#64748B

Border

#E2E8F0

Dark Theme

Background

#0F172A

Surface

#1E293B

---

# TYPOGRAPHY

Primary Font

Inter

Arabic Font

IBM Plex Sans Arabic

Headline

32 Bold

Title

24 SemiBold

Subtitle

18 Medium

Body

16 Regular

Caption

14 Regular

Button

16 Medium

---

# SUPPORT

Light Theme

Dark Theme

System Theme

Arabic

English

RTL

LTR

Dynamic Theme Switching

Large Text Accessibility

Screen Reader Support

---

# SPLASH SCREEN

Show

Logo

Application Name

Tagline

Animated Logo

Soft Gradient Background

Loading Indicator

Duration

2 seconds

---

# ONBOARDING

Create three premium onboarding pages.

Screen One

Title

Manage Your Business with Confidence

Description

Everything you need to manage sales, inventory, accounting, customers, suppliers, and multiple branches from one place.

Illustration

Business Dashboard

---

Screen Two

Title

Built for Every Business

Description

Whether you own a grocery store, restaurant, pharmacy, wholesale business, or retail shop, Merchant One adapts to your workflow.

Illustration

Stores

Branches

Employees

---

Screen Three

Title

Powerful Yet Simple

Description

Fast sales, accurate inventory, secure accounting, and smart reports—all designed to help your business grow.

Illustration

Growth

Analytics

Security

Primary Button

Get Started

Secondary

Skip

---

# LANGUAGE SELECTION

Display

Arabic

English

Each option includes

Language Name

Preview

Flag/Icon

Save selection before continuing.

---

# THEME SELECTION

Allow choosing

Light

Dark

System Default

Show live preview cards.

Persist user preference.

---

# LOGIN SCREEN

Purpose

Authenticate existing users.

Fields

Email Address

Password

Remember Me

Show Password

Forgot Password

Buttons

Login

Create Account

Future placeholders

Biometric Login

Google Login

Microsoft Login

Validation

Required fields

Email format

Password length

Loading state

Offline state

Error state

---

# REGISTER SCREEN

Purpose

Create the Account Owner only.

Do NOT create Business here.

Fields

First Name

Last Name

Username

Email

Phone Number

Password

Confirm Password

Preferred Language

Country

Accept Terms

Button

Create Account

Validation

Strong Password

Email uniqueness

Phone uniqueness

Password confirmation

---

# BUSINESS SETUP

Purpose

Create the Business entity.

Fields

Business Name

Business Type

Business Logo

Business Phone

Business Email

Country

City

Address

Timezone

Default Currency

Fiscal Year Start Month

Button

Continue

---

# FIRST BRANCH SETUP

Purpose

Create the first Branch.

Fields

Branch Name

Branch Code

Phone

Email

Address

Location

Default Branch

Button

Create Branch

---

# AFTER SUCCESS

Automatically create

Owner User

Owner Role

Full Permissions

Business Settings

Default Preferences

Then redirect to Dashboard placeholder.

---

# UX REQUIREMENTS

Every form should support

Auto Validation

Helpful Error Messages

Keyboard Optimization

Loading Indicators

Empty States

Success Feedback

Smooth Animations

The application should feel premium, modern, simple, and trustworthy.

Every screen should reduce cognitive load.

The first-time experience should make a new business owner feel confident and excited to continue using the application.

---

# EXPECTED OUTPUT

Generate complete high-fidelity mobile UI screens including:

• Splash Screen
• Three Onboarding Screens
• Language Selection
• Theme Selection
• Login
• Register
• Business Setup
• First Branch Setup
• Success Screen

Use a consistent design system and production-ready Flutter Material 3 components.

Do not design any Dashboard or business modules yet.
