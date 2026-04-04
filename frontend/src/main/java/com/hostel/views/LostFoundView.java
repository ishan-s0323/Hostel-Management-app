package com.hostel.views;

import com.hostel.util.ApiClient;
import com.hostel.util.SessionManager;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class LostFoundView extends VBox {

    private TableView<JsonNode> lostTable;
    private TableView<JsonNode> foundTable;
    private Label lostStatus;
    private Label foundStatus;

    public LostFoundView() {
        setSpacing(15);
        setPadding(new Insets(20));

        Label title = new Label("Lost & Found");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        TabPane tabPane = new TabPane();
        VBox.setVgrow(tabPane, Priority.ALWAYS);

        // Lost Items Tab
        Tab lostTab = new Tab("Lost Items");
        lostTab.setClosable(false);
        VBox lostBox = new VBox(10);
        lostBox.setPadding(new Insets(10));
        lostStatus = new Label("Loading...");
        lostTable = new TableView<>();
        lostTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(lostTable, Priority.ALWAYS);
        addColumn(lostTable, "Student Name", "studentName", 140);
        addColumn(lostTable, "Item Name", "itemName", 130);
        addColumn(lostTable, "Description", "description", 180);
        addColumn(lostTable, "Lost Date", "lostDate", 110);
        addColumn(lostTable, "Status", "status", 90);
        lostBox.getChildren().addAll(lostStatus, lostTable);
        lostTab.setContent(lostBox);

        // Found Items Tab
        Tab foundTab = new Tab("Found Items");
        foundTab.setClosable(false);
        VBox foundBox = new VBox(10);
        foundBox.setPadding(new Insets(10));
        foundStatus = new Label("Loading...");
        foundTable = new TableView<>();
        foundTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(foundTable, Priority.ALWAYS);
        addColumn(foundTable, "Found By", "foundByName", 130);
        addColumn(foundTable, "Item Name", "itemName", 130);
        addColumn(foundTable, "Description", "description", 170);
        addColumn(foundTable, "Found Date", "foundDate", 110);
        addColumn(foundTable, "Location", "location", 120);
        addColumn(foundTable, "Status", "status", 90);
        foundBox.getChildren().addAll(foundStatus, foundTable);
        foundTab.setContent(foundBox);

        tabPane.getTabs().addAll(lostTab, foundTab);

        getChildren().addAll(title, tabPane);
        loadLostItems();
        loadFoundItems();
    }

    private void addColumn(TableView<JsonNode> tableView, String header, String field, double width) {
        TableColumn<JsonNode, String> col = new TableColumn<>(header);
        col.setCellValueFactory(param -> {
            JsonNode node = param.getValue();
            String val = node.has(field) && !node.get(field).isNull() ? node.get(field).asText("") : "-";
            return new javafx.beans.property.SimpleStringProperty(val);
        });
        col.setPrefWidth(width);
        tableView.getColumns().add(col);
    }

    private void loadLostItems() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/lostfound/lost");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("items") ? response.get("items") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    lostTable.setItems(items);
                    lostStatus.setText(items.size() + " lost item(s) found");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> lostStatus.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }

    private void loadFoundItems() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/lostfound/found");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("items") ? response.get("items") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    foundTable.setItems(items);
                    foundStatus.setText(items.size() + " found item(s)");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> foundStatus.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }
}
