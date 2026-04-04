package com.hostel.views;

import com.hostel.util.ApiClient;
import com.hostel.util.SessionManager;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.util.LinkedHashMap;
import java.util.Map;

public class StudentsView extends VBox {

    private TableView<JsonNode> table;
    private TextField searchField;
    private ComboBox<String> statusFilter;
    private int currentPage = 1;
    private int totalPages = 1;
    private Label pageLabel;

    public StudentsView() {
        setSpacing(15);
        setPadding(new Insets(10));

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        searchField = new TextField();
        searchField.setPromptText("Search students...");
        searchField.setPrefWidth(250);
        searchField.setOnAction(e -> loadStudents());

        statusFilter = new ComboBox<>();
        statusFilter.getItems().addAll("All", "active", "inactive", "graduated");
        statusFilter.setValue("All");
        statusFilter.setOnAction(e -> { currentPage = 1; loadStudents(); });

        Button searchBtn = new Button("Search");
        searchBtn.getStyleClass().add("btn-primary");
        searchBtn.setOnAction(e -> { currentPage = 1; loadStudents(); });

        toolbar.getChildren().addAll(searchField, statusFilter, searchBtn);

        if (SessionManager.isAdmin()) {
            Button addBtn = new Button("+ Add Student");
            addBtn.getStyleClass().add("btn-success");
            addBtn.setOnAction(e -> showAddStudentDialog());
            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);
            toolbar.getChildren().addAll(spacer, addBtn);
        }

        getChildren().add(toolbar);

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Name", "name", 150);
        addColumn("Email", "email", 180);
        addColumn("Phone", "phone", 120);
        addColumn("Course", "course", 120);
        addColumn("Year", "year", 50);
        addColumn("Room", "roomNumber", 80);
        addColumn("Status", "status", 80);

        if (SessionManager.isAdmin()) {
            TableColumn<JsonNode, Void> actionsCol = new TableColumn<>("Actions");
            actionsCol.setCellFactory(col -> new TableCell<>() {
                private final Button viewBtn = new Button("View");
                private final Button deleteBtn = new Button("Delete");
                private final HBox box = new HBox(5, viewBtn, deleteBtn);
                {
                    viewBtn.getStyleClass().add("btn-small");
                    deleteBtn.getStyleClass().addAll("btn-small", "btn-danger");
                    box.setAlignment(Pos.CENTER);
                    viewBtn.setOnAction(e -> {
                        JsonNode student = getTableView().getItems().get(getIndex());
                        showStudentDetail(student);
                    });
                    deleteBtn.setOnAction(e -> {
                        JsonNode student = getTableView().getItems().get(getIndex());
                        deleteStudent(student.get("id").asInt());
                    });
                }
                @Override
                protected void updateItem(Void item, boolean empty) {
                    super.updateItem(item, empty);
                    setGraphic(empty ? null : box);
                }
            });
            table.getColumns().add(actionsCol);
        }

        getChildren().add(table);

        HBox pagination = new HBox(10);
        pagination.setAlignment(Pos.CENTER);
        Button prevBtn = new Button("< Previous");
        prevBtn.setOnAction(e -> { if (currentPage > 1) { currentPage--; loadStudents(); } });
        pageLabel = new Label("Page 1");
        Button nextBtn = new Button("Next >");
        nextBtn.setOnAction(e -> { if (currentPage < totalPages) { currentPage++; loadStudents(); } });
        pagination.getChildren().addAll(prevBtn, pageLabel, nextBtn);
        getChildren().add(pagination);

        loadStudents();
    }

    private void addColumn(String header, String field, double width) {
        TableColumn<JsonNode, String> col = new TableColumn<>(header);
        col.setCellValueFactory(param -> {
            JsonNode node = param.getValue();
            String val = node.has(field) && !node.get(field).isNull() ? node.get(field).asText("") : "-";
            return new javafx.beans.property.SimpleStringProperty(val);
        });
        col.setPrefWidth(width);
        table.getColumns().add(col);
    }

    private void loadStudents() {
        new Thread(() -> {
            try {
                String query = "?page=" + currentPage + "&limit=20";
                String search = searchField.getText().trim();
                if (!search.isEmpty()) query += "&search=" + search;
                String status = statusFilter.getValue();
                if (!"All".equals(status)) query += "&status=" + status;

                JsonNode response = ApiClient.get("/students" + query);
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode students = response.has("students") ? response.get("students") : response;
                    if (students.isArray()) {
                        for (JsonNode s : students) items.add(s);
                    }
                    table.setItems(items);

                    if (response.has("pagination")) {
                        JsonNode pag = response.get("pagination");
                        currentPage = pag.has("page") ? pag.get("page").asInt() : 1;
                        totalPages = pag.has("totalPages") ? pag.get("totalPages").asInt() : 1;
                    }
                    pageLabel.setText("Page " + currentPage + " of " + totalPages);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> showError("Failed to load students: " + ex.getMessage()));
            }
        }).start();
    }

    private void showAddStudentDialog() {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Add New Student");
        dialog.setHeaderText("Enter student details");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        TextField nameField = new TextField();
        TextField emailField = new TextField();
        TextField phoneField = new TextField();
        PasswordField passwordField = new PasswordField();
        ComboBox<String> genderBox = new ComboBox<>();
        genderBox.getItems().addAll("male", "female", "other");
        genderBox.setValue("male");
        TextField courseField = new TextField();
        Spinner<Integer> yearSpinner = new Spinner<>(1, 6, 1);
        TextField guardianNameField = new TextField();
        TextField guardianPhoneField = new TextField();

        int row = 0;
        grid.add(new Label("Name:"), 0, row); grid.add(nameField, 1, row++);
        grid.add(new Label("Email:"), 0, row); grid.add(emailField, 1, row++);
        grid.add(new Label("Password:"), 0, row); grid.add(passwordField, 1, row++);
        grid.add(new Label("Phone:"), 0, row); grid.add(phoneField, 1, row++);
        grid.add(new Label("Gender:"), 0, row); grid.add(genderBox, 1, row++);
        grid.add(new Label("Course:"), 0, row); grid.add(courseField, 1, row++);
        grid.add(new Label("Year:"), 0, row); grid.add(yearSpinner, 1, row++);
        grid.add(new Label("Guardian Name:"), 0, row); grid.add(guardianNameField, 1, row++);
        grid.add(new Label("Guardian Phone:"), 0, row); grid.add(guardianPhoneField, 1, row++);

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("name", nameField.getText().trim());
                body.put("email", emailField.getText().trim());
                body.put("password", passwordField.getText().trim());
                body.put("phone", phoneField.getText().trim());
                body.put("gender", genderBox.getValue());
                body.put("course", courseField.getText().trim());
                body.put("year", yearSpinner.getValue());
                body.put("guardianName", guardianNameField.getText().trim());
                body.put("guardianPhone", guardianPhoneField.getText().trim());
                body.put("userType", "student");
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.post("/auth/register-student", body);
                    Platform.runLater(() -> loadStudents());
                } catch (Exception ex) {
                    Platform.runLater(() -> showError("Failed to add student: " + ex.getMessage()));
                }
            }).start();
        });
    }

    private void showStudentDetail(JsonNode student) {
        getChildren().clear();
        getChildren().add(new StudentDetailView(student.get("id").asInt(), this));
    }

    private void deleteStudent(int id) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION, "Are you sure you want to delete this student?");
        alert.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                new Thread(() -> {
                    try {
                        ApiClient.delete("/students/" + id);
                        Platform.runLater(() -> loadStudents());
                    } catch (Exception ex) {
                        Platform.runLater(() -> showError("Failed to delete: " + ex.getMessage()));
                    }
                }).start();
            }
        });
    }

    private void showError(String msg) {
        Alert alert = new Alert(Alert.AlertType.ERROR, msg);
        alert.show();
    }
}
