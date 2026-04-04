package com.hostel.views;

import com.hostel.util.ApiClient;
import com.hostel.util.SessionManager;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.chart.*;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.util.Timer;
import java.util.TimerTask;

public class DashboardView extends VBox {

    private Timer pollingTimer;

    public DashboardView() {
        setSpacing(20);
        setPadding(new Insets(10));

        if (SessionManager.isAdmin()) {
            buildAdminDashboard();
        } else {
            buildStudentDashboard();
        }
    }

    private void buildAdminDashboard() {
        new Thread(() -> {
            try {
                JsonNode data = ApiClient.get("/dashboard/stats");
                Platform.runLater(() -> renderAdminDashboard(data));
            } catch (Exception ex) {
                Platform.runLater(() -> getChildren().add(new Label("Failed to load dashboard: " + ex.getMessage())));
            }
        }).start();

        Label loading = new Label("Loading dashboard...");
        loading.setFont(Font.font("System", FontWeight.NORMAL, 14));
        getChildren().add(loading);
    }

    private void renderAdminDashboard(JsonNode data) {
        getChildren().clear();

        JsonNode stats = data.has("stats") ? data.get("stats") : data;

        HBox statCards = new HBox(15);
        statCards.setAlignment(Pos.CENTER_LEFT);
        addStatCard(statCards, "Total Students", getIntStr(stats, "totalStudents"), "stat-card-blue");
        addStatCard(statCards, "Total Rooms", getIntStr(stats, "totalRooms"), "stat-card-green");
        addStatCard(statCards, "Active Allocations", getIntStr(stats, "activeAllocations"), "stat-card-purple");
        addStatCard(statCards, "Pending Complaints", getIntStr(stats, "pendingComplaints"), "stat-card-orange");
        getChildren().add(statCards);

        HBox row2 = new HBox(15);
        addStatCard(row2, "Occupancy Rate", getIntStr(stats, "occupancyRate") + "%", "stat-card-teal");
        addStatCard(row2, "Total Collected", "$" + getIntStr(stats, "totalCollected"), "stat-card-green");
        addStatCard(row2, "Outstanding Fees", "$" + getIntStr(stats, "outstandingAmount"), "stat-card-red");
        addStatCard(row2, "Overdue Fees", getIntStr(stats, "overdueFees"), "stat-card-orange");
        getChildren().add(row2);

        HBox chartsRow = new HBox(20);
        chartsRow.setPrefHeight(300);
        HBox.setHgrow(chartsRow, Priority.ALWAYS);

        if (data.has("monthlyCollection") && data.get("monthlyCollection").isArray()) {
            BarChart<String, Number> barChart = createMonthlyChart(data.get("monthlyCollection"));
            HBox.setHgrow(barChart, Priority.ALWAYS);
            chartsRow.getChildren().add(barChart);
        }

        if (data.has("complaintsByStatus") && data.get("complaintsByStatus").isArray()) {
            PieChart pieChart = createComplaintsPieChart(data.get("complaintsByStatus"));
            pieChart.setPrefWidth(350);
            chartsRow.getChildren().add(pieChart);
        }

        getChildren().add(chartsRow);

        if (data.has("recentAllocations") && data.get("recentAllocations").isArray()) {
            getChildren().add(createRecentTable("Recent Allocations", data.get("recentAllocations"),
                    new String[]{"studentName", "roomNumber", "allocatedDate", "status"},
                    new String[]{"Student", "Room", "Date", "Status"}));
        }
    }

    private void buildStudentDashboard() {
        new Thread(() -> {
            try {
                JsonNode data = ApiClient.get("/dashboard/student-stats");
                Platform.runLater(() -> renderStudentDashboard(data));
            } catch (Exception ex) {
                Platform.runLater(() -> getChildren().add(new Label("Failed to load: " + ex.getMessage())));
            }
        }).start();

        getChildren().add(new Label("Loading..."));
    }

    private void renderStudentDashboard(JsonNode data) {
        getChildren().clear();

        Label welcome = new Label("Welcome, " + SessionManager.getUserName());
        welcome.setFont(Font.font("System", FontWeight.BOLD, 20));
        getChildren().add(welcome);

        HBox cards = new HBox(15);
        if (data.has("room") && !data.get("room").isNull()) {
            JsonNode room = data.get("room");
            addStatCard(cards, "Your Room", room.has("roomId") ? room.get("roomId").asText() : "N/A", "stat-card-blue");
            addStatCard(cards, "Block", room.has("blockName") ? room.get("blockName").asText() : "N/A", "stat-card-purple");
        } else {
            addStatCard(cards, "Your Room", "Not Allocated", "stat-card-gray");
        }

        try {
            JsonNode me = ApiClient.get("/auth/me");
            addStatCard(cards, "Year of Study", me.has("yearOfStudy") ? me.get("yearOfStudy").asText() : "N/A", "stat-card-teal");
            addStatCard(cards, "Reg. Number", me.has("id") ? me.get("id").asText() : "N/A", "stat-card-gray");
        } catch (Exception e) {}

        HBox feeCards = new HBox(15);
        if (data.has("fees") && !data.get("fees").isNull()) {
            JsonNode fees = data.get("fees");
            addStatCard(feeCards, "Total Fees", "$" + getIntStr(fees, "total"), "stat-card-green");
            addStatCard(feeCards, "Paid", "$" + getIntStr(fees, "paid"), "stat-card-teal");
            addStatCard(feeCards, "Pending", "$" + getIntStr(fees, "pending"), "stat-card-orange");
        }
        getChildren().addAll(cards, feeCards);

        if (data.has("notifications") && data.get("notifications").isArray()) {
            Label notifTitle = new Label("Recent Notifications");
            notifTitle.setFont(Font.font("System", FontWeight.BOLD, 16));
            notifTitle.setPadding(new Insets(10, 0, 5, 0));
            getChildren().add(notifTitle);

            VBox notifList = new VBox(8);
            for (JsonNode n : data.get("notifications")) {
                HBox item = new HBox(10);
                item.getStyleClass().add("notif-item");
                item.setPadding(new Insets(10));
                Label titleLbl = new Label(n.has("title") ? n.get("title").asText() : "");
                titleLbl.setFont(Font.font("System", FontWeight.BOLD, 13));
                Label msgLbl = new Label(n.has("message") ? n.get("message").asText() : "");
                msgLbl.setWrapText(true);
                VBox textBox = new VBox(3, titleLbl, msgLbl);
                item.getChildren().add(textBox);
                notifList.getChildren().add(item);
            }
            getChildren().add(notifList);
        }
    }

    private void addStatCard(HBox container, String title, String value, String styleClass) {
        VBox card = new VBox(8);
        card.getStyleClass().addAll("stat-card", styleClass);
        card.setPadding(new Insets(18));
        card.setPrefWidth(200);
        card.setAlignment(Pos.CENTER_LEFT);

        Label titleLbl = new Label(title);
        titleLbl.getStyleClass().add("stat-title");
        Label valueLbl = new Label(value);
        valueLbl.setFont(Font.font("System", FontWeight.BOLD, 24));
        valueLbl.getStyleClass().add("stat-value");

        card.getChildren().addAll(titleLbl, valueLbl);
        container.getChildren().add(card);
    }

    private BarChart<String, Number> createMonthlyChart(JsonNode monthlyData) {
        CategoryAxis xAxis = new CategoryAxis();
        xAxis.setLabel("Month");
        NumberAxis yAxis = new NumberAxis();
        yAxis.setLabel("Amount ($)");

        BarChart<String, Number> chart = new BarChart<>(xAxis, yAxis);
        chart.setTitle("Monthly Fee Collection");
        chart.setLegendVisible(false);

        XYChart.Series<String, Number> series = new XYChart.Series<>();
        for (JsonNode item : monthlyData) {
            String month = item.has("month") ? item.get("month").asText() : "";
            double amount = item.has("amount") ? item.get("amount").asDouble() : 0;
            series.getData().add(new XYChart.Data<>(month, amount));
        }
        chart.getData().add(series);
        return chart;
    }

    private PieChart createComplaintsPieChart(JsonNode complaintsData) {
        ObservableList<PieChart.Data> pieData = FXCollections.observableArrayList();
        for (JsonNode item : complaintsData) {
            String status = item.has("status") ? item.get("status").asText() : "";
            int count = item.has("count") ? item.get("count").asInt() : 0;
            pieData.add(new PieChart.Data(status + " (" + count + ")", count));
        }
        PieChart chart = new PieChart(pieData);
        chart.setTitle("Complaints by Status");
        return chart;
    }

    private VBox createRecentTable(String title, JsonNode data, String[] fields, String[] headers) {
        VBox container = new VBox(8);
        Label titleLbl = new Label(title);
        titleLbl.setFont(Font.font("System", FontWeight.BOLD, 16));

        TableView<JsonNode> table = new TableView<>();
        table.setMaxHeight(200);

        for (int i = 0; i < fields.length; i++) {
            final String field = fields[i];
            TableColumn<JsonNode, String> col = new TableColumn<>(headers[i]);
            col.setCellValueFactory(param -> {
                JsonNode node = param.getValue();
                String val = node.has(field) ? node.get(field).asText("") : "";
                return new javafx.beans.property.SimpleStringProperty(val);
            });
            col.setPrefWidth(160);
            table.getColumns().add(col);
        }

        ObservableList<JsonNode> items = FXCollections.observableArrayList();
        for (JsonNode row : data) {
            items.add(row);
        }
        table.setItems(items);

        container.getChildren().addAll(titleLbl, table);
        return container;
    }

    private String getIntStr(JsonNode node, String field) {
        if (node != null && node.has(field)) {
            return node.get(field).asText("0");
        }
        return "0";
    }
}
