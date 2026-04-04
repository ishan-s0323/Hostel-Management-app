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
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.FileChooser;

import java.io.File;

public class ReportsView extends VBox {

    public ReportsView() {
        setSpacing(20);
        setPadding(new Insets(10));

        Label title = new Label("Reports");
        title.setFont(Font.font("System", FontWeight.BOLD, 20));
        getChildren().add(title);

        FlowPane cards = new FlowPane(15, 15);
        cards.setPadding(new Insets(10));

        cards.getChildren().add(createReportCard("Fee Report",
                "Complete fee collection and payment status report",
                "/reports/fees"));

        cards.getChildren().add(createReportCard("Occupancy Report",
                "Room occupancy rates and availability summary",
                "/reports/occupancy"));

        cards.getChildren().add(createReportCard("Student Report",
                "Student enrollment and allocation details",
                "/reports/students"));

        cards.getChildren().add(createReportCard("Collection Report",
                "Monthly fee collection trends and analysis",
                "/reports/collection"));

        getChildren().add(cards);
    }

    private VBox createReportCard(String title, String description, String endpoint) {
        VBox card = new VBox(10);
        card.getStyleClass().add("report-card");
        card.setPadding(new Insets(20));
        card.setPrefWidth(280);
        card.setPrefHeight(200);

        Label titleLbl = new Label(title);
        titleLbl.setFont(Font.font("System", FontWeight.BOLD, 16));

        Label descLbl = new Label(description);
        descLbl.setWrapText(true);
        descLbl.getStyleClass().add("report-desc");

        Region spacer = new Region();
        VBox.setVgrow(spacer, Priority.ALWAYS);

        HBox buttons = new HBox(8);
        buttons.setAlignment(Pos.CENTER_LEFT);

        Button previewBtn = new Button("Preview");
        previewBtn.getStyleClass().add("btn-secondary");
        previewBtn.setOnAction(e -> showPreview(title, endpoint));

        Button csvBtn = new Button("CSV");
        csvBtn.getStyleClass().add("btn-primary");
        csvBtn.setOnAction(e -> downloadReport(endpoint, "csv"));

        Button jsonBtn = new Button("JSON");
        jsonBtn.getStyleClass().add("btn-secondary");
        jsonBtn.setOnAction(e -> downloadReport(endpoint, "json"));

        buttons.getChildren().addAll(previewBtn, csvBtn, jsonBtn);

        card.getChildren().addAll(titleLbl, descLbl, spacer, buttons);
        return card;
    }

    private void showPreview(String title, String endpoint) {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get(endpoint);
                Platform.runLater(() -> {
                    Dialog<Void> dialog = new Dialog<>();
                    dialog.setTitle(title + " Preview");
                    dialog.setHeaderText("Showing first 20 rows");
                    dialog.getDialogPane().setPrefSize(700, 500);

                    JsonNode data = response.has("data") ? response.get("data") : response;
                    if (data.isArray() && data.size() > 0) {
                        TableView<JsonNode> table = new TableView<>();
                        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);

                        JsonNode firstRow = data.get(0);
                        firstRow.fieldNames().forEachRemaining(field -> {
                            TableColumn<JsonNode, String> col = new TableColumn<>(field);
                            col.setCellValueFactory(param -> {
                                String val = param.getValue().has(field) ? param.getValue().get(field).asText("") : "";
                                return new javafx.beans.property.SimpleStringProperty(val);
                            });
                            table.getColumns().add(col);
                        });

                        ObservableList<JsonNode> items = FXCollections.observableArrayList();
                        int limit = Math.min(data.size(), 20);
                        for (int i = 0; i < limit; i++) items.add(data.get(i));
                        table.setItems(items);

                        dialog.getDialogPane().setContent(table);
                    } else {
                        dialog.getDialogPane().setContent(new Label("No data available"));
                    }

                    dialog.getDialogPane().getButtonTypes().add(ButtonType.CLOSE);
                    dialog.show();
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, "Failed: " + ex.getMessage()).show());
            }
        }).start();
    }

    private void downloadReport(String endpoint, String format) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Save Report");
        String ext = "csv".equals(format) ? "*.csv" : "*.json";
        fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter(format.toUpperCase(), ext));
        fileChooser.setInitialFileName("report." + format);

        File file = fileChooser.showSaveDialog(getScene().getWindow());
        if (file == null) return;

        new Thread(() -> {
            try {
                if ("csv".equals(format)) {
                    ApiClient.downloadCsv(endpoint + "?format=csv", file.getAbsolutePath());
                } else {
                    JsonNode data = ApiClient.get(endpoint);
                    ApiClient.getMapper().writerWithDefaultPrettyPrinter().writeValue(file, data);
                }
                Platform.runLater(() -> new Alert(Alert.AlertType.INFORMATION, "Report saved to " + file.getName()).show());
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, "Download failed: " + ex.getMessage()).show());
            }
        }).start();
    }
}
