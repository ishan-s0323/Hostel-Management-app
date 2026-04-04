package com.hostel.views;

import com.hostel.util.ApiClient;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class BlocksView extends VBox {

    private TableView<JsonNode> table;
    private Label statusLabel;

    public BlocksView() {
        setSpacing(15);
        setPadding(new Insets(20));

        Label title = new Label("Hostel Blocks");
        title.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");

        statusLabel = new Label("Loading...");

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Block Name", "blockName", 130);
        addColumn("Floors", "floors", 70);
        addColumn("Warden", "wardenName", 140);
        addColumn("Total Rooms", "totalRooms", 90);
        addColumn("Total Capacity", "totalCapacity", 100);
        addColumn("Total Occupancy", "totalOccupancy", 110);
        addColumn("Available Beds", "availableBeds", 100);

        getChildren().addAll(title, statusLabel, table);
        table.setVisible(false);
        loadData();
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

    private void loadData() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/blocks");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("blocks") ? response.get("blocks") : response;
                    if (data.isArray()) for (JsonNode node : data) items.add(node);
                    table.setItems(items);
                    table.setVisible(true);
                    statusLabel.setText(items.size() + " blocks loaded");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> statusLabel.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }
}
