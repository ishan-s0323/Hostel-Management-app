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

public class FeedbackView extends VBox {

    private TableView<JsonNode> table;
    private Label statusLabel;

    public FeedbackView() {
        setSpacing(15);
        setPadding(new Insets(20));

        Label title = new Label("Feedback");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);
        toolbar.getChildren().add(title);

        if (!SessionManager.isAdmin()) {
            Button submitBtn = new Button("Submit Feedback");
            submitBtn.getStyleClass().add("btn-primary");
            submitBtn.setOnAction(e -> showSubmitFeedbackDialog());
            toolbar.getChildren().add(submitBtn);
        }

        statusLabel = new Label("Loading...");

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Student Name", "studentName", 140);
        addColumn("Mess Rating", "messRating", 100);
        addColumn("Cleanliness", "cleanlinessRating", 110);
        addColumn("WiFi Rating", "wifiRating", 100);
        addColumn("Maintenance", "maintenanceRating", 110);
        addColumn("Date Submitted", "dateSubmitted", 130);

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
                JsonNode response = ApiClient.get("/feedback");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("feedback") ? response.get("feedback") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    table.setItems(items);
                    statusLabel.setText(items.size() + " feedback entry(ies)");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> statusLabel.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }

    private void showSubmitFeedbackDialog() {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Submit Feedback");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        Spinner<Integer> messSpinner = new Spinner<>(1, 5, 3);
        Spinner<Integer> cleanSpinner = new Spinner<>(1, 5, 3);
        Spinner<Integer> wifiSpinner = new Spinner<>(1, 5, 3);
        Spinner<Integer> maintSpinner = new Spinner<>(1, 5, 3);
        TextArea commentsArea = new TextArea();
        commentsArea.setPromptText("Additional comments (optional)...");
        commentsArea.setPrefRowCount(3);

        int row = 0;
        grid.add(new Label("Mess Rating (1-5):"), 0, row); grid.add(messSpinner, 1, row++);
        grid.add(new Label("Cleanliness (1-5):"), 0, row); grid.add(cleanSpinner, 1, row++);
        grid.add(new Label("WiFi Rating (1-5):"), 0, row); grid.add(wifiSpinner, 1, row++);
        grid.add(new Label("Maintenance (1-5):"), 0, row); grid.add(maintSpinner, 1, row++);
        grid.add(new Label("Comments:"), 0, row); grid.add(commentsArea, 1, row++);

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("messRating", messSpinner.getValue());
                body.put("cleanlinessRating", cleanSpinner.getValue());
                body.put("wifiRating", wifiSpinner.getValue());
                body.put("maintenanceRating", maintSpinner.getValue());
                String comments = commentsArea.getText().trim();
                if (!comments.isEmpty()) {
                    body.put("comments", comments);
                }
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.post("/feedback", body);
                    Platform.runLater(() -> loadData());
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }
}
