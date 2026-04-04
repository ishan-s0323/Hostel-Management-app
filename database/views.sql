-- ============================================================
-- Smart Hostel Management System - Views
-- Oracle PL/SQL - Run AFTER schema.sql
-- ============================================================

-- 1. Student with current room and fee status
CREATE OR REPLACE VIEW vw_student_room_fees AS
SELECT
    s.student_id, s.name, s.email, s.gender, s.department, s.year_of_study,
    s.cgpa, s.current_stay_type,
    r.room_id, b.block_name, r.floor_num, r.room_type,
    NVL(SUM(f.amount), 0) AS total_fees,
    NVL(SUM(CASE WHEN f.status = 'paid' THEN f.amount ELSE 0 END), 0) AS paid_fees,
    NVL(SUM(CASE WHEN f.status IN ('pending','overdue') THEN f.amount ELSE 0 END), 0) AS pending_fees
FROM student s
LEFT JOIN allocation a ON s.student_id = a.student_id AND a.status = 'active'
LEFT JOIN room r ON a.room_id = r.room_id
LEFT JOIN hostel_block b ON r.block_id = b.block_id
LEFT JOIN fees f ON s.student_id = f.student_id
GROUP BY s.student_id, s.name, s.email, s.gender, s.department, s.year_of_study,
    s.cgpa, s.current_stay_type, r.room_id, b.block_name, r.floor_num, r.room_type;

-- 2. Room occupancy overview
CREATE OR REPLACE VIEW vw_room_occupancy AS
SELECT
    r.room_id, b.block_name, r.floor_num, r.room_type,
    r.capacity, r.current_occupancy,
    r.capacity - r.current_occupancy AS available_beds,
    r.availability_status, r.rent_per_month,
    (SELECT COUNT(*) FROM room_complaints rc
     WHERE rc.room_id = r.room_id AND rc.status IN ('open','in_progress')) AS open_complaints
FROM room r
JOIN hostel_block b ON r.block_id = b.block_id;

-- 3. Complaint summary with student and room info
CREATE OR REPLACE VIEW vw_complaint_summary AS
SELECT
    rc.complaint_id, rc.description, rc.reporter_name, rc.reported_date, rc.status,
    s.name AS student_name, s.email AS student_email,
    b.block_name, r.floor_num, r.room_type
FROM room_complaints rc
JOIN student s ON rc.student_id = s.student_id
JOIN room r ON rc.room_id = r.room_id
JOIN hostel_block b ON r.block_id = b.block_id;

-- 4. Fee collection report by month
CREATE OR REPLACE VIEW vw_fee_collection_monthly AS
SELECT
    TO_CHAR(p.payment_date, 'YYYY-MM') AS month,
    COUNT(p.payment_id) AS total_payments,
    SUM(p.amount_paid) AS total_collected,
    p.payment_method
FROM payments p
WHERE p.payment_status = 'completed'
GROUP BY TO_CHAR(p.payment_date, 'YYYY-MM'), p.payment_method
ORDER BY month DESC;

-- 5. Block-wise occupancy summary
CREATE OR REPLACE VIEW vw_block_occupancy AS
SELECT
    b.block_id, b.block_name, b.floors,
    s.name AS warden_name,
    COUNT(r.room_id) AS total_rooms,
    NVL(SUM(r.capacity), 0) AS total_capacity,
    NVL(SUM(r.current_occupancy), 0) AS total_occupancy,
    NVL(SUM(r.capacity), 0) - NVL(SUM(r.current_occupancy), 0) AS available_beds
FROM hostel_block b
LEFT JOIN staff s ON b.warden_id = s.staff_id
LEFT JOIN room r ON b.block_id = r.block_id
GROUP BY b.block_id, b.block_name, b.floors, s.name;

-- 6. Hostel feedback averages
CREATE OR REPLACE VIEW vw_feedback_averages AS
SELECT
    COUNT(*) AS total_feedback,
    ROUND(AVG(mess_rating), 2) AS avg_mess,
    ROUND(AVG(cleanliness_rating), 2) AS avg_cleanliness,
    ROUND(AVG(wifi_rating), 2) AS avg_wifi,
    ROUND(AVG(maintenance_rating), 2) AS avg_maintenance,
    ROUND((AVG(mess_rating) + AVG(cleanliness_rating) + AVG(wifi_rating) + AVG(maintenance_rating)) / 4, 2) AS avg_overall
FROM hostel_feedback;

-- 7. Active visitor log
CREATE OR REPLACE VIEW vw_active_visitors AS
SELECT
    vl.visitor_id, vl.visitor_name, vl.relation, vl.phone, vl.id_proof,
    vl.entry_time, vl.exit_time,
    s.name AS student_name, s.department,
    st.name AS approved_by
FROM visitor_log vl
JOIN student s ON vl.student_id = s.student_id
LEFT JOIN staff st ON vl.approved_by_staff_id = st.staff_id;

-- 8. Recent audit log with performer names
CREATE OR REPLACE VIEW vw_recent_audit AS
SELECT
    al.log_id, al.entity_type, al.entity_id, al.action,
    al.old_values, al.new_values, al.created_at,
    CASE
        WHEN al.performer_type = 'staff' THEN (SELECT name FROM staff WHERE staff_id = al.performed_by)
        WHEN al.performer_type = 'student' THEN (SELECT name FROM student WHERE student_id = al.performed_by)
        ELSE 'System'
    END AS performer_name,
    al.performer_type
FROM audit_logs al
ORDER BY al.created_at DESC;

COMMIT;
