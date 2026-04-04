package com.hostel.views;

import com.hostel.util.ApiClient;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class AuditLogsView extends VBox {

    private TableView<JsonNode> table;
    private ComboBox<String> entityFilter;
    private ComboBox<String> actionFilter;
    private int currentPage = 1;
    private int totalPages = 1;
    private Label pageLabel;

    public AuditLogsView() {
        setSpacing(15);
        setPadding(new Insets(10));

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        entityFilter = new ComboBox<>();
        entityFilter.getItems().addAll("All", "allocation", "fee", "student", "room", "complaint");
        entityFilter.setValue("All");
        entityFilter.setOnAction(e -> { currentPage = 1; loadLogs(); });

        actionFilter = new ComboBox<>();
        actionFilter.getItems().addAll("All", "INSERT", "UPDATE", "DELETE");
        actionFilter.setValue("All");
        actionFilter.setOnAction(e -> { currentPage = 1; loadLogs(); });

        toolbar.getChildren().addAll(new Label("Entity:"), entityFilter, new Label("Action:"), actionFilter);
        getChildren().add(toolbar);

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Date", "createdAt", 150);
        addColumn("Entity", "entityType", 90);
        addColumn("Entity ID", "entityId", 70);
        addColumn("Action", "action", 80);
        addColumn("Performer", "performerName", 120);
        addColumn("Type", "performerType", 70);
        addColumn("Old Values", "oldValues", 180);
        addColumn("New Values", "newValues", 180);

        getChildren().add(table);

        HBox pagination = new HBox(10);
        pagination.setAlignment(Pos.CENTER);
        Button prevBtn = new Button("< Previous");
        prevBtn.setOnAction(e -> { if (currentPage > 1) { currentPage--; loadLogs(); } });
        pageLabel = new Label("Page 1");
        Button nextBtn = new Button("Next >");
        nextBtn.setOnAction(e -> { if (currentPage < totalPages) { currentPage++; loadLogs(); } });
        pagination.getChildren().addAll(prevBtn, pageLabel, nextBtn);
        getChildren().add(pagination);

        loadLogs();
    }

    private void addColumn(String header, String field, double width) {
        TableColumn<JsonNode, String> col = new TableColumn<>(header);
        col.setCellValueFactory(param -> {
            JsonNode node = param.getValue();
            String val = node.has(field) && !node.get(field).isNull() ? node.get(field).asText("") : "-";
            if (val.length() > 80) val = val.substring(0, 80) + "...";
            return new javafx.beans.property.SimpleStringProperty(val);
        });
        col.setPrefWidth(width);
        table.getColumns().add(col);
    }

    private void loadLogs() {
        new Thread(() -> {
            try {
                String query = "?page=" + currentPage + "&limit=25";
                if (!"All".equals(entityFilter.getValue())) query += "&entity=" + entityFilter.getValue();
                if (!"All".equals(actionFilter.getValue())) query += "&action=" + actionFilter.getValue();

                JsonNode response = ApiClient.get("/audit" + query);
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode logs = response.has("logs") ? response.get("logs") : response;
                    if (logs.isArray()) for (JsonNode l : logs) items.add(l);
                    table.setItems(items);

                    if (response.has("pagination")) {
                        JsonNode pag = response.get("pagination");
                        currentPage = pag.has("page") ? pag.get("page").asInt() : 1;
                        totalPages = pag.has("totalPages") ? pag.get("totalPages").asInt() : 1;
                    }
                    pageLabel.setText("Page " + currentPage + " of " + totalPages);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, "Failed: " + ex.getMessage()).show());
            }
        }).start();
    }
}
