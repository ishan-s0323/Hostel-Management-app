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

import java.util.LinkedHashMap;
import java.util.Map;

public class ComplaintsView extends VBox {

    private TableView<JsonNode> table;

    public ComplaintsView() {
        setSpacing(15);
        setPadding(new Insets(10));

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        Button addBtn = new Button("+ New Complaint");
        addBtn.getStyleClass().add("btn-primary");
        addBtn.setOnAction(e -> showAddComplaintDialog());
        toolbar.getChildren().add(addBtn);

        getChildren().add(toolbar);

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        if (SessionManager.isAdmin()) {
            addColumn("Student", "studentName", 120);
        }
        addColumn("Category", "category", 100);
        addColumn("Subject", "subject", 150);
        addColumn("Priority", "priority", 70);
        addColumn("Status", "status", 80);
        addColumn("Created", "createdAt", 110);

        TableColumn<JsonNode, Void> actionsCol = new TableColumn<>("Actions");
        actionsCol.setCellFactory(col -> new TableCell<>() {
            private final Button updateBtn = new Button("Update");
            {
                updateBtn.getStyleClass().add("btn-small");
                updateBtn.setOnAction(e -> {
                    JsonNode complaint = getTableView().getItems().get(getIndex());
                    showUpdateDialog(complaint);
                });
            }
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) { setGraphic(null); return; }
                JsonNode complaint = getTableView().getItems().get(getIndex());
                String status = complaint.has("status") ? complaint.get("status").asText() : "";
                boolean canUpdate = SessionManager.isAdmin() || "open".equals(status);
                setGraphic(canUpdate ? updateBtn : null);
            }
        });
        table.getColumns().add(actionsCol);

        getChildren().add(table);
        loadComplaints();
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

    private void loadComplaints() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/complaints");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode complaints = response.has("complaints") ? response.get("complaints") : response;
                    if (complaints.isArray()) for (JsonNode c : complaints) items.add(c);
                    table.setItems(items);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, "Failed: " + ex.getMessage()).show());
            }
        }).start();
    }

    private void showAddComplaintDialog() {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("New Complaint");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        ComboBox<String> categoryBox = new ComboBox<>();
        categoryBox.getItems().addAll("maintenance", "cleanliness", "noise", "security", "facilities", "food", "other");
        categoryBox.setValue("maintenance");

        TextField subjectField = new TextField();
        subjectField.setPromptText("Subject");

        TextArea descArea = new TextArea();
        descArea.setPromptText("Describe the issue...");
        descArea.setPrefRowCount(4);

        ComboBox<String> priorityBox = new ComboBox<>();
        priorityBox.getItems().addAll("low", "medium", "high", "urgent");
        priorityBox.setValue("medium");

        int row = 0;
        grid.add(new Label("Category:"), 0, row); grid.add(categoryBox, 1, row++);
        grid.add(new Label("Subject:"), 0, row); grid.add(subjectField, 1, row++);
        grid.add(new Label("Priority:"), 0, row); grid.add(priorityBox, 1, row++);
        grid.add(new Label("Description:"), 0, row); grid.add(descArea, 1, row++);

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("category", categoryBox.getValue());
                body.put("subject", subjectField.getText().trim());
                body.put("description", descArea.getText().trim());
                body.put("priority", priorityBox.getValue());
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.post("/complaints", body);
                    Platform.runLater(() -> loadComplaints());
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }

    private void showUpdateDialog(JsonNode complaint) {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Update Complaint");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        int row = 0;

        if (SessionManager.isAdmin()) {
            ComboBox<String> statusBox = new ComboBox<>();
            statusBox.getItems().addAll("open", "in_progress", "resolved", "closed");
            statusBox.setValue(complaint.has("status") ? complaint.get("status").asText() : "open");

            TextArea resolutionArea = new TextArea();
            resolutionArea.setPromptText("Resolution notes...");
            resolutionArea.setPrefRowCount(3);
            if (complaint.has("resolution") && !complaint.get("resolution").isNull()) {
                resolutionArea.setText(complaint.get("resolution").asText());
            }

            grid.add(new Label("Status:"), 0, row); grid.add(statusBox, 1, row++);
            grid.add(new Label("Resolution:"), 0, row); grid.add(resolutionArea, 1, row++);

            dialog.getDialogPane().setContent(grid);
            dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

            dialog.setResultConverter(btn -> {
                if (btn == ButtonType.OK) {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("status", statusBox.getValue());
                    body.put("resolution", resolutionArea.getText().trim());
                    return body;
                }
                return null;
            });
        } else {
            TextField subjectField = new TextField(complaint.has("subject") ? complaint.get("subject").asText() : "");
            TextArea descArea = new TextArea(complaint.has("description") ? complaint.get("description").asText() : "");
            descArea.setPrefRowCount(4);

            grid.add(new Label("Subject:"), 0, row); grid.add(subjectField, 1, row++);
            grid.add(new Label("Description:"), 0, row); grid.add(descArea, 1, row++);

            dialog.getDialogPane().setContent(grid);
            dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

            dialog.setResultConverter(btn -> {
                if (btn == ButtonType.OK) {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("subject", subjectField.getText().trim());
                    body.put("description", descArea.getText().trim());
                    return body;
                }
                return null;
            });
        }

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.put("/complaints/" + complaint.get("id").asInt(), body);
                    Platform.runLater(() -> loadComplaints());
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }
}
