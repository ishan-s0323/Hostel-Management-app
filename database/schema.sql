-- ============================================================
-- Smart Hostel Management System - Database Schema
-- Oracle Database / SQL*Plus Compatible
-- Matches full ER diagram with all clusters
-- ============================================================

-- Drop existing objects (reverse dependency order)
BEGIN EXECUTE IMMEDIATE 'DROP TABLE audit_logs CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE laundry_items CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE laundry_order CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE hostel_feedback CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE roommate_compatibility CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE roommate_preference CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE waitlist CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE room_change_request CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE item_claim CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE found_items CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE lost_items CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE visitor_log CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE parcels CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE biometric_log CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE room_keeping CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE room_complaints CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE notifications CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE inquiry CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE payments CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE fees CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE emergency_contact CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE allocation CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE student CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE room CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE staff CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE hostel_block CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- Drop all sequences
DECLARE
    CURSOR seq_cur IS SELECT sequence_name FROM user_sequences WHERE sequence_name LIKE 'SEQ_%';
BEGIN
    FOR r IN seq_cur LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || r.sequence_name;
    END LOOP;
END;
/

-- ============================================================
-- SEQUENCES
-- ============================================================
CREATE SEQUENCE seq_hostel_block START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_staff START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_room START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_student START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_allocation START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_emergency_contact START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_fees START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_payments START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_inquiry START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_notifications START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_room_complaints START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_room_keeping START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_biometric_log START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_parcels START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_visitor_log START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_lost_items START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_found_items START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_item_claim START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_room_change_request START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_waitlist START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_roommate_pref START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_roommate_compat START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_hostel_feedback START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_laundry_order START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_laundry_items START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_audit_logs START WITH 1 INCREMENT BY 1 NOCACHE;

-- ============================================================
-- 1. HOSTEL_BLOCK
-- ============================================================
CREATE TABLE hostel_block (
    block_id      NUMBER PRIMARY KEY,
    block_name    VARCHAR2(50) NOT NULL,
    floors        NUMBER NOT NULL,
    warden_id     NUMBER,
    CONSTRAINT uq_block_name UNIQUE (block_name),
    CONSTRAINT chk_block_floors CHECK (floors > 0)
);

-- ============================================================
-- 2. STAFF
-- ============================================================
CREATE TABLE staff (
    staff_id    NUMBER PRIMARY KEY,
    name        VARCHAR2(100) NOT NULL,
    role        VARCHAR2(50) NOT NULL,
    phone       VARCHAR2(20),
    email       VARCHAR2(150) NOT NULL,
    password    VARCHAR2(255) NOT NULL,
    block_id    NUMBER,
    created_at  TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT uq_staff_email UNIQUE (email),
    CONSTRAINT fk_staff_block FOREIGN KEY (block_id) REFERENCES hostel_block(block_id) ON DELETE SET NULL,
    CONSTRAINT chk_staff_role CHECK (role IN ('warden', 'admin', 'superadmin', 'housekeeping', 'security', 'maintenance'))
);

-- Add warden FK to hostel_block now that staff exists
ALTER TABLE hostel_block ADD CONSTRAINT fk_block_warden FOREIGN KEY (warden_id) REFERENCES staff(staff_id) ON DELETE SET NULL;

-- ============================================================
-- 3. ROOM
-- ============================================================
CREATE TABLE room (
    room_id             NUMBER PRIMARY KEY,
    block_id            NUMBER NOT NULL,
    room_type           VARCHAR2(20) NOT NULL,
    capacity            NUMBER NOT NULL,
    current_occupancy   NUMBER DEFAULT 0 NOT NULL,
    availability_status VARCHAR2(20) DEFAULT 'available',
    floor_num           NUMBER NOT NULL,
    rent_per_month      NUMBER(10,2) DEFAULT 0,
    CONSTRAINT fk_room_block FOREIGN KEY (block_id) REFERENCES hostel_block(block_id) ON DELETE CASCADE,
    CONSTRAINT chk_room_type CHECK (room_type IN ('single', 'double', 'triple', 'dormitory')),
    CONSTRAINT chk_room_cap CHECK (capacity > 0),
    CONSTRAINT chk_room_occ CHECK (current_occupancy >= 0),
    CONSTRAINT chk_room_occ_cap CHECK (current_occupancy <= capacity),
    CONSTRAINT chk_room_avail CHECK (availability_status IN ('available', 'full', 'maintenance'))
);

CREATE INDEX idx_room_block ON room(block_id);
CREATE INDEX idx_room_status ON room(availability_status);

-- ============================================================
-- 4. STUDENT
-- ============================================================
CREATE TABLE student (
    student_id       NUMBER PRIMARY KEY,
    name             VARCHAR2(100) NOT NULL,
    gender           VARCHAR2(10),
    year_of_study    NUMBER(1),
    date_of_birth    DATE,
    cgpa             NUMBER(4,2),
    department       VARCHAR2(100),
    phone            VARCHAR2(20),
    email            VARCHAR2(150) NOT NULL,
    password         VARCHAR2(255) NOT NULL,
    current_stay_type VARCHAR2(20) DEFAULT 'hosteler',
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at       TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT uq_student_email UNIQUE (email),
    CONSTRAINT chk_stu_gender CHECK (gender IN ('male', 'female', 'other')),
    CONSTRAINT chk_stu_year CHECK (year_of_study BETWEEN 1 AND 6),
    CONSTRAINT chk_stu_cgpa CHECK (cgpa BETWEEN 0 AND 10),
    CONSTRAINT chk_stu_stay CHECK (current_stay_type IN ('hosteler', 'day_scholar'))
);

CREATE INDEX idx_student_email ON student(email);
CREATE INDEX idx_student_dept ON student(department);

-- ============================================================
-- 5. ALLOCATION
-- ============================================================
CREATE TABLE allocation (
    allocation_id  NUMBER PRIMARY KEY,
    student_id     NUMBER NOT NULL,
    room_id        NUMBER NOT NULL,
    check_in_date  DATE DEFAULT SYSDATE NOT NULL,
    check_out_date DATE,
    status         VARCHAR2(20) DEFAULT 'active',
    created_at     TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_alloc_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_alloc_room FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
    CONSTRAINT chk_alloc_status CHECK (status IN ('active', 'checked_out', 'transferred'))
);

CREATE INDEX idx_alloc_student ON allocation(student_id);
CREATE INDEX idx_alloc_room ON allocation(room_id);
CREATE INDEX idx_alloc_status ON allocation(status);

-- ============================================================
-- 6. EMERGENCY_CONTACT (Security Cluster)
-- ============================================================
CREATE TABLE emergency_contact (
    contact_id  NUMBER PRIMARY KEY,
    student_id  NUMBER NOT NULL,
    name        VARCHAR2(100) NOT NULL,
    relation    VARCHAR2(50) NOT NULL,
    phone       VARCHAR2(20) NOT NULL,
    email       VARCHAR2(150),
    CONSTRAINT fk_ec_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

CREATE INDEX idx_ec_student ON emergency_contact(student_id);

-- ============================================================
-- 7. FEES (Financial Cluster)
-- ============================================================
CREATE TABLE fees (
    fee_id      NUMBER PRIMARY KEY,
    student_id  NUMBER NOT NULL,
    amount      NUMBER(10,2) NOT NULL,
    due_date    DATE NOT NULL,
    fee_type    VARCHAR2(50) NOT NULL,
    status      VARCHAR2(20) DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_fee_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_fee_type CHECK (fee_type IN ('hostel_rent', 'mess', 'maintenance', 'security_deposit', 'laundry', 'other')),
    CONSTRAINT chk_fee_amt CHECK (amount > 0),
    CONSTRAINT chk_fee_status CHECK (status IN ('pending', 'paid', 'overdue', 'waived'))
);

CREATE INDEX idx_fee_student ON fees(student_id);
CREATE INDEX idx_fee_status ON fees(status);

-- ============================================================
-- 8. PAYMENTS (Financial Cluster)
-- ============================================================
CREATE TABLE payments (
    payment_id            NUMBER PRIMARY KEY,
    fee_id                NUMBER NOT NULL,
    student_id            NUMBER NOT NULL,
    transaction_reference VARCHAR2(100),
    amount_paid           NUMBER(10,2) NOT NULL,
    payment_date          DATE DEFAULT SYSDATE,
    payment_method        VARCHAR2(30),
    payment_status        VARCHAR2(20) DEFAULT 'completed',
    CONSTRAINT fk_pay_fee FOREIGN KEY (fee_id) REFERENCES fees(fee_id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_pay_method CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'online', 'upi')),
    CONSTRAINT chk_pay_status CHECK (payment_status IN ('completed', 'pending', 'failed', 'refunded'))
);

CREATE INDEX idx_pay_fee ON payments(fee_id);
CREATE INDEX idx_pay_student ON payments(student_id);

-- ============================================================
-- 9. INQUIRY (Discipline Cluster)
-- ============================================================
CREATE TABLE inquiry (
    inquiry_id          NUMBER PRIMARY KEY,
    student_id          NUMBER NOT NULL,
    description         CLOB NOT NULL,
    start_date          DATE DEFAULT SYSDATE,
    status              VARCHAR2(20) DEFAULT 'open',
    disciplinary_officer NUMBER,
    created_at          TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_inq_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_inq_officer FOREIGN KEY (disciplinary_officer) REFERENCES staff(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_inq_status CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed'))
);

CREATE INDEX idx_inq_student ON inquiry(student_id);

-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    notification_id NUMBER PRIMARY KEY,
    student_id      NUMBER,
    staff_id        NUMBER,
    message         CLOB NOT NULL,
    notif_type      VARCHAR2(30) NOT NULL,
    date_sent       TIMESTAMP DEFAULT SYSTIMESTAMP,
    is_read         NUMBER(1) DEFAULT 0,
    CONSTRAINT fk_notif_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    CONSTRAINT chk_notif_type CHECK (notif_type IN ('fee_due', 'fee_overdue', 'complaint_update', 'room_allocation', 'discipline', 'parcel', 'general')),
    CONSTRAINT chk_notif_read CHECK (is_read IN (0, 1))
);

CREATE INDEX idx_notif_student ON notifications(student_id);
CREATE INDEX idx_notif_staff ON notifications(staff_id);

-- ============================================================
-- 11. ROOM_COMPLAINTS (Maintenance Cluster)
-- ============================================================
CREATE TABLE room_complaints (
    complaint_id   NUMBER PRIMARY KEY,
    room_id        NUMBER NOT NULL,
    student_id     NUMBER NOT NULL,
    description    CLOB NOT NULL,
    reporter_name  VARCHAR2(100),
    reported_date  DATE DEFAULT SYSDATE,
    status         VARCHAR2(20) DEFAULT 'open',
    CONSTRAINT fk_rc_room FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
    CONSTRAINT fk_rc_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_rc_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

CREATE INDEX idx_rc_room ON room_complaints(room_id);
CREATE INDEX idx_rc_student ON room_complaints(student_id);

-- ============================================================
-- 12. ROOM_KEEPING (Housekeeping Cluster)
-- ============================================================
CREATE TABLE room_keeping (
    schedule_id    NUMBER PRIMARY KEY,
    room_id        NUMBER NOT NULL,
    staff_id       NUMBER NOT NULL,
    scheduled_date DATE NOT NULL,
    status         VARCHAR2(20) DEFAULT 'scheduled',
    CONSTRAINT fk_rk_room FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
    CONSTRAINT fk_rk_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    CONSTRAINT chk_rk_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_rk_room ON room_keeping(room_id);
CREATE INDEX idx_rk_date ON room_keeping(scheduled_date);

-- ============================================================
-- 13. BIOMETRIC_LOG
-- ============================================================
CREATE TABLE biometric_log (
    log_id         NUMBER PRIMARY KEY,
    student_id     NUMBER NOT NULL,
    log_timestamp  TIMESTAMP DEFAULT SYSTIMESTAMP,
    scan_type      VARCHAR2(10) NOT NULL,
    scan_location  VARCHAR2(100),
    fine_amount    NUMBER(10,2) DEFAULT 0,
    CONSTRAINT fk_bio_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_bio_type CHECK (scan_type IN ('ENTRY', 'EXIT'))
);

CREATE INDEX idx_bio_student ON biometric_log(student_id);
CREATE INDEX idx_bio_time ON biometric_log(log_timestamp);

-- ============================================================
-- 14. PARCELS (Property Cluster)
-- ============================================================
CREATE TABLE parcels (
    parcel_id        NUMBER PRIMARY KEY,
    student_id       NUMBER NOT NULL,
    courier_company  VARCHAR2(100),
    reference_number VARCHAR2(100),
    arrival_date     DATE DEFAULT SYSDATE,
    pickup_deadline  DATE,
    status           VARCHAR2(20) DEFAULT 'arrived',
    weight_category  VARCHAR2(20),
    received_by      NUMBER,
    CONSTRAINT fk_parcel_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_parcel_staff FOREIGN KEY (received_by) REFERENCES staff(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_parcel_status CHECK (status IN ('arrived', 'notified', 'picked_up', 'returned')),
    CONSTRAINT chk_parcel_weight CHECK (weight_category IN ('light', 'medium', 'heavy'))
);

CREATE INDEX idx_parcel_student ON parcels(student_id);

-- ============================================================
-- 15. VISITOR_LOG (Logistics Cluster)
-- ============================================================
CREATE TABLE visitor_log (
    visitor_id          NUMBER PRIMARY KEY,
    student_id          NUMBER NOT NULL,
    visitor_name        VARCHAR2(100) NOT NULL,
    relation            VARCHAR2(50),
    phone               VARCHAR2(20),
    id_proof            VARCHAR2(100),
    entry_time          TIMESTAMP DEFAULT SYSTIMESTAMP,
    exit_time           TIMESTAMP,
    approved_by_staff_id NUMBER,
    CONSTRAINT fk_vl_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_vl_staff FOREIGN KEY (approved_by_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);

CREATE INDEX idx_vl_student ON visitor_log(student_id);
CREATE INDEX idx_vl_entry ON visitor_log(entry_time);

-- ============================================================
-- 16. LOST_ITEMS (Property Recovery Cluster)
-- ============================================================
CREATE TABLE lost_items (
    lost_id      NUMBER PRIMARY KEY,
    student_id   NUMBER NOT NULL,
    item_name    VARCHAR2(100) NOT NULL,
    description  CLOB,
    lost_date    DATE DEFAULT SYSDATE,
    status       VARCHAR2(20) DEFAULT 'lost',
    CONSTRAINT fk_li_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_li_status CHECK (status IN ('lost', 'found', 'claimed', 'closed'))
);

CREATE INDEX idx_li_student ON lost_items(student_id);

-- ============================================================
-- 17. FOUND_ITEMS (Property Recovery Cluster)
-- ============================================================
CREATE TABLE found_items (
    found_id       NUMBER PRIMARY KEY,
    found_by_staff NUMBER,
    item_name      VARCHAR2(100) NOT NULL,
    description    CLOB,
    found_date     DATE DEFAULT SYSDATE,
    location       VARCHAR2(100),
    status         VARCHAR2(20) DEFAULT 'unclaimed',
    CONSTRAINT fk_fi_staff FOREIGN KEY (found_by_staff) REFERENCES staff(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_fi_status CHECK (status IN ('unclaimed', 'claimed', 'disposed'))
);

-- ============================================================
-- 18. ITEM_CLAIM (Property Recovery Cluster)
-- ============================================================
CREATE TABLE item_claim (
    claim_id            NUMBER PRIMARY KEY,
    lost_id             NUMBER,
    found_id            NUMBER,
    verification_status VARCHAR2(20) DEFAULT 'pending',
    claim_date          DATE DEFAULT SYSDATE,
    CONSTRAINT fk_ic_lost FOREIGN KEY (lost_id) REFERENCES lost_items(lost_id) ON DELETE CASCADE,
    CONSTRAINT fk_ic_found FOREIGN KEY (found_id) REFERENCES found_items(found_id) ON DELETE CASCADE,
    CONSTRAINT chk_ic_status CHECK (verification_status IN ('pending', 'verified', 'rejected'))
);

-- ============================================================
-- 19. ROOM_CHANGE_REQUEST (Requests Cluster)
-- ============================================================
CREATE TABLE room_change_request (
    request_id          NUMBER PRIMARY KEY,
    student_id          NUMBER NOT NULL,
    current_room_id     NUMBER,
    requested_block     NUMBER,
    requested_room_type VARCHAR2(20),
    reason              CLOB,
    reviewed_by         NUMBER,
    status              VARCHAR2(20) DEFAULT 'pending',
    created_at          TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_rcr_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_rcr_room FOREIGN KEY (current_room_id) REFERENCES room(room_id) ON DELETE SET NULL,
    CONSTRAINT fk_rcr_block FOREIGN KEY (requested_block) REFERENCES hostel_block(block_id) ON DELETE SET NULL,
    CONSTRAINT fk_rcr_staff FOREIGN KEY (reviewed_by) REFERENCES staff(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_rcr_status CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

CREATE INDEX idx_rcr_student ON room_change_request(student_id);

-- ============================================================
-- 20. WAITLIST (Requests Cluster)
-- ============================================================
CREATE TABLE waitlist (
    waitlist_id   NUMBER PRIMARY KEY,
    student_id    NUMBER NOT NULL,
    block_id      NUMBER,
    room_type     VARCHAR2(20),
    priority_rank NUMBER,
    based_on_cgpa NUMBER(4,2),
    date_added    DATE DEFAULT SYSDATE,
    CONSTRAINT fk_wl_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_wl_block FOREIGN KEY (block_id) REFERENCES hostel_block(block_id) ON DELETE SET NULL,
    CONSTRAINT chk_wl_type CHECK (room_type IN ('single', 'double', 'triple', 'dormitory'))
);

CREATE INDEX idx_wl_student ON waitlist(student_id);
CREATE INDEX idx_wl_priority ON waitlist(priority_rank);

-- ============================================================
-- 21. ROOMMATE_PREFERENCE (Compatibility Cluster)
-- ============================================================
CREATE TABLE roommate_preference (
    preference_id  NUMBER PRIMARY KEY,
    student_id     NUMBER NOT NULL,
    sleep_schedule VARCHAR2(20),
    study_habit    VARCHAR2(20),
    neatness_level VARCHAR2(20),
    CONSTRAINT fk_rp_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT uq_rp_student UNIQUE (student_id),
    CONSTRAINT chk_rp_sleep CHECK (sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
    CONSTRAINT chk_rp_study CHECK (study_habit IN ('quiet', 'moderate', 'social')),
    CONSTRAINT chk_rp_neat CHECK (neatness_level IN ('very_neat', 'moderate', 'relaxed'))
);

-- ============================================================
-- 22. ROOMMATE_COMPATIBILITY (Compatibility Cluster)
-- ============================================================
CREATE TABLE roommate_compatibility (
    compatibility_id       NUMBER PRIMARY KEY,
    student1_id            NUMBER NOT NULL,
    student2_id            NUMBER NOT NULL,
    compatibility_percentage NUMBER(5,2),
    date_calculated        DATE DEFAULT SYSDATE,
    CONSTRAINT fk_rmc_s1 FOREIGN KEY (student1_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_rmc_s2 FOREIGN KEY (student2_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_rmc_pct CHECK (compatibility_percentage BETWEEN 0 AND 100)
);

CREATE INDEX idx_rmc_s1 ON roommate_compatibility(student1_id);
CREATE INDEX idx_rmc_s2 ON roommate_compatibility(student2_id);

-- ============================================================
-- 23. HOSTEL_FEEDBACK
-- ============================================================
CREATE TABLE hostel_feedback (
    feedback_id        NUMBER PRIMARY KEY,
    student_id         NUMBER NOT NULL,
    mess_rating        NUMBER(1),
    cleanliness_rating NUMBER(1),
    wifi_rating        NUMBER(1),
    maintenance_rating NUMBER(1),
    comments           CLOB,
    date_submitted     DATE DEFAULT SYSDATE,
    CONSTRAINT fk_hf_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_hf_mess CHECK (mess_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_hf_clean CHECK (cleanliness_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_hf_wifi CHECK (wifi_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_hf_maint CHECK (maintenance_rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_hf_student ON hostel_feedback(student_id);

-- ============================================================
-- 24. LAUNDRY_ORDER (Laundry Cluster)
-- ============================================================
CREATE TABLE laundry_order (
    order_id             NUMBER PRIMARY KEY,
    student_id           NUMBER NOT NULL,
    items_count          NUMBER DEFAULT 0,
    submit_date          DATE DEFAULT SYSDATE,
    status               VARCHAR2(20) DEFAULT 'submitted',
    expected_return_date DATE,
    CONSTRAINT fk_lo_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_lo_status CHECK (status IN ('submitted', 'processing', 'ready', 'collected'))
);

CREATE INDEX idx_lo_student ON laundry_order(student_id);

-- ============================================================
-- 25. LAUNDRY_ITEMS (Laundry Cluster)
-- ============================================================
CREATE TABLE laundry_items (
    item_id   NUMBER PRIMARY KEY,
    order_id  NUMBER NOT NULL,
    item_type VARCHAR2(50) NOT NULL,
    quantity  NUMBER DEFAULT 1,
    CONSTRAINT fk_li_order FOREIGN KEY (order_id) REFERENCES laundry_order(order_id) ON DELETE CASCADE,
    CONSTRAINT chk_li_qty CHECK (quantity > 0)
);

CREATE INDEX idx_litm_order ON laundry_items(order_id);

-- ============================================================
-- 26. AUDIT_LOGS
-- ============================================================
CREATE TABLE audit_logs (
    log_id         NUMBER PRIMARY KEY,
    entity_type    VARCHAR2(50) NOT NULL,
    entity_id      NUMBER,
    action         VARCHAR2(20) NOT NULL,
    old_values     CLOB,
    new_values     CLOB,
    performed_by   NUMBER,
    performer_type VARCHAR2(10),
    created_at     TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT chk_al_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_al_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_al_date ON audit_logs(created_at);

-- ============================================================
-- AUTO-INCREMENT TRIGGERS
-- ============================================================
CREATE OR REPLACE TRIGGER trg_block_bi BEFORE INSERT ON hostel_block FOR EACH ROW
BEGIN IF :NEW.block_id IS NULL THEN :NEW.block_id := seq_hostel_block.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_staff_bi BEFORE INSERT ON staff FOR EACH ROW
BEGIN IF :NEW.staff_id IS NULL THEN :NEW.staff_id := seq_staff.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_room_bi BEFORE INSERT ON room FOR EACH ROW
BEGIN IF :NEW.room_id IS NULL THEN :NEW.room_id := seq_room.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_student_bi BEFORE INSERT ON student FOR EACH ROW
BEGIN IF :NEW.student_id IS NULL THEN :NEW.student_id := seq_student.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_allocation_bi BEFORE INSERT ON allocation FOR EACH ROW
BEGIN IF :NEW.allocation_id IS NULL THEN :NEW.allocation_id := seq_allocation.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_ec_bi BEFORE INSERT ON emergency_contact FOR EACH ROW
BEGIN IF :NEW.contact_id IS NULL THEN :NEW.contact_id := seq_emergency_contact.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_fees_bi BEFORE INSERT ON fees FOR EACH ROW
BEGIN IF :NEW.fee_id IS NULL THEN :NEW.fee_id := seq_fees.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_payments_bi BEFORE INSERT ON payments FOR EACH ROW
BEGIN IF :NEW.payment_id IS NULL THEN :NEW.payment_id := seq_payments.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_inquiry_bi BEFORE INSERT ON inquiry FOR EACH ROW
BEGIN IF :NEW.inquiry_id IS NULL THEN :NEW.inquiry_id := seq_inquiry.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_notif_bi BEFORE INSERT ON notifications FOR EACH ROW
BEGIN IF :NEW.notification_id IS NULL THEN :NEW.notification_id := seq_notifications.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_rc_bi BEFORE INSERT ON room_complaints FOR EACH ROW
BEGIN IF :NEW.complaint_id IS NULL THEN :NEW.complaint_id := seq_room_complaints.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_rk_bi BEFORE INSERT ON room_keeping FOR EACH ROW
BEGIN IF :NEW.schedule_id IS NULL THEN :NEW.schedule_id := seq_room_keeping.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_bio_bi BEFORE INSERT ON biometric_log FOR EACH ROW
BEGIN IF :NEW.log_id IS NULL THEN :NEW.log_id := seq_biometric_log.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_parcel_bi BEFORE INSERT ON parcels FOR EACH ROW
BEGIN IF :NEW.parcel_id IS NULL THEN :NEW.parcel_id := seq_parcels.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_vl_bi BEFORE INSERT ON visitor_log FOR EACH ROW
BEGIN IF :NEW.visitor_id IS NULL THEN :NEW.visitor_id := seq_visitor_log.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_li_bi BEFORE INSERT ON lost_items FOR EACH ROW
BEGIN IF :NEW.lost_id IS NULL THEN :NEW.lost_id := seq_lost_items.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_fi_bi BEFORE INSERT ON found_items FOR EACH ROW
BEGIN IF :NEW.found_id IS NULL THEN :NEW.found_id := seq_found_items.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_ic_bi BEFORE INSERT ON item_claim FOR EACH ROW
BEGIN IF :NEW.claim_id IS NULL THEN :NEW.claim_id := seq_item_claim.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_rcr_bi BEFORE INSERT ON room_change_request FOR EACH ROW
BEGIN IF :NEW.request_id IS NULL THEN :NEW.request_id := seq_room_change_request.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_wl_bi BEFORE INSERT ON waitlist FOR EACH ROW
BEGIN IF :NEW.waitlist_id IS NULL THEN :NEW.waitlist_id := seq_waitlist.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_rp_bi BEFORE INSERT ON roommate_preference FOR EACH ROW
BEGIN IF :NEW.preference_id IS NULL THEN :NEW.preference_id := seq_roommate_pref.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_rmc_bi BEFORE INSERT ON roommate_compatibility FOR EACH ROW
BEGIN IF :NEW.compatibility_id IS NULL THEN :NEW.compatibility_id := seq_roommate_compat.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_hf_bi BEFORE INSERT ON hostel_feedback FOR EACH ROW
BEGIN IF :NEW.feedback_id IS NULL THEN :NEW.feedback_id := seq_hostel_feedback.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_lo_bi BEFORE INSERT ON laundry_order FOR EACH ROW
BEGIN IF :NEW.order_id IS NULL THEN :NEW.order_id := seq_laundry_order.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_litm_bi BEFORE INSERT ON laundry_items FOR EACH ROW
BEGIN IF :NEW.item_id IS NULL THEN :NEW.item_id := seq_laundry_items.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_al_bi BEFORE INSERT ON audit_logs FOR EACH ROW
BEGIN IF :NEW.log_id IS NULL THEN :NEW.log_id := seq_audit_logs.NEXTVAL; END IF; END;
/

COMMIT;
