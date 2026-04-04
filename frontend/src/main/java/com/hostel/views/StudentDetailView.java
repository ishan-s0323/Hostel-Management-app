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

public class StudentDetailView extends VBox {

    private final int studentId;
    private final StudentsView parentView;
    private JsonNode studentData;

    public StudentDetailView(int studentId, StudentsView parentView) {
        this.studentId = studentId;
        this.parentView = parentView;
        setSpacing(15);
        setPadding(new Insets(10));
        loadStudent();
    }

    private void loadStudent() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/students/" + studentId);
                studentData = response.has("student") ? response.get("student") : response;
                Platform.runLater(() -> renderDetail());
            } catch (Exception ex) {
                Platform.runLater(() -> getChildren().add(new Label("Failed to load: " + ex.getMessage())));
            }
        }).start();
        getChildren().add(new Label("Loading student details..."));
    }

    private void renderDetail() {
        getChildren().clear();

        Button backBtn = new Button("< Back to Students");
        backBtn.getStyleClass().add("btn-secondary");
        backBtn.setOnAction(e -> {
            VBox parent = (VBox) getParent();
            if (parent != null) {
                parent.getChildren().clear();
                parent.getChildren().add(parentView);
            }
        });

        Label nameLabel = new Label(getText("name"));
        nameLabel.setFont(Font.font("System", FontWeight.BOLD, 22));

        Label statusBadge = new Label(getText("status"));
        statusBadge.getStyleClass().addAll("badge", "active".equals(getText("status")) ? "badge-green" : "badge-gray");

        HBox header = new HBox(15, backBtn, nameLabel, statusBadge);
        header.setAlignment(Pos.CENTER_LEFT);
        getChildren().add(header);

        HBox content = new HBox(20);
        VBox.setVgrow(content, Priority.ALWAYS);

        VBox infoCard = new VBox(10);
        infoCard.getStyleClass().add("detail-card");
        infoCard.setPadding(new Insets(20));
        infoCard.setPrefWidth(400);

        Label infoTitle = new Label("Student Information");
        infoTitle.setFont(Font.font("System", FontWeight.BOLD, 16));
        infoCard.getChildren().add(infoTitle);

        addInfoRow(infoCard, "Email", getText("email"));
        addInfoRow(infoCard, "Phone", getText("phone"));
        addInfoRow(infoCard, "Gender", getText("gender"));
        addInfoRow(infoCard, "Course", getText("course"));
        addInfoRow(infoCard, "Year", getText("year"));
        addInfoRow(infoCard, "Guardian", getText("guardianName"));
        addInfoRow(infoCard, "Guardian Phone", getText("guardianPhone"));

        if (SessionManager.isAdmin()) {
            Button editBtn = new Button("Edit Student");
            editBtn.getStyleClass().add("btn-primary");
            editBtn.setOnAction(e -> showEditDialog());
            infoCard.getChildren().add(editBtn);
        }

        VBox rightCol = new VBox(15);
        HBox.setHgrow(rightCol, Priority.ALWAYS);

        if (studentData.has("roomNumber") && !studentData.get("roomNumber").isNull()) {
            VBox roomCard = new VBox(8);
            roomCard.getStyleClass().add("detail-card");
            roomCard.setPadding(new Insets(15));
            Label roomTitle = new Label("Current Room");
            roomTitle.setFont(Font.font("System", FontWeight.BOLD, 14));
            Label roomNum = new Label("Room " + getText("roomNumber"));
            roomNum.setFont(Font.font("System", FontWeight.BOLD, 20));
            roomCard.getChildren().addAll(roomTitle, roomNum);
            rightCol.getChildren().add(roomCard);
        }

        if (studentData.has("fees") && studentData.get("fees").isArray()) {
            Label feesTitle = new Label("Fee History");
            feesTitle.setFont(Font.font("System", FontWeight.BOLD, 16));

            TableView<JsonNode> feeTable = new TableView<>();
            feeTable.setMaxHeight(250);

            TableColumn<JsonNode, String> typeCol = new TableColumn<>("Type");
            typeCol.setCellValueFactory(p -> new javafx.beans.property.SimpleStringProperty(
                    p.getValue().has("feeType") ? p.getValue().get("feeType").asText() : ""));
            TableColumn<JsonNode, String> amountCol = new TableColumn<>("Amount");
            amountCol.setCellValueFactory(p -> new javafx.beans.property.SimpleStringProperty(
                    "$" + (p.getValue().has("amount") ? p.getValue().get("amount").asText() : "0")));
            TableColumn<JsonNode, String> statusCol = new TableColumn<>("Status");
            statusCol.setCellValueFactory(p -> new javafx.beans.property.SimpleStringProperty(
                    p.getValue().has("status") ? p.getValue().get("status").asText() : ""));
            TableColumn<JsonNode, String> dueCol = new TableColumn<>("Due Date");
            dueCol.setCellValueFactory(p -> new javafx.beans.property.SimpleStringProperty(
                    p.getValue().has("dueDate") ? p.getValue().get("dueDate").asText() : ""));

            feeTable.getColumns().addAll(typeCol, amountCol, statusCol, dueCol);

            ObservableList<JsonNode> feeItems = FXCollections.observableArrayList();
            for (JsonNode f : studentData.get("fees")) feeItems.add(f);
            feeTable.setItems(feeItems);

            rightCol.getChildren().addAll(feesTitle, feeTable);
        }

        content.getChildren().addAll(infoCard, rightCol);
        getChildren().add(content);
    }

    private void addInfoRow(VBox container, String label, String value) {
        HBox row = new HBox(10);
        Label lbl = new Label(label + ":");
        lbl.setFont(Font.font("System", FontWeight.BOLD, 13));
        lbl.setPrefWidth(120);
        Label val = new Label(value);
        row.getChildren().addAll(lbl, val);
        container.getChildren().add(row);
    }

    private void showEditDialog() {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Edit Student");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        TextField nameField = new TextField(getText("name"));
        TextField phoneField = new TextField(getText("phone"));
        TextField courseField = new TextField(getText("course"));
        Spinner<Integer> yearSpinner = new Spinner<>(1, 6, Integer.parseInt(getText("year").equals("-") ? "1" : getText("year")));
        ComboBox<String> statusBox = new ComboBox<>();
        statusBox.getItems().addAll("active", "inactive", "graduated");
        statusBox.setValue(getText("status"));

        int row = 0;
        grid.add(new Label("Name:"), 0, row); grid.add(nameField, 1, row++);
        grid.add(new Label("Phone:"), 0, row); grid.add(phoneField, 1, row++);
        grid.add(new Label("Course:"), 0, row); grid.add(courseField, 1, row++);
        grid.add(new Label("Year:"), 0, row); grid.add(yearSpinner, 1, row++);
        grid.add(new Label("Status:"), 0, row); grid.add(statusBox, 1, row++);

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("name", nameField.getText().trim());
                body.put("phone", phoneField.getText().trim());
                body.put("course", courseField.getText().trim());
                body.put("year", yearSpinner.getValue());
                body.put("status", statusBox.getValue());
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.put("/students/" + studentId, body);
                    Platform.runLater(() -> loadStudent());
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }

    private String getText(String field) {
        if (studentData != null && studentData.has(field) && !studentData.get(field).isNull()) {
            return studentData.get(field).asText();
        }
        return "-";
    }
}
