-- ============================================================
-- Smart Hostel Management System - Triggers
-- Oracle PL/SQL - Run AFTER schema.sql
-- ============================================================

-- 1. Room occupancy increment on allocation insert
CREATE OR REPLACE TRIGGER trg_alloc_inc_occupancy
AFTER INSERT ON allocation
FOR EACH ROW
WHEN (NEW.status = 'active')
BEGIN
    UPDATE room SET current_occupancy = current_occupancy + 1 WHERE room_id = :NEW.room_id;
    UPDATE room SET availability_status = 'full'
    WHERE room_id = :NEW.room_id AND current_occupancy >= capacity;
END;
/

-- 2. Room occupancy decrement on checkout/transfer
CREATE OR REPLACE TRIGGER trg_alloc_dec_occupancy
AFTER UPDATE OF status ON allocation
FOR EACH ROW
WHEN (OLD.status = 'active' AND NEW.status IN ('checked_out', 'transferred'))
BEGIN
    UPDATE room SET current_occupancy = GREATEST(current_occupancy - 1, 0) WHERE room_id = :OLD.room_id;
    UPDATE room SET availability_status = 'available'
    WHERE room_id = :OLD.room_id AND availability_status = 'full' AND current_occupancy < capacity;
END;
/

-- 3. Auto-mark overdue fees
CREATE OR REPLACE TRIGGER trg_fee_overdue_check
BEFORE INSERT OR UPDATE ON fees
FOR EACH ROW
BEGIN
    IF :NEW.status = 'pending' AND :NEW.due_date < SYSDATE THEN
        :NEW.status := 'overdue';
    END IF;
END;
/

-- 4. Update fee status to paid when full payment received
CREATE OR REPLACE TRIGGER trg_payment_update_fee
AFTER INSERT ON payments
FOR EACH ROW
WHEN (NEW.payment_status = 'completed')
BEGIN
    UPDATE fees SET status = 'paid' WHERE fee_id = :NEW.fee_id;
END;
/

-- 5. Notification on new room complaint
CREATE OR REPLACE TRIGGER trg_complaint_notify
AFTER INSERT ON room_complaints
FOR EACH ROW
BEGIN
    INSERT INTO notifications (student_id, message, notif_type, is_read)
    VALUES (:NEW.student_id, 'Your maintenance complaint has been registered and is being reviewed.', 'complaint_update', 0);
END;
/

-- 6. Notification on complaint status change
CREATE OR REPLACE TRIGGER trg_complaint_status_notify
AFTER UPDATE OF status ON room_complaints
FOR EACH ROW
WHEN (OLD.status != NEW.status)
BEGIN
    INSERT INTO notifications (student_id, message, notif_type, is_read)
    VALUES (:NEW.student_id, 'Your complaint status changed from ' || :OLD.status || ' to ' || :NEW.status, 'complaint_update', 0);
END;
/

-- 7. Notification on fee creation
CREATE OR REPLACE TRIGGER trg_fee_notify
AFTER INSERT ON fees
FOR EACH ROW
BEGIN
    INSERT INTO notifications (student_id, message, notif_type, is_read)
    VALUES (:NEW.student_id, 'New ' || :NEW.fee_type || ' fee of ' || TO_CHAR(:NEW.amount) || ' due on ' || TO_CHAR(:NEW.due_date, 'YYYY-MM-DD'), 'fee_due', 0);
END;
/

-- 8. Notification on room allocation
CREATE OR REPLACE TRIGGER trg_alloc_notify
AFTER INSERT ON allocation
FOR EACH ROW
WHEN (NEW.status = 'active')
BEGIN
    INSERT INTO notifications (student_id, message, notif_type, is_read)
    VALUES (:NEW.student_id, 'You have been allocated to a room. Check-in: ' || TO_CHAR(:NEW.check_in_date, 'YYYY-MM-DD'), 'room_allocation', 0);
END;
/

-- 9. Notification on disciplinary inquiry
CREATE OR REPLACE TRIGGER trg_inquiry_notify
AFTER INSERT ON inquiry
FOR EACH ROW
BEGIN
    INSERT INTO notifications (student_id, message, notif_type, is_read)
    VALUES (:NEW.student_id, 'A disciplinary inquiry has been opened regarding your conduct.', 'discipline', 0);
END;
/

-- 10. Notification on parcel arrival
CREATE OR REPLACE TRIGGER trg_parcel_notify
AFTER INSERT ON parcels
FOR EACH ROW
BEGIN
    INSERT INTO notifications (student_id, message, notif_type, is_read)
    VALUES (:NEW.student_id, 'A parcel from ' || NVL(:NEW.courier_company, 'unknown') || ' has arrived. Collect before ' || NVL(TO_CHAR(:NEW.pickup_deadline, 'YYYY-MM-DD'), 'N/A'), 'parcel', 0);
END;
/

-- 11. Audit log for allocation changes
CREATE OR REPLACE TRIGGER trg_audit_allocation
AFTER INSERT OR UPDATE ON allocation
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, new_values)
        VALUES ('allocation', :NEW.allocation_id, 'INSERT',
            '{"student_id":' || :NEW.student_id || ',"room_id":' || :NEW.room_id || ',"status":"' || :NEW.status || '"}');
    ELSIF UPDATING THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values)
        VALUES ('allocation', :NEW.allocation_id, 'UPDATE',
            '{"status":"' || :OLD.status || '"}',
            '{"status":"' || :NEW.status || '"}');
    END IF;
END;
/

-- 12. Audit log for fee updates
CREATE OR REPLACE TRIGGER trg_audit_fee
AFTER UPDATE ON fees
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values)
    VALUES ('fee', :NEW.fee_id, 'UPDATE',
        '{"status":"' || :OLD.status || '","amount":' || :OLD.amount || '}',
        '{"status":"' || :NEW.status || '","amount":' || :NEW.amount || '}');
END;
/

-- 13. Auto-update laundry_order items_count
CREATE OR REPLACE TRIGGER trg_laundry_item_count
AFTER INSERT OR DELETE ON laundry_items
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE laundry_order SET items_count = items_count + :NEW.quantity WHERE order_id = :NEW.order_id;
    ELSIF DELETING THEN
        UPDATE laundry_order SET items_count = items_count - :OLD.quantity WHERE order_id = :OLD.order_id;
    END IF;
END;
/

-- 14. Student updated_at timestamp
CREATE OR REPLACE TRIGGER trg_student_updated
BEFORE UPDATE ON student
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

-- 15. Waitlist auto-set priority based on CGPA
CREATE OR REPLACE TRIGGER trg_waitlist_priority
BEFORE INSERT ON waitlist
FOR EACH ROW
BEGIN
    IF :NEW.priority_rank IS NULL AND :NEW.based_on_cgpa IS NOT NULL THEN
        :NEW.priority_rank := CEIL((10 - :NEW.based_on_cgpa) * 10);
    END IF;
END;
/

COMMIT;
