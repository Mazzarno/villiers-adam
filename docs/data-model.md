# Data model

This document defines the core data model for the CMS.

## Enums

- UserRole: SUPER_ADMIN, ADMIN_MAIRIE, AGENT, CONTRIBUTOR, READER
- ContentStatus: DRAFT, SCHEDULED, PUBLISHED, ARCHIVED
- AgendaType: COMMUNAL, ASSOCIATIF, DECHETS
- DirectoryType: ASSOCIATION, ENTERPRISE, COMMERCE
- MediaType: IMAGE, VIDEO, DOCUMENT
- ReservationStatus: PENDING, APPROVED, REJECTED, CANCELLED
- FormType: CONTACT, SIGNALEMENT
- FormStatus: NEW, IN_PROGRESS, CLOSED
- AuditAction: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PUBLISH, ARCHIVE, RESTORE, EXPORT

## Core entities

- User: admin accounts with roles and MFA
- Page: static pages (mairie, conseil, services)
- Article: actualites, with optional flash flag
- Event: events with dates and location
- AgendaItem: agenda entries for communal/associatif/dechets
- DirectoryEntry: associations/enterprises/commerce listings
- Procedure: demarches administratives
- Media: images/videos/documents stored in MinIO
- Room: rooms/gites that can be reserved
- Reservation: booking requests from citizens
- FormSubmission: contact/signalement submissions
- NewsletterSubscription: email subscriptions with topics
- NewsletterTopic: topics for subscriptions
- Settings: branding + accessibility configuration
- Session: refresh token sessions
- PasswordResetToken: password reset tokens
- Version: content snapshots for restore
- AuditLog: user actions for traceability

## Relationships overview

```
User ──┬── Page
       ├── Article
       ├── Event
       ├── AgendaItem
       ├── DirectoryEntry
       ├── Procedure
       ├── Session
       ├── PasswordResetToken
       ├── Version
       └── AuditLog

Media ──┬── PageMedia ─── Page
        ├── ArticleMedia ─ Article
        ├── EventMedia ─── Event
        ├── ProcedureMedia ─ Procedure
        └── DirectoryEntryMedia ─ DirectoryEntry

Room ─── Reservation

NewsletterSubscription ─ NewsletterSubscriptionTopic ─ NewsletterTopic
```

## Constraints

- Slugs are unique per content type
- Published content requires publishedAt
- Scheduled content requires scheduledAt
- Media storageKey is unique
- Settings is a singleton row (id = "default")
