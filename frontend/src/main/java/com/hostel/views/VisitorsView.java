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

public class VisitorsView extends VBox {

    private TableView<JsonNode> table;
    private Label statusLabel;

    public VisitorsView() {
        setSpacing(15);
        setPadding(new Insets(20));

        Label title = new Label("Visitors");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        statusLabel = new Label("Loading...");

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Visitor Name", "visitorName", 140);
        addColumn("Relation", "relation", 100);
        addColumn("Phone", "phone", 110);
        addColumn("Student Name", "studentName", 140);
        addColumn("Entry Time", "entryTime", 130);
        addColumn("Exit Time", "exitTime", 130);
        addColumn("Approved By", "approvedBy", 120);

        getChildren().addAll(title, statusLabel, table);
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
                JsonNode response = ApiClient.get("/visitors");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("visitors") ? response.get("visitors") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    table.setItems(items);
                    statusLabel.setText(items.size() + " visitor(s) found");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> statusLabel.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }
}
