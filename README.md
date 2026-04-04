<<<<<<< HEAD
# Smart Hostel Management System

A full-stack DBMS-based application that replaces traditional manual hostel management (registers/spreadsheets) with an automated, centralized system. Built with **Node.js**, **Oracle Database**, and **JavaFX**.

---

## Features

### Core Features
- **Student Management** - Complete CRUD operations for student records with emergency contacts
- **Staff Management** - Role-based staff management (warden, admin, housekeeping, security, maintenance)
- **Hostel Block Management** - Multi-block support with warden assignment
- **Room Allocation** - Intelligent room assignment with overbooking prevention via stored procedures
- **Fee & Payment Tracking** - Full fee lifecycle with payment recording and multiple payment methods
- **Complaint System** - Room-based complaint filing with status tracking
- **Reports & Analytics** - Downloadable reports in CSV/JSON format

### Advanced Features
- **Role-Based Authentication (RBAC)** - Staff and Student login with JWT-based auth
- **Smart Dashboard with Analytics** - Visual stats with charts (occupancy, fee collection, feedback)
- **Intelligent Room Allocation** - Auto-suggest rooms based on availability, capacity, and rent
- **Notification System** - Automated notifications for fee dues, complaints, allocations, parcels, discipline
- **Fee Reminder System** - Automatic overdue fee marking with batch processing
- **Discipline/Inquiry System** - Track disciplinary actions with assigned officers
- **Biometric Log** - Entry/exit tracking with fine amounts for late arrivals
- **Parcel Management** - Track parcels from arrival to pickup with courier details
- **Visitor Log** - Visitor entry/exit with ID proof and staff approval
- **Lost & Found** - Report lost items, log found items, claim verification workflow
- **Room Change Requests** - Students can request room transfers with admin approval
- **Waitlist System** - CGPA-based priority waitlist for room allocation
- **Roommate Compatibility** - Preference-based matching (sleep schedule, study habit, neatness)
- **Hostel Feedback** - Rate mess, cleanliness, wifi, maintenance with comments
- **Laundry Management** - Submit laundry orders with item tracking
- **Housekeeping Schedules** - Room cleaning schedule management
- **Emergency Contacts** - Store guardian/emergency contact information per student
- **Downloadable Reports** - Export fee, occupancy, student, and collection reports as CSV or JSON
- **Audit Log System** - Complete audit trail for allocations, fees, and other changes
- **Real-time-like Updates** - Dashboard auto-refreshes via polling (30-second intervals)

### DBMS Advanced Features
- **15 Triggers** - Auto-update room occupancy, overdue fee marking, payment status sync, notification generation, audit logging, laundry item counting, waitlist priority, timestamp updates
- **6 Stored Procedures** - Room allocation/release/transfer with row locking, batch overdue marking, dashboard statistics, roommate compatibility calculation
- **8 Views** - Student-room-fees, room occupancy, complaint summary, fee collection monthly, block occupancy, feedback averages, active visitors, recent audit
- **26 Tables** - Full ER diagram implementation with all clusters (property, security, logistics, financial, discipline, maintenance, housekeeping, compatibility, laundry, property recovery, requests)
- **Complex JOINs** - Multi-table joins across all views and queries
- **Aggregate Functions** - SUM, COUNT, AVG, ROUND, NVL with GROUP BY
- **Transaction Control** - Stored procedures with FOR UPDATE row locking, COMMIT, ROLLBACK

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Backend   | Node.js, Express.js                                 |
| Database  | Oracle Database with PL/SQL                         |
| Frontend  | JavaFX 21 (Desktop Application)                     |
| Auth      | JWT (JSON Web Tokens) + bcrypt                      |
| Build     | Maven (frontend), npm (backend)                     |

---

## Project Structure

```
Smart_hostel_system/
├── database/
│   ├── schema.sql          # 26 tables, 26 sequences, 26 auto-increment triggers
│   ├── triggers.sql         # 15 business logic triggers
│   ├── procedures.sql       # 6 stored procedures
│   ├── views.sql            # 8 database views
│   └── sample_data.sql      # Sample data for testing
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js        # Express app with 23 route modules
│       ├── middleware/
│       │   └── auth.js      # JWT authentication & RBAC
│       ├── routes/
│       │   ├── auth.js          # Login, register (staff & student)
│       │   ├── students.js      # Student CRUD
│       │   ├── staff.js         # Staff CRUD
│       │   ├── blocks.js        # Hostel block management
│       │   ├── rooms.js         # Room CRUD with suggestions
│       │   ├── allocations.js   # Allocation via stored procedures
│       │   ├── fees.js          # Fee management & overdue marking
│       │   ├── payments.js      # Payment tracking
│       │   ├── complaints.js    # Room complaints
│       │   ├── inquiries.js     # Discipline inquiries
│       │   ├── biometric.js     # Entry/exit logs
│       │   ├── parcels.js       # Parcel tracking
│       │   ├── visitors.js      # Visitor log
│       │   ├── lostfound.js     # Lost items, found items, claims
│       │   ├── requests.js      # Room change requests & waitlist
│       │   ├── roommates.js     # Preferences & compatibility
│       │   ├── feedback.js      # Hostel ratings
│       │   ├── laundry.js       # Laundry orders & items
│       │   ├── housekeeping.js  # Room cleaning schedules
│       │   ├── emergency.js     # Emergency contacts
│       │   ├── dashboard.js     # Dashboard stats via stored procedure
│       │   ├── notifications.js # Notification management
│       │   ├── audit.js         # Audit log viewer
│       │   └── reports.js       # CSV/JSON report downloads
│       └── utils/
│           ├── db.js        # Oracle connection pool
│           └── helpers.js   # Row-to-camelCase converter
└── frontend/
    ├── pom.xml              # Maven project (JavaFX 21 + Jackson)
    └── src/main/java/
        ├── module-info.java
        └── com/hostel/
            ├── App.java             # Main application entry
            ├── util/
            │   ├── ApiClient.java   # HTTP client for backend API
            │   └── SessionManager.java  # JWT token & user state
            ├── model/               # POJO models (7 classes)
            └── views/               # JavaFX views (22 classes)
                ├── LoginView.java
                ├── MainLayout.java
                ├── DashboardView.java
                ├── StudentsView.java
                ├── StudentDetailView.java
                ├── StaffView.java
                ├── BlocksView.java
                ├── RoomsView.java
                ├── AllocationsView.java
                ├── FeesView.java
                ├── ComplaintsView.java
                ├── InquiriesView.java
                ├── BiometricView.java
                ├── ParcelsView.java
                ├── VisitorsView.java
                ├── LostFoundView.java
                ├── HousekeepingView.java
                ├── RoomRequestsView.java
                ├── LaundryView.java
                ├── FeedbackView.java
                ├── RoommatesView.java
                ├── NotificationsView.java
                ├── AuditLogsView.java
                └── ReportsView.java
```

---

## Setup Instructions

### Prerequisites
- **Java 21+** with JavaFX support
- **Maven 3.9+**
- **Node.js 18+**
- **Oracle Database** (19c+ recommended)

### 1. Database Setup

```bash
# Connect to Oracle via SQL*Plus
sqlplus username/password@connection_string

# Run scripts in order:
@database/schema.sql
@database/triggers.sql
@database/procedures.sql
@database/views.sql
@database/sample_data.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Oracle credentials
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
mvn javafx:run
```

---

## Default Login Credentials

| Role       | Email                   | Password     |
|------------|-------------------------|--------------|
| Super Admin| superadmin@hostel.edu   | password123  |
| Admin      | admin@hostel.edu        | password123  |
| Warden     | rajesh@hostel.edu       | password123  |
| Student    | amit@student.edu        | password123  |

---

## API Endpoints (23 route modules, 70+ endpoints)

| Module       | Base Path            | Description                          |
|--------------|----------------------|--------------------------------------|
| Auth         | `/api/auth`          | Login, register, current user        |
| Students     | `/api/students`      | Student CRUD with room/fee info      |
| Staff        | `/api/staff`         | Staff CRUD                           |
| Blocks       | `/api/blocks`        | Hostel block management              |
| Rooms        | `/api/rooms`         | Room CRUD with suggestions           |
| Allocations  | `/api/allocations`   | Allocate, release, transfer          |
| Fees         | `/api/fees`          | Fee CRUD, pay, mark overdue          |
| Payments     | `/api/payments`      | Payment history                      |
| Complaints   | `/api/complaints`    | Room complaint management            |
| Inquiries    | `/api/inquiries`     | Discipline inquiry management        |
| Biometric    | `/api/biometric`     | Entry/exit log recording             |
| Parcels      | `/api/parcels`       | Parcel tracking                      |
| Visitors     | `/api/visitors`      | Visitor log with checkout            |
| Lost & Found | `/api/lostfound`     | Lost/found items and claims          |
| Requests     | `/api/requests`      | Room change requests & waitlist      |
| Roommates    | `/api/roommates`     | Preferences & compatibility          |
| Feedback     | `/api/feedback`      | Hostel ratings & comments            |
| Laundry      | `/api/laundry`       | Laundry orders & items               |
| Housekeeping | `/api/housekeeping`  | Room cleaning schedules              |
| Emergency    | `/api/emergency`     | Emergency contact management         |
| Dashboard    | `/api/dashboard`     | Stats, charts, student dashboard     |
| Notifications| `/api/notifications` | Notification management              |
| Audit        | `/api/audit`         | Audit log viewer                     |
| Reports      | `/api/reports`       | CSV/JSON report downloads            |

---

## ER Diagram Clusters

The database implements the complete ER diagram with the following clusters:

1. **Core** - hostel_block, staff, room, student, allocation
2. **Security** - emergency_contact
3. **Financial** - fees, payments
4. **Discipline** - inquiry, notifications
5. **Maintenance** - room_complaints
6. **Housekeeping** - room_keeping
7. **Biometrics** - biometric_log
8. **Property** - parcels
9. **Logistics** - visitor_log
10. **Property Recovery** - lost_items, found_items, item_claim
11. **Requests** - room_change_request, waitlist
12. **Compatibility** - roommate_preference, roommate_compatibility
13. **Feedback** - hostel_feedback
14. **Laundry** - laundry_order, laundry_items
15. **Audit** - audit_logs
=======

>>>>>>> 4acfbdd20bafb0ed4ee18849dc502b266ec4b166
