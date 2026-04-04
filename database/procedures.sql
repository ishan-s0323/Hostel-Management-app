-- ============================================================
-- Smart Hostel Management System - Stored Procedures
-- Oracle PL/SQL - Run AFTER schema.sql and triggers.sql
-- ============================================================

-- ============================================================
-- PROCEDURE 1: Allocate Room to Student
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_allocate_room (
    p_student_id  IN NUMBER,
    p_room_id     IN NUMBER,
    p_success     OUT NUMBER,
    p_message     OUT VARCHAR2,
    p_alloc_id    OUT NUMBER
) AS
    v_room_cap    NUMBER;
    v_room_occ    NUMBER;
    v_room_status VARCHAR2(20);
    v_existing    NUMBER;
BEGIN
    p_success := 0;

    -- Check student exists
    SELECT COUNT(*) INTO v_existing FROM student WHERE student_id = p_student_id;
    IF v_existing = 0 THEN
        p_message := 'Student not found';
        RETURN;
    END IF;

    -- Check student doesn't already have active allocation
    SELECT COUNT(*) INTO v_existing FROM allocation
    WHERE student_id = p_student_id AND status = 'active';
    IF v_existing > 0 THEN
        p_message := 'Student already has an active room allocation';
        RETURN;
    END IF;

    -- Lock and check room
    SELECT capacity, current_occupancy, availability_status
    INTO v_room_cap, v_room_occ, v_room_status
    FROM room WHERE room_id = p_room_id FOR UPDATE;

    IF v_room_status = 'maintenance' THEN
        p_message := 'Room is under maintenance';
        RETURN;
    END IF;

    IF v_room_occ >= v_room_cap THEN
        p_message := 'Room is already full';
        RETURN;
    END IF;

    -- Create allocation
    INSERT INTO allocation (student_id, room_id, check_in_date, status)
    VALUES (p_student_id, p_room_id, SYSDATE, 'active')
    RETURNING allocation_id INTO p_alloc_id;

    -- Update student stay type
    UPDATE student SET current_stay_type = 'hosteler' WHERE student_id = p_student_id;

    p_success := 1;
    p_message := 'Room allocated successfully';
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error: ' || SQLERRM;
END;
/

-- ============================================================
-- PROCEDURE 2: Release Room (Check Out)
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_release_room (
    p_allocation_id IN NUMBER,
    p_success       OUT NUMBER,
    p_message       OUT VARCHAR2
) AS
    v_status VARCHAR2(20);
    v_sid    NUMBER;
BEGIN
    p_success := 0;

    SELECT status, student_id INTO v_status, v_sid
    FROM allocation WHERE allocation_id = p_allocation_id FOR UPDATE;

    IF v_status != 'active' THEN
        p_message := 'Allocation is not active';
        RETURN;
    END IF;

    UPDATE allocation
    SET status = 'checked_out', check_out_date = SYSDATE
    WHERE allocation_id = p_allocation_id;

    UPDATE student SET current_stay_type = 'day_scholar' WHERE student_id = v_sid;

    p_success := 1;
    p_message := 'Room released successfully';
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_message := 'Allocation not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_message := 'Error: ' || SQLERRM;
END;
/

-- ============================================================
-- PROCEDURE 3: Transfer Room
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_transfer_room (
    p_allocation_id IN NUMBER,
    p_new_room_id   IN NUMBER,
    p_success       OUT NUMBER,
    p_message       OUT VARCHAR2,
    p_new_alloc_id  OUT NUMBER
) AS
    v_sid        NUMBER;
    v_status     VARCHAR2(20);
    v_cap        NUMBER;
    v_occ        NUMBER;
    v_new_status VARCHAR2(20);
BEGIN
    p_success := 0;

    SELECT student_id, status INTO v_sid, v_status
    FROM allocation WHERE allocation_id = p_allocation_id FOR UPDATE;

    IF v_status != 'active' THEN
        p_message := 'Current allocation is not active';
        RETURN;
    END IF;

    SELECT capacity, current_occupancy, availability_status
    INTO v_cap, v_occ, v_new_status
    FROM room WHERE room_id = p_new_room_id FOR UPDATE;

    IF v_new_status = 'maintenance' THEN
        p_message := 'Target room is under maintenance';
        RETURN;
    END IF;
    IF v_occ >= v_cap THEN
        p_message := 'Target room is full';
        RETURN;
    END IF;

    -- Mark old allocation as transferred
    UPDATE allocation SET status = 'transferred', check_out_date = SYSDATE
    WHERE allocation_id = p_allocation_id;

    -- Create new allocation
    INSERT INTO allocation (student_id, room_id, check_in_date, status)
    VALUES (v_sid, p_new_room_id, SYSDATE, 'active')
    RETURNING allocation_id INTO p_new_alloc_id;

    p_success := 1;
    p_message := 'Room transfer successful';
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_message := 'Allocation or room not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_message := 'Error: ' || SQLERRM;
END;
/

-- ============================================================
-- PROCEDURE 4: Mark Overdue Fees (batch)
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_mark_overdue_fees (
    p_count OUT NUMBER
) AS
    CURSOR c_overdue IS
        SELECT fee_id, student_id FROM fees
        WHERE status = 'pending' AND due_date < SYSDATE;
BEGIN
    p_count := 0;
    FOR r IN c_overdue LOOP
        UPDATE fees SET status = 'overdue' WHERE fee_id = r.fee_id;
        INSERT INTO notifications (student_id, message, notif_type, is_read)
        VALUES (r.student_id, 'You have an overdue fee. Please pay immediately.', 'fee_overdue', 0);
        p_count := p_count + 1;
    END LOOP;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_count := -1;
END;
/

-- ============================================================
-- PROCEDURE 5: Get Dashboard Stats
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_get_dashboard_stats (
    p_total_students    OUT NUMBER,
    p_total_rooms       OUT NUMBER,
    p_occupied_rooms    OUT NUMBER,
    p_available_rooms   OUT NUMBER,
    p_total_fees        OUT NUMBER,
    p_collected_fees    OUT NUMBER,
    p_pending_fees      OUT NUMBER,
    p_open_complaints   OUT NUMBER,
    p_active_allocs     OUT NUMBER,
    p_total_staff       OUT NUMBER,
    p_pending_laundry   OUT NUMBER
) AS
BEGIN
    SELECT COUNT(*) INTO p_total_students FROM student;
    SELECT COUNT(*) INTO p_total_rooms FROM room;
    SELECT COUNT(*) INTO p_occupied_rooms FROM room WHERE current_occupancy > 0;
    SELECT COUNT(*) INTO p_available_rooms FROM room WHERE availability_status = 'available';
    SELECT NVL(SUM(amount), 0) INTO p_total_fees FROM fees;
    SELECT NVL(SUM(amount), 0) INTO p_collected_fees FROM fees WHERE status = 'paid';
    SELECT NVL(SUM(amount), 0) INTO p_pending_fees FROM fees WHERE status IN ('pending', 'overdue');
    SELECT COUNT(*) INTO p_open_complaints FROM room_complaints WHERE status IN ('open', 'in_progress');
    SELECT COUNT(*) INTO p_active_allocs FROM allocation WHERE status = 'active';
    SELECT COUNT(*) INTO p_total_staff FROM staff;
    SELECT COUNT(*) INTO p_pending_laundry FROM laundry_order WHERE status IN ('submitted', 'processing');
END;
/

-- ============================================================
-- PROCEDURE 6: Calculate Roommate Compatibility
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_calc_compatibility (
    p_student1_id IN NUMBER,
    p_student2_id IN NUMBER,
    p_percentage  OUT NUMBER
) AS
    v_s1_sleep  VARCHAR2(20);
    v_s1_study  VARCHAR2(20);
    v_s1_neat   VARCHAR2(20);
    v_s2_sleep  VARCHAR2(20);
    v_s2_study  VARCHAR2(20);
    v_s2_neat   VARCHAR2(20);
    v_score     NUMBER := 0;
BEGIN
    SELECT sleep_schedule, study_habit, neatness_level
    INTO v_s1_sleep, v_s1_study, v_s1_neat
    FROM roommate_preference WHERE student_id = p_student1_id;

    SELECT sleep_schedule, study_habit, neatness_level
    INTO v_s2_sleep, v_s2_study, v_s2_neat
    FROM roommate_preference WHERE student_id = p_student2_id;

    IF v_s1_sleep = v_s2_sleep THEN v_score := v_score + 40; END IF;
    IF v_s1_study = v_s2_study THEN v_score := v_score + 30; END IF;
    IF v_s1_neat = v_s2_neat THEN v_score := v_score + 30; END IF;

    p_percentage := v_score;

    -- Upsert compatibility record
    MERGE INTO roommate_compatibility rc
    USING DUAL ON (
        (rc.student1_id = p_student1_id AND rc.student2_id = p_student2_id)
        OR (rc.student1_id = p_student2_id AND rc.student2_id = p_student1_id)
    )
    WHEN MATCHED THEN
        UPDATE SET compatibility_percentage = v_score, date_calculated = SYSDATE
    WHEN NOT MATCHED THEN
        INSERT (student1_id, student2_id, compatibility_percentage, date_calculated)
        VALUES (p_student1_id, p_student2_id, v_score, SYSDATE);

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_percentage := -1;
END;
/

COMMIT;
