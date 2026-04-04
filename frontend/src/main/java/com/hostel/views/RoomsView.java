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

public class RoomsView extends VBox {

    private TableView<JsonNode> table;
    private ComboBox<String> statusFilter;
    private ComboBox<String> typeFilter;

    public RoomsView() {
        setSpacing(15);
        setPadding(new Insets(10));

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        statusFilter = new ComboBox<>();
        statusFilter.getItems().addAll("All", "available", "full", "maintenance");
        statusFilter.setValue("All");
        statusFilter.setOnAction(e -> loadRooms());

        typeFilter = new ComboBox<>();
        typeFilter.getItems().addAll("All", "single", "double", "triple", "dormitory");
        typeFilter.setValue("All");
        typeFilter.setOnAction(e -> loadRooms());

        toolbar.getChildren().addAll(new Label("Status:"), statusFilter, new Label("Type:"), typeFilter);

        if (!SessionManager.isAdmin()) {
            statusFilter.setValue("available");
            statusFilter.setVisible(false);
            statusFilter.setManaged(false);
            toolbar.getChildren().get(0).setVisible(false); // Hide the "Status:" label
            toolbar.getChildren().get(0).setManaged(false);
        }

        if (SessionManager.isAdmin()) {
            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);
            Button addBtn = new Button("+ Add Room");
            addBtn.getStyleClass().add("btn-success");
            addBtn.setOnAction(e -> showAddRoomDialog());
            toolbar.getChildren().addAll(spacer, addBtn);
        }

        getChildren().add(toolbar);

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Room #", "roomNumber", 80);
        addColumn("Type", "roomType", 80);
        addColumn("Block", "block", 60);
        addColumn("Floor", "floorNum", 50);
        addColumn("Rent/Month", "rentPerMonth", 90);
        addColumn("Status", "status", 80);

        TableColumn<JsonNode, Void> occupancyCol = new TableColumn<>("Occupancy");
        occupancyCol.setCellFactory(col -> new TableCell<>() {
            private final ProgressBar bar = new ProgressBar();
            private final Label label = new Label();
            private final VBox box = new VBox(3, bar, label);
            {
                bar.setPrefWidth(120);
                box.setAlignment(Pos.CENTER);
                label.setStyle("-fx-font-size: 11px;");
            }
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) { setGraphic(null); return; }
                JsonNode room = getTableView().getItems().get(getIndex());
                int current = room.has("currentOccupancy") ? room.get("currentOccupancy").asInt() : 0;
                int capacity = room.has("capacity") ? room.get("capacity").asInt() : 1;
                double ratio = (double) current / capacity;
                bar.setProgress(ratio);
                bar.getStyleClass().removeAll("bar-green", "bar-yellow", "bar-red");
                bar.getStyleClass().add(ratio >= 1.0 ? "bar-red" : ratio >= 0.5 ? "bar-yellow" : "bar-green");
                label.setText(current + " / " + capacity);
                setGraphic(box);
            }
        });
        occupancyCol.setPrefWidth(150);
        table.getColumns().add(occupancyCol);

        getChildren().add(table);
        loadRooms();
    }

    private void addColumn(String header, String field, double width) {
        TableColumn<JsonNode, String> col = new TableColumn<>(header);
        col.setCellValueFactory(param -> {
            JsonNode node = param.getValue();
            String val = node.has(field) && !node.get(field).isNull() ? node.get(field).asText("") : "-";
            if (field.equals("rentPerMonth")) val = "$" + val;
            return new javafx.beans.property.SimpleStringProperty(val);
        });
        col.setPrefWidth(width);
        table.getColumns().add(col);
    }

    private void loadRooms() {
        new Thread(() -> {
            try {
                String query = "?";
                if (!"All".equals(statusFilter.getValue())) query += "status=" + statusFilter.getValue() + "&";
                if (!"All".equals(typeFilter.getValue())) query += "type=" + typeFilter.getValue();

                JsonNode response = ApiClient.get("/rooms" + query);
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode rooms = response.has("rooms") ? response.get("rooms") : response;
                    if (rooms.isArray()) for (JsonNode r : rooms) items.add(r);
                    table.setItems(items);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, "Failed: " + ex.getMessage()).show());
            }
        }).start();
    }

    private void showAddRoomDialog() {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Add New Room");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        TextField roomNumField = new TextField();
        Spinner<Integer> capacitySpinner = new Spinner<>(1, 10, 2);
        ComboBox<String> typeBox = new ComboBox<>();
        typeBox.getItems().addAll("single", "double", "triple", "dormitory");
        typeBox.setValue("double");
        TextField rentField = new TextField("5000");
        Spinner<Integer> floorSpinner = new Spinner<>(1, 20, 1);
        TextField blockField = new TextField();

        int row = 0;
        grid.add(new Label("Room Number:"), 0, row); grid.add(roomNumField, 1, row++);
        grid.add(new Label("Capacity:"), 0, row); grid.add(capacitySpinner, 1, row++);
        grid.add(new Label("Type:"), 0, row); grid.add(typeBox, 1, row++);
        grid.add(new Label("Rent/Month:"), 0, row); grid.add(rentField, 1, row++);
        grid.add(new Label("Floor:"), 0, row); grid.add(floorSpinner, 1, row++);
        grid.add(new Label("Block:"), 0, row); grid.add(blockField, 1, row++);

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("roomNumber", roomNumField.getText().trim());
                body.put("capacity", capacitySpinner.getValue());
                body.put("roomType", typeBox.getValue());
                body.put("rentPerMonth", Double.parseDouble(rentField.getText().trim()));
                body.put("floorNum", floorSpinner.getValue());
                body.put("block", blockField.getText().trim());
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.post("/rooms", body);
                    Platform.runLater(() -> loadRooms());
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }
}
