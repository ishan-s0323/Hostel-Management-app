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

public class AllocationsView extends VBox {

    private TableView<JsonNode> table;

    public AllocationsView() {
        setSpacing(15);
        setPadding(new Insets(10));

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        if (SessionManager.isAdmin()) {
            Button allocateBtn = new Button("+ Allocate Room");
            allocateBtn.getStyleClass().add("btn-success");
            allocateBtn.setOnAction(e -> showAllocateDialog());
            toolbar.getChildren().add(allocateBtn);
        }

        getChildren().add(toolbar);

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Student", "studentName", 150);
        addColumn("Room", "roomNumber", 80);
        addColumn("Allocated Date", "allocatedDate", 120);
        addColumn("Released Date", "releasedDate", 120);
        addColumn("Status", "status", 80);
        addColumn("Notes", "notes", 150);

        if (SessionManager.isAdmin()) {
            TableColumn<JsonNode, Void> actionsCol = new TableColumn<>("Actions");
            actionsCol.setCellFactory(col -> new TableCell<>() {
                private final Button releaseBtn = new Button("Release");
                {
                    releaseBtn.getStyleClass().addAll("btn-small", "btn-danger");
                    releaseBtn.setOnAction(e -> {
                        JsonNode alloc = getTableView().getItems().get(getIndex());
                        releaseAllocation(alloc.get("id").asInt());
                    });
                }
                @Override
                protected void updateItem(Void item, boolean empty) {
                    super.updateItem(item, empty);
                    if (empty) { setGraphic(null); return; }
                    JsonNode alloc = getTableView().getItems().get(getIndex());
                    String status = alloc.has("status") ? alloc.get("status").asText() : "";
                    setGraphic("active".equals(status) ? releaseBtn : null);
                }
            });
            table.getColumns().add(actionsCol);
        }

        getChildren().add(table);
        loadAllocations();
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

    private void loadAllocations() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/allocations");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode allocs = response.has("allocations") ? response.get("allocations") : response;
                    if (allocs.isArray()) for (JsonNode a : allocs) items.add(a);
                    table.setItems(items);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, "Failed: " + ex.getMessage()).show());
            }
        }).start();
    }

    private void showAllocateDialog() {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Allocate Room");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        ComboBox<String> studentBox = new ComboBox<>();
        studentBox.setPromptText("Select Student");
        studentBox.setPrefWidth(250);

        ComboBox<String> roomBox = new ComboBox<>();
        roomBox.setPromptText("Select Room");
        roomBox.setPrefWidth(250);

        TextArea notesArea = new TextArea();
        notesArea.setPromptText("Notes (optional)");
        notesArea.setPrefRowCount(3);

        Label suggestLabel = new Label("Loading suggested rooms...");
        suggestLabel.setStyle("-fx-text-fill: #666;");

        grid.add(new Label("Student:"), 0, 0); grid.add(studentBox, 1, 0);
        grid.add(new Label("Room:"), 0, 1); grid.add(roomBox, 1, 1);
        grid.add(suggestLabel, 1, 2);
        grid.add(new Label("Notes:"), 0, 3); grid.add(notesArea, 1, 3);

        // Load students and rooms
        new Thread(() -> {
            try {
                JsonNode students = ApiClient.get("/students?limit=500");
                JsonNode rooms = ApiClient.get("/rooms/suggest");
                Platform.runLater(() -> {
                    JsonNode studentList = students.has("students") ? students.get("students") : students;
                    if (studentList.isArray()) {
                        for (JsonNode s : studentList) {
                            studentBox.getItems().add(s.get("id").asInt() + " - " + s.get("name").asText());
                        }
                    }
                    JsonNode roomList = rooms.has("rooms") ? rooms.get("rooms") : rooms;
                    if (roomList.isArray()) {
                        for (JsonNode r : roomList) {
                            roomBox.getItems().add(r.get("id").asInt() + " - " + r.get("roomNumber").asText()
                                    + " (" + r.get("currentOccupancy").asInt() + "/" + r.get("capacity").asInt() + ")");
                        }
                        suggestLabel.setText("Showing rooms sorted by availability");
                    }
                });
            } catch (Exception ignored) {}
        }).start();

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK && studentBox.getValue() != null && roomBox.getValue() != null) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("studentId", Integer.parseInt(studentBox.getValue().split(" - ")[0]));
                body.put("roomId", Integer.parseInt(roomBox.getValue().split(" - ")[0]));
                body.put("notes", notesArea.getText().trim());
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    JsonNode result = ApiClient.post("/allocations", body);
                    Platform.runLater(() -> {
                        String msg = result.has("message") ? result.get("message").asText() : "Room allocated!";
                        new Alert(Alert.AlertType.INFORMATION, msg).show();
                        loadAllocations();
                    });
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }

    private void releaseAllocation(int allocId) {
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION, "Release this room allocation?");
        confirm.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                new Thread(() -> {
                    try {
                        ApiClient.put("/allocations/" + allocId + "/release", null);
                        Platform.runLater(() -> loadAllocations());
                    } catch (Exception ex) {
                        Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                    }
                }).start();
            }
        });
    }
}
