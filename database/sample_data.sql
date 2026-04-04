-- ============================================================
-- Smart Hostel Management System - Sample Data
-- Oracle PL/SQL - Run AFTER schema.sql, triggers.sql, procedures.sql, views.sql
-- Note: Passwords are bcrypt hashed version of 'password123'
-- ============================================================
SET DEFINE OFF;

-- ============================================================
-- HOSTEL BLOCKS
-- ============================================================
INSERT INTO hostel_block (block_name, floors) VALUES ('Block A', 4);
INSERT INTO hostel_block (block_name, floors) VALUES ('Block B', 3);
INSERT INTO hostel_block (block_name, floors) VALUES ('Block C', 5);

-- ============================================================
-- STAFF
-- ============================================================
INSERT INTO staff (name, role, phone, email, password, block_id)
VALUES ('Dr. Rajesh Kumar', 'warden', '9876543210', 'rajesh@hostel.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 1);

INSERT INTO staff (name, role, phone, email, password, block_id)
VALUES ('Admin User', 'admin', '9876543211', 'admin@hostel.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', NULL);

INSERT INTO staff (name, role, phone, email, password, block_id)
VALUES ('Super Admin', 'superadmin', '9876543212', 'superadmin@hostel.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', NULL);

INSERT INTO staff (name, role, phone, email, password, block_id)
VALUES ('Priya Singh', 'housekeeping', '9876543213', 'priya@hostel.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 1);

INSERT INTO staff (name, role, phone, email, password, block_id)
VALUES ('Ravi Security', 'security', '9876543214', 'ravi@hostel.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', NULL);

INSERT INTO staff (name, role, phone, email, password, block_id)
VALUES ('Suresh Maintenance', 'maintenance', '9876543215', 'suresh@hostel.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 2);

-- Set wardens
UPDATE hostel_block SET warden_id = 1 WHERE block_id = 1;
UPDATE hostel_block SET warden_id = 1 WHERE block_id = 2;

-- ============================================================
-- ROOMS (15 rooms across 3 blocks)
-- ============================================================
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (1, 'single', 1, 0, 'available', 1, 5000);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (1, 'double', 2, 0, 'available', 1, 3500);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (1, 'double', 2, 0, 'available', 2, 3500);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (1, 'triple', 3, 0, 'available', 2, 2500);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (1, 'dormitory', 6, 0, 'available', 3, 1500);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (2, 'single', 1, 0, 'available', 1, 5500);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (2, 'double', 2, 0, 'available', 1, 3800);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (2, 'double', 2, 0, 'available', 2, 3800);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (2, 'triple', 3, 0, 'available', 2, 2800);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (2, 'dormitory', 6, 0, 'available', 3, 1800);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (3, 'single', 1, 0, 'available', 1, 6000);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (3, 'double', 2, 0, 'available', 2, 4000);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (3, 'triple', 3, 0, 'available', 3, 3000);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (3, 'dormitory', 6, 0, 'available', 4, 2000);
INSERT INTO room (block_id, room_type, capacity, current_occupancy, availability_status, floor_num, rent_per_month) VALUES (3, 'single', 1, 0, 'maintenance', 5, 6000);

-- ============================================================
-- STUDENTS (12)
-- ============================================================
INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Amit Sharma', 'male', 2, TO_DATE('2003-05-15','YYYY-MM-DD'), 8.5, 'Computer Science', '9001000001', 'amit@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Neha Gupta', 'female', 3, TO_DATE('2002-08-22','YYYY-MM-DD'), 9.1, 'Electronics', '9001000002', 'neha@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Rahul Verma', 'male', 1, TO_DATE('2004-01-10','YYYY-MM-DD'), 7.8, 'Mechanical', '9001000003', 'rahul@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Priya Patel', 'female', 4, TO_DATE('2001-11-30','YYYY-MM-DD'), 8.9, 'Computer Science', '9001000004', 'priyap@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Karan Singh', 'male', 2, TO_DATE('2003-03-25','YYYY-MM-DD'), 7.2, 'Civil', '9001000005', 'karan@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Anjali Reddy', 'female', 1, TO_DATE('2004-07-18','YYYY-MM-DD'), 8.0, 'Electronics', '9001000006', 'anjali@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'day_scholar');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Vikram Joshi', 'male', 3, TO_DATE('2002-12-05','YYYY-MM-DD'), 6.5, 'Mechanical', '9001000007', 'vikram@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Divya Nair', 'female', 2, TO_DATE('2003-09-14','YYYY-MM-DD'), 9.3, 'Computer Science', '9001000008', 'divya@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Arun Kumar', 'male', 4, TO_DATE('2001-04-20','YYYY-MM-DD'), 7.0, 'Civil', '9001000009', 'arun@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'day_scholar');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Sneha Iyer', 'female', 1, TO_DATE('2004-06-08','YYYY-MM-DD'), 8.7, 'Electronics', '9001000010', 'sneha@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Rohan Das', 'male', 2, TO_DATE('2003-02-28','YYYY-MM-DD'), 7.5, 'Computer Science', '9001000011', 'rohan@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

INSERT INTO student (name, gender, year_of_study, date_of_birth, cgpa, department, phone, email, password, current_stay_type)
VALUES ('Meera Krishnan', 'female', 3, TO_DATE('2002-10-12','YYYY-MM-DD'), 9.0, 'Mechanical', '9001000012', 'meera@student.edu', '$2a$10$8KzaNdKwG1XKh.PjL8i8u.5R8VxMm0vRJ7v6b2VzEhOqGH9N8gKlW', 'hosteler');

-- ============================================================
-- EMERGENCY CONTACTS
-- ============================================================
INSERT INTO emergency_contact (student_id, name, relation, phone, email) VALUES (1, 'Raj Sharma', 'Father', '9800100001', 'raj.sharma@email.com');
INSERT INTO emergency_contact (student_id, name, relation, phone, email) VALUES (2, 'Suman Gupta', 'Mother', '9800100002', 'suman.gupta@email.com');
INSERT INTO emergency_contact (student_id, name, relation, phone, email) VALUES (3, 'Deepak Verma', 'Father', '9800100003', NULL);
INSERT INTO emergency_contact (student_id, name, relation, phone, email) VALUES (4, 'Meena Patel', 'Mother', '9800100004', 'meena.patel@email.com');
INSERT INTO emergency_contact (student_id, name, relation, phone, email) VALUES (5, 'Gurpreet Singh', 'Father', '9800100005', NULL);

-- ============================================================
-- ALLOCATIONS (triggers will update room occupancy)
-- ============================================================
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (1, 1, TO_DATE('2025-07-01','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (2, 2, TO_DATE('2025-07-01','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (3, 2, TO_DATE('2025-07-02','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (4, 6, TO_DATE('2025-07-01','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (5, 4, TO_DATE('2025-07-03','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (7, 7, TO_DATE('2025-07-01','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (8, 11, TO_DATE('2025-07-02','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (10, 3, TO_DATE('2025-07-04','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (11, 5, TO_DATE('2025-07-01','YYYY-MM-DD'), 'active');
INSERT INTO allocation (student_id, room_id, check_in_date, status) VALUES (12, 9, TO_DATE('2025-07-01','YYYY-MM-DD'), 'active');

-- ============================================================
-- FEES (triggers will auto-notify)
-- ============================================================
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (1, 5000, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'paid');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (1, 3000, TO_DATE('2025-08-01','YYYY-MM-DD'), 'mess', 'paid');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (2, 3500, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'paid');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (3, 3500, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'pending');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (4, 5500, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'overdue');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (5, 2500, TO_DATE('2025-09-01','YYYY-MM-DD'), 'hostel_rent', 'pending');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (7, 3800, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'paid');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (8, 6000, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'pending');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (1, 10000, TO_DATE('2025-07-01','YYYY-MM-DD'), 'security_deposit', 'paid');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (2, 10000, TO_DATE('2025-07-01','YYYY-MM-DD'), 'security_deposit', 'paid');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (10, 3500, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'pending');
INSERT INTO fees (student_id, amount, due_date, fee_type, status) VALUES (11, 1500, TO_DATE('2025-08-01','YYYY-MM-DD'), 'hostel_rent', 'paid');

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO payments (fee_id, student_id, transaction_reference, amount_paid, payment_date, payment_method, payment_status)
VALUES (1, 1, 'TXN20250801001', 5000, TO_DATE('2025-07-28','YYYY-MM-DD'), 'online', 'completed');

INSERT INTO payments (fee_id, student_id, transaction_reference, amount_paid, payment_date, payment_method, payment_status)
VALUES (2, 1, 'TXN20250801002', 3000, TO_DATE('2025-07-28','YYYY-MM-DD'), 'online', 'completed');

INSERT INTO payments (fee_id, student_id, transaction_reference, amount_paid, payment_date, payment_method, payment_status)
VALUES (3, 2, 'TXN20250801003', 3500, TO_DATE('2025-07-30','YYYY-MM-DD'), 'upi', 'completed');

INSERT INTO payments (fee_id, student_id, transaction_reference, amount_paid, payment_date, payment_method, payment_status)
VALUES (7, 7, 'TXN20250802001', 3800, TO_DATE('2025-08-01','YYYY-MM-DD'), 'bank_transfer', 'completed');

INSERT INTO payments (fee_id, student_id, transaction_reference, amount_paid, payment_date, payment_method, payment_status)
VALUES (9, 1, 'TXN20250701001', 10000, TO_DATE('2025-07-01','YYYY-MM-DD'), 'bank_transfer', 'completed');

INSERT INTO payments (fee_id, student_id, transaction_reference, amount_paid, payment_date, payment_method, payment_status)
VALUES (10, 2, 'TXN20250701002', 10000, TO_DATE('2025-07-01','YYYY-MM-DD'), 'cash', 'completed');

INSERT INTO payments (fee_id, student_id, transaction_reference, amount_paid, payment_date, payment_method, payment_status)
VALUES (12, 11, 'TXN20250803001', 1500, TO_DATE('2025-08-02','YYYY-MM-DD'), 'upi', 'completed');

-- ============================================================
-- INQUIRY (Discipline)
-- ============================================================
INSERT INTO inquiry (student_id, description, start_date, status, disciplinary_officer)
VALUES (7, 'Noise complaint from neighboring rooms after 11 PM on multiple occasions.', TO_DATE('2025-08-10','YYYY-MM-DD'), 'under_review', 1);

INSERT INTO inquiry (student_id, description, start_date, status)
VALUES (5, 'Unauthorized guest found staying overnight.', TO_DATE('2025-08-15','YYYY-MM-DD'), 'open');

-- ============================================================
-- ROOM COMPLAINTS
-- ============================================================
INSERT INTO room_complaints (room_id, student_id, description, reporter_name, reported_date, status)
VALUES (1, 1, 'Bathroom tap leaking continuously.', 'Amit Sharma', TO_DATE('2025-08-05','YYYY-MM-DD'), 'resolved');

INSERT INTO room_complaints (room_id, student_id, description, reporter_name, reported_date, status)
VALUES (2, 2, 'AC not cooling properly.', 'Neha Gupta', TO_DATE('2025-08-08','YYYY-MM-DD'), 'in_progress');

INSERT INTO room_complaints (room_id, student_id, description, reporter_name, reported_date, status)
VALUES (6, 4, 'Window glass cracked.', 'Priya Patel', TO_DATE('2025-08-12','YYYY-MM-DD'), 'open');

INSERT INTO room_complaints (room_id, student_id, description, reporter_name, reported_date, status)
VALUES (4, 5, 'Light fixture not working.', 'Karan Singh', TO_DATE('2025-08-14','YYYY-MM-DD'), 'open');

INSERT INTO room_complaints (room_id, student_id, description, reporter_name, reported_date, status)
VALUES (7, 7, 'Cupboard door broken.', 'Vikram Joshi', TO_DATE('2025-08-16','YYYY-MM-DD'), 'open');

-- ============================================================
-- ROOM KEEPING
-- ============================================================
INSERT INTO room_keeping (room_id, staff_id, scheduled_date, status) VALUES (1, 4, TO_DATE('2025-08-18','YYYY-MM-DD'), 'completed');
INSERT INTO room_keeping (room_id, staff_id, scheduled_date, status) VALUES (2, 4, TO_DATE('2025-08-18','YYYY-MM-DD'), 'completed');
INSERT INTO room_keeping (room_id, staff_id, scheduled_date, status) VALUES (3, 4, TO_DATE('2025-08-19','YYYY-MM-DD'), 'scheduled');
INSERT INTO room_keeping (room_id, staff_id, scheduled_date, status) VALUES (6, 4, TO_DATE('2025-08-19','YYYY-MM-DD'), 'scheduled');

-- ============================================================
-- BIOMETRIC LOG
-- ============================================================
INSERT INTO biometric_log (student_id, log_timestamp, scan_type, scan_location) VALUES (1, TO_TIMESTAMP('2025-08-17 07:30:00','YYYY-MM-DD HH24:MI:SS'), 'EXIT', 'Main Gate');
INSERT INTO biometric_log (student_id, log_timestamp, scan_type, scan_location) VALUES (1, TO_TIMESTAMP('2025-08-17 18:45:00','YYYY-MM-DD HH24:MI:SS'), 'ENTRY', 'Main Gate');
INSERT INTO biometric_log (student_id, log_timestamp, scan_type, scan_location) VALUES (2, TO_TIMESTAMP('2025-08-17 08:00:00','YYYY-MM-DD HH24:MI:SS'), 'EXIT', 'Main Gate');
INSERT INTO biometric_log (student_id, log_timestamp, scan_type, scan_location) VALUES (3, TO_TIMESTAMP('2025-08-17 23:30:00','YYYY-MM-DD HH24:MI:SS'), 'ENTRY', 'Main Gate');
INSERT INTO biometric_log (student_id, log_timestamp, scan_type, scan_location, fine_amount) VALUES (7, TO_TIMESTAMP('2025-08-17 01:15:00','YYYY-MM-DD HH24:MI:SS'), 'ENTRY', 'Main Gate', 500);

-- ============================================================
-- PARCELS
-- ============================================================
INSERT INTO parcels (student_id, courier_company, reference_number, arrival_date, pickup_deadline, status, weight_category, received_by)
VALUES (1, 'Amazon', 'AMZ-78901', TO_DATE('2025-08-16','YYYY-MM-DD'), TO_DATE('2025-08-23','YYYY-MM-DD'), 'picked_up', 'medium', 5);

INSERT INTO parcels (student_id, courier_company, reference_number, arrival_date, pickup_deadline, status, weight_category, received_by)
VALUES (2, 'Flipkart', 'FLK-12345', TO_DATE('2025-08-17','YYYY-MM-DD'), TO_DATE('2025-08-24','YYYY-MM-DD'), 'notified', 'light', 5);

INSERT INTO parcels (student_id, courier_company, reference_number, arrival_date, pickup_deadline, status, weight_category)
VALUES (5, 'DTDC', 'DTDC-55555', TO_DATE('2025-08-18','YYYY-MM-DD'), TO_DATE('2025-08-25','YYYY-MM-DD'), 'arrived', 'heavy');

-- ============================================================
-- VISITOR LOG
-- ============================================================
INSERT INTO visitor_log (student_id, visitor_name, relation, phone, id_proof, entry_time, exit_time, approved_by_staff_id)
VALUES (1, 'Raj Sharma', 'Father', '9800100001', 'Aadhar-XXXX1234', TO_TIMESTAMP('2025-08-15 10:00:00','YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-08-15 17:00:00','YYYY-MM-DD HH24:MI:SS'), 5);

INSERT INTO visitor_log (student_id, visitor_name, relation, phone, id_proof, entry_time, approved_by_staff_id)
VALUES (3, 'Deepak Verma', 'Father', '9800100003', 'DL-AB1234567', TO_TIMESTAMP('2025-08-18 11:30:00','YYYY-MM-DD HH24:MI:SS'), 5);

-- ============================================================
-- LOST ITEMS
-- ============================================================
INSERT INTO lost_items (student_id, item_name, description, lost_date, status)
VALUES (2, 'Blue Water Bottle', 'Stainless steel blue Nalgene bottle', TO_DATE('2025-08-10','YYYY-MM-DD'), 'lost');

INSERT INTO lost_items (student_id, item_name, description, lost_date, status)
VALUES (5, 'Calculator', 'Casio FX-991EX scientific calculator', TO_DATE('2025-08-12','YYYY-MM-DD'), 'found');

-- ============================================================
-- FOUND ITEMS
-- ============================================================
INSERT INTO found_items (found_by_staff, item_name, description, found_date, location, status)
VALUES (4, 'Calculator', 'Casio scientific calculator found in common room', TO_DATE('2025-08-13','YYYY-MM-DD'), 'Block A Common Room', 'claimed');

INSERT INTO found_items (found_by_staff, item_name, description, found_date, location, status)
VALUES (5, 'Black Umbrella', 'Large black umbrella', TO_DATE('2025-08-16','YYYY-MM-DD'), 'Main Gate', 'unclaimed');

-- ============================================================
-- ITEM CLAIMS
-- ============================================================
INSERT INTO item_claim (lost_id, found_id, verification_status, claim_date)
VALUES (2, 1, 'verified', TO_DATE('2025-08-14','YYYY-MM-DD'));

-- ============================================================
-- ROOM CHANGE REQUESTS
-- ============================================================
INSERT INTO room_change_request (student_id, current_room_id, requested_block, requested_room_type, reason, status)
VALUES (3, 2, 2, 'single', 'Roommate incompatibility and need quiet study space.', 'pending');

INSERT INTO room_change_request (student_id, current_room_id, requested_block, requested_room_type, reason, reviewed_by, status)
VALUES (5, 4, 1, 'double', 'Want to move closer to library.', 1, 'approved');

-- ============================================================
-- WAITLIST
-- ============================================================
INSERT INTO waitlist (student_id, block_id, room_type, based_on_cgpa, date_added)
VALUES (6, 1, 'double', 8.0, TO_DATE('2025-07-20','YYYY-MM-DD'));

INSERT INTO waitlist (student_id, block_id, room_type, based_on_cgpa, date_added)
VALUES (9, 2, 'single', 7.0, TO_DATE('2025-07-22','YYYY-MM-DD'));

-- ============================================================
-- ROOMMATE PREFERENCES
-- ============================================================
INSERT INTO roommate_preference (student_id, sleep_schedule, study_habit, neatness_level) VALUES (1, 'night_owl', 'quiet', 'very_neat');
INSERT INTO roommate_preference (student_id, sleep_schedule, study_habit, neatness_level) VALUES (2, 'early_bird', 'moderate', 'very_neat');
INSERT INTO roommate_preference (student_id, sleep_schedule, study_habit, neatness_level) VALUES (3, 'night_owl', 'social', 'relaxed');
INSERT INTO roommate_preference (student_id, sleep_schedule, study_habit, neatness_level) VALUES (5, 'flexible', 'quiet', 'moderate');
INSERT INTO roommate_preference (student_id, sleep_schedule, study_habit, neatness_level) VALUES (8, 'early_bird', 'quiet', 'very_neat');

-- ============================================================
-- HOSTEL FEEDBACK
-- ============================================================
INSERT INTO hostel_feedback (student_id, mess_rating, cleanliness_rating, wifi_rating, maintenance_rating, comments)
VALUES (1, 4, 3, 2, 4, 'Mess food is good but wifi is terrible. Please upgrade the internet.');

INSERT INTO hostel_feedback (student_id, mess_rating, cleanliness_rating, wifi_rating, maintenance_rating, comments)
VALUES (2, 3, 4, 3, 3, 'Overall decent experience. Rooms are clean.');

INSERT INTO hostel_feedback (student_id, mess_rating, cleanliness_rating, wifi_rating, maintenance_rating, comments)
VALUES (4, 2, 2, 1, 2, 'Very disappointed with the facilities. Wifi barely works.');

INSERT INTO hostel_feedback (student_id, mess_rating, cleanliness_rating, wifi_rating, maintenance_rating, comments)
VALUES (8, 5, 5, 4, 5, 'Excellent hostel! Best facilities in the campus.');

-- ============================================================
-- LAUNDRY ORDERS
-- ============================================================
INSERT INTO laundry_order (student_id, items_count, submit_date, status, expected_return_date)
VALUES (1, 0, TO_DATE('2025-08-17','YYYY-MM-DD'), 'processing', TO_DATE('2025-08-19','YYYY-MM-DD'));

INSERT INTO laundry_order (student_id, items_count, submit_date, status, expected_return_date)
VALUES (2, 0, TO_DATE('2025-08-18','YYYY-MM-DD'), 'submitted', TO_DATE('2025-08-20','YYYY-MM-DD'));

INSERT INTO laundry_order (student_id, items_count, submit_date, status, expected_return_date)
VALUES (5, 0, TO_DATE('2025-08-16','YYYY-MM-DD'), 'collected', TO_DATE('2025-08-18','YYYY-MM-DD'));

-- ============================================================
-- LAUNDRY ITEMS (triggers will update items_count)
-- ============================================================
INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (1, 'Shirt', 3);
INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (1, 'Pants', 2);
INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (1, 'Bedsheet', 1);
INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (2, 'Shirt', 5);
INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (2, 'Towel', 2);
INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (3, 'Shirt', 2);
INSERT INTO laundry_items (order_id, item_type, quantity) VALUES (3, 'Pants', 1);

COMMIT;

-- ADDED EXTRAS
INSERT INTO room_complaints (room_id, student_id, description, reporter_name, status) VALUES (1, 1, 'Water leak in bathroom.', 'Amit Sharma', 'open');
INSERT INTO room_complaints (room_id, student_id, description, reporter_name, status) VALUES (1, 1, 'Fan makes a loud noise.', 'Amit Sharma', 'in_progress');
INSERT INTO roommate_preference (student_id, sleep_schedule, study_habit, neatness_level) VALUES (4, 'flexible', 'social', 'relaxed');


-- Add 3 more demo students 
INSERT INTO student (student_id, name, email, password, gender, department, year_of_study, phone) VALUES (seq_student.NEXTVAL, 'David Miller', 'david@student.edu', 'pw', 'male', 'Computer Science', 2, '9001000031');
INSERT INTO student (student_id, name, email, password, gender, department, year_of_study, phone) VALUES (seq_student.NEXTVAL, 'Sarah Connor', 'sarah@student.edu', 'pw', 'female', 'Physics', 1, '9001000032');
INSERT INTO student (student_id, name, email, password, gender, department, year_of_study, phone) VALUES (seq_student.NEXTVAL, 'Bob Smith', 'bob@student.edu', 'pw', 'male', 'Engineering', 3, '9001000033');

