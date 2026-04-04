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

public class RoomRequestsView extends VBox {

    private TableView<JsonNode> changeTable;
    private TableView<JsonNode> waitlistTable;
    private Label changeStatus;
    private Label waitlistStatus;

    public RoomRequestsView() {
        setSpacing(15);
        setPadding(new Insets(20));

        Label title = new Label("Room Requests");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        TabPane tabPane = new TabPane();
        VBox.setVgrow(tabPane, Priority.ALWAYS);

        // Change Requests Tab
        Tab changeTab = new Tab("Change Requests");
        changeTab.setClosable(false);
        VBox changeBox = new VBox(10);
        changeBox.setPadding(new Insets(10));
        changeStatus = new Label("Loading...");
        changeTable = new TableView<>();
        changeTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(changeTable, Priority.ALWAYS);
        addColumn(changeTable, "Student Name", "studentName", 140);
        addColumn(changeTable, "Requested Block", "requestedBlockName", 130);
        addColumn(changeTable, "Requested Room Type", "requestedRoomType", 140);
        addColumn(changeTable, "Reason", "reason", 180);
        addColumn(changeTable, "Status", "status", 90);
        changeBox.getChildren().addAll(changeStatus, changeTable);
        changeTab.setContent(changeBox);

        // Waitlist Tab
        Tab waitlistTab = new Tab("Waitlist");
        waitlistTab.setClosable(false);
        VBox waitlistBox = new VBox(10);
        waitlistBox.setPadding(new Insets(10));
        waitlistStatus = new Label("Loading...");
        waitlistTable = new TableView<>();
        waitlistTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(waitlistTable, Priority.ALWAYS);
        addColumn(waitlistTable, "Student Name", "studentName", 140);
        addColumn(waitlistTable, "Block", "blockName", 120);
        addColumn(waitlistTable, "Room Type", "roomType", 110);
        addColumn(waitlistTable, "Priority Rank", "priorityRank", 100);
        addColumn(waitlistTable, "Based On CGPA", "basedOnCgpa", 110);
        addColumn(waitlistTable, "Date Added", "dateAdded", 120);
        waitlistBox.getChildren().addAll(waitlistStatus, waitlistTable);
        waitlistTab.setContent(waitlistBox);

        tabPane.getTabs().addAll(changeTab, waitlistTab);

        getChildren().addAll(title, tabPane);
        loadChangeRequests();
        loadWaitlist();
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

    private void loadChangeRequests() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/requests/room-change");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("requests") ? response.get("requests") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    changeTable.setItems(items);
                    changeStatus.setText(items.size() + " change request(s) found");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> changeStatus.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }

    private void loadWaitlist() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/requests/waitlist");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode data = response.has("waitlist") ? response.get("waitlist") : response;
                    if (data.isArray()) for (JsonNode n : data) items.add(n);
                    waitlistTable.setItems(items);
                    waitlistStatus.setText(items.size() + " waitlist entry(ies)");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> waitlistStatus.setText("Error: " + ex.getMessage()));
            }
        }).start();
    }
}
