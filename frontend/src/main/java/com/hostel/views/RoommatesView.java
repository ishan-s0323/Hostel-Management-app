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

public class RoommatesView extends VBox {

    private TableView<JsonNode> compatibilityTable;
    private Label prefStatus;
    private Label compatStatus;
    private ComboBox<String> sleepBox;
    private ComboBox<String> studyBox;
    private ComboBox<String> neatBox;

    public RoommatesView() {
        setSpacing(15);
        setPadding(new Insets(20));

        Label title = new Label("Roommate Preferences & Compatibility");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        // Preference Form Section
        Label prefTitle = new Label("Your Preferences");
        prefTitle.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");

        prefStatus = new Label("Loading preferences...");

        GridPane prefGrid = new GridPane();
        prefGrid.setHgap(10);
        prefGrid.setVgap(10);
        prefGrid.setPadding(new Insets(10));

        sleepBox = new ComboBox<>();
        sleepBox.getItems().addAll("early", "moderate", "late");
        sleepBox.setValue("moderate");

        studyBox = new ComboBox<>();
        studyBox.getItems().addAll("quiet", "moderate", "social");
        studyBox.setValue("moderate");

        neatBox = new ComboBox<>();
        neatBox.getItems().addAll("very_neat", "moderate", "relaxed");
        neatBox.setValue("moderate");

        int row = 0;
        prefGrid.add(new Label("Sleep Schedule:"), 0, row); prefGrid.add(sleepBox, 1, row++);
        prefGrid.add(new Label("Study Habit:"), 0, row); prefGrid.add(studyBox, 1, row++);
        prefGrid.add(new Label("Neatness Level:"), 0, row); prefGrid.add(neatBox, 1, row++);

        Button saveBtn = new Button("Save Preferences");
        saveBtn.getStyleClass().add("btn-primary");
        saveBtn.setOnAction(e -> savePreferences());

        HBox prefActions = new HBox(10);
        prefActions.setAlignment(Pos.CENTER_LEFT);
        prefActions.getChildren().add(saveBtn);

        Separator separator = new Separator();

        // Compatibility Table Section
        Label compatTitle = new Label("Compatibility Results");
        compatTitle.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");

        compatStatus = new Label("Loading compatibility data...");

        compatibilityTable = new TableView<>();
        compatibilityTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(compatibilityTable, Priority.ALWAYS);

        addColumn("Student Name", "studentName", 150);
        addColumn("Sleep Schedule", "sleepSchedule", 120);
        addColumn("Study Habit", "studyHabit", 120);
        addColumn("Neatness Level", "neatnessLevel", 120);
        addColumn("Compatibility Score", "compatibilityScore", 140);

        getChildren().addAll(title, prefTitle, prefStatus, prefGrid, prefActions, separator, compatTitle, compatStatus, compatibilityTable);
        loadPreferences();
        loadCompatibility();
    }

    private void addColumn(String header, String field, double width) {
        TableColumn<JsonNode, String> col = new TableColumn<>(header);
        col.setCellValueFactory(param -> {
            JsonNode node = param.getValue();
            String val = node.has(field) && !node.get(field).isNull() ? node.get(field).asText("") : "-";
            return new javafx.beans.property.SimpleStringProperty(val);
        });
        col.setPrefWidth(width);
        compatibilityTable.getColumns().add(col);
    }

    private void loadPreferences() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/roommates/preference");
                Platform.runLater(() -> {
                    JsonNode pref = response.has("preference") ? response.get("preference") : response;
                    if (pref != null && !pref.isNull() && !pref.isMissingNode()) {
                        if (pref.has("sleep_schedule") && !pref.get("sleep_schedule").isNull()) {
                            sleepBox.setValue(pref.get("sleep_schedule").asText());
                        }
                        if (pref.has("study_habit") && !pref.get("study_habit").isNull()) {
                            studyBox.setValue(pref.get("study_habit").asText());
                        }
                        if (pref.has("neatness_level") && !pref.get("neatness_level").isNull()) {
                            neatBox.setValue(pref.get("neatness_level").asText());
                        }
                        prefStatus.setText("Preferences loaded");
                    } else {
                        prefStatus.setText("No preferences set yet");
                    }
                });
            } catch (Exception ex) {
                Platform.runLater(() -> prefStatus.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }

    private void loadCompatibility() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/roommates/compatibility");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("results") ? response.get("results") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    compatibilityTable.setItems(items);
                    compatStatus.setText(items.size() + " compatible roommate(s) found");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> compatStatus.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }

    private void savePreferences() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("sleep_schedule", sleepBox.getValue());
        body.put("study_habit", studyBox.getValue());
        body.put("neatness_level", neatBox.getValue());

        new Thread(() -> {
            try {
                ApiClient.post("/roommates/preference", body);
                Platform.runLater(() -> {
                    prefStatus.setText("Preferences saved successfully");
                    loadCompatibility();
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
            }
        }).start();
    }
}
