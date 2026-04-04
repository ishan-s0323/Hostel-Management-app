module com.hostel {
    requires javafx.controls;
    requires javafx.graphics;
    requires java.net.http;
    requires com.fasterxml.jackson.databind;
    requires com.fasterxml.jackson.datatype.jsr310;

    opens com.hostel to javafx.graphics;
    opens com.hostel.model to com.fasterxml.jackson.databind;

    exports com.hostel;
    exports com.hostel.views;
    exports com.hostel.model;
    exports com.hostel.util;
}
