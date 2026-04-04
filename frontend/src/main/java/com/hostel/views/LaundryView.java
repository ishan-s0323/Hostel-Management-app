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

public class LaundryView extends VBox {

    private TableView<JsonNode> table;
    private Label statusLabel;

    public LaundryView() {
        setSpacing(15);
        setPadding(new Insets(20));

        HBox toolbar = new HBox(15);
        toolbar.setAlignment(javafx.geometry.Pos.CENTER_LEFT);
        Label title = new Label("Laundry Orders");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        if (!SessionManager.isAdmin()) {
            Button addBtn = new Button("+ Start Laundry Order");
            addBtn.getStyleClass().add("btn-primary");
            addBtn.setOnAction(e -> showAddLaundryDialog());
            toolbar.getChildren().addAll(title, spacer, addBtn);
        } else {
            toolbar.getChildren().addAll(title, spacer);
        }

        statusLabel = new Label("Loading...");

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Student Name", "studentName", 150);
        addColumn("Items Count", "itemsCount", 100);
        addColumn("Submit Date", "submitDate", 130);
        addColumn("Status", "status", 100);
        addColumn("Expected Return", "expectedReturnDate", 140);

        getChildren().addAll(toolbar, statusLabel, table);
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
                JsonNode response = ApiClient.get("/laundry");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("orders") ? response.get("orders") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    table.setItems(items);
                    statusLabel.setText(items.size() + " order(s) found");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> statusLabel.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }

    private void showAddLaundryDialog() {
        Dialog<java.util.Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Start Laundry Order");

        GridPane grid = new GridPane();
        grid.setHgap(10); grid.setVgap(10);
        grid.setPadding(new Insets(20));

        TextField itemsField = new TextField("3");
        itemsField.setPromptText("Number of Items");

        DatePicker returnDatePicker = new DatePicker();

        grid.add(new Label("Total Items:"), 0, 0); grid.add(itemsField, 1, 0);
        grid.add(new Label("Expected Return Date:"), 0, 1); grid.add(returnDatePicker, 1, 1);

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
                if (returnDatePicker.getValue() != null) body.put("expectedReturnDate", returnDatePicker.getValue().toString());
                
                java.util.List<java.util.Map<String, Object>> itemsList = new java.util.ArrayList<>();
                java.util.Map<String, Object> item = new java.util.LinkedHashMap<>();
                item.put("itemType", "mixed");
                try {
                    item.put("quantity", Integer.parseInt(itemsField.getText().trim()));
                } catch (NumberFormatException e) {
                    item.put("quantity", 1);
                }
                itemsList.add(item);
                body.put("items", itemsList);
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.post("/laundry", body);
                    Platform.runLater(() -> loadData());
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }
}
