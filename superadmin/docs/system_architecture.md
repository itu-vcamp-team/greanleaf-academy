# Superadmin System Architecture

## Overview
The Superadmin system acts as a "Single Pane of Glass" for all Greenleaf Academy instances globally.

```mermaid
graph TD
    SA[Superadmin Dashboard] -->|Auth & Management| DEP1[Academy TR]
    SA -->|Auth & Management| DEP2[Academy DE]
    SA -->|Auth & Management| DEP3[Academy FR]
    
    subgraph "Deployment Instance"
        DEP1 --> API1[Public API]
        DEP1 --> SAPI1[Internal Superadmin API]
        DEP1 --> DB1[(Instance DB)]
    end
```

## Communication Protocol
- **Outbound:** Superadmin initiates requests to Deployments.
- **Payload:** JSON over HTTPS.
- **Security:** Bearer Token (X-Superadmin-Key).

## Core Modules
1. **Deployment Registry**: Database of all instances.
2. **Proxy Service**: Forwarding system-level requests.
3. **Metric Aggregator**: Combined view of all users and activity.
4. **Auth Service**: Superadmin-specific login (separate from academies).
