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
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.util.LinkedHashMap;
import java.util.Map;

public class FeesView extends VBox {

    private TableView<JsonNode> table;
    private HBox summaryCards;

    public FeesView() {
        setSpacing(15);
        setPadding(new Insets(10));

        summaryCards = new HBox(15);
        summaryCards.setAlignment(Pos.CENTER_LEFT);
        getChildren().add(summaryCards);

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        if (SessionManager.isAdmin()) {
            Button addBtn = new Button("+ Add Fee");
            addBtn.getStyleClass().add("btn-success");
            addBtn.setOnAction(e -> showAddFeeDialog());

            Button markOverdueBtn = new Button("Mark Overdue");
            markOverdueBtn.getStyleClass().add("btn-warning");
            markOverdueBtn.setOnAction(e -> markOverdue());

            toolbar.getChildren().addAll(addBtn, markOverdueBtn);
        }

        getChildren().add(toolbar);

        table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_ALL_COLUMNS);
        VBox.setVgrow(table, Priority.ALWAYS);

        addColumn("Student", "studentName", 140);
        addColumn("Type", "feeType", 100);
        addColumn("Amount", "amount", 80);
        addColumn("Due Date", "dueDate", 100);
        addColumn("Status", "status", 80);
        addColumn("Paid Date", "paidDate", 100);
        addColumn("Method", "paymentMethod", 80);

        TableColumn<JsonNode, Void> actionsCol = new TableColumn<>("Actions");
        actionsCol.setCellFactory(col -> new TableCell<>() {
            private final Button payBtn = new Button("Pay");
            {
                payBtn.getStyleClass().addAll("btn-small", "btn-success");
                payBtn.setOnAction(e -> {
                    JsonNode fee = getTableView().getItems().get(getIndex());
                    payFee(fee.get("feeId") != null ? fee.get("feeId").asInt() : fee.get("id").asInt(), fee.get("amount").asDouble());
                });
            }
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) { setGraphic(null); return; }
                JsonNode fee = getTableView().getItems().get(getIndex());
                String status = fee.has("status") ? fee.get("status").asText() : "";
                setGraphic("paid".equals(status) ? null : payBtn);
            }
        });
        table.getColumns().add(actionsCol);

        getChildren().add(table);
        loadFees();
        loadSummary();
    }

    private void addColumn(String header, String field, double width) {
        TableColumn<JsonNode, String> col = new TableColumn<>(header);
        col.setCellValueFactory(param -> {
            JsonNode node = param.getValue();
            String val = node.has(field) && !node.get(field).isNull() ? node.get(field).asText("") : "-";
            if (field.equals("amount")) val = "$" + val;
            return new javafx.beans.property.SimpleStringProperty(val);
        });
        col.setPrefWidth(width);
        table.getColumns().add(col);
    }

    private void loadFees() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/fees");
                Platform.runLater(() -> {
                    ObservableList<JsonNode> items = FXCollections.observableArrayList();
                    JsonNode fees = response.has("fees") ? response.get("fees") : response;
                    if (fees.isArray()) for (JsonNode f : fees) items.add(f);
                    table.setItems(items);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, "Failed: " + ex.getMessage()).show());
            }
        }).start();
    }

    private void loadSummary() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/fees/summary");
                Platform.runLater(() -> {
                    summaryCards.getChildren().clear();
                    JsonNode summary = response.has("summary") ? response.get("summary") : response;
                    addSummaryCard("Total Fees", "$" + getVal(summary, "totalAmount"), "stat-card-blue");
                    addSummaryCard("Collected", "$" + getVal(summary, "collectedAmount"), "stat-card-green");
                    addSummaryCard("Outstanding", "$" + getVal(summary, "outstandingAmount"), "stat-card-orange");
                    addSummaryCard("Overdue", "$" + getVal(summary, "overdueAmount"), "stat-card-red");
                });
            } catch (Exception ignored) {}
        }).start();
    }

    private void addSummaryCard(String title, String value, String style) {
        VBox card = new VBox(5);
        card.getStyleClass().addAll("stat-card", style);
        card.setPadding(new Insets(15));
        card.setPrefWidth(180);
        Label titleLbl = new Label(title);
        titleLbl.getStyleClass().add("stat-title");
        Label valueLbl = new Label(value);
        valueLbl.setFont(Font.font("System", FontWeight.BOLD, 20));
        card.getChildren().addAll(titleLbl, valueLbl);
        summaryCards.getChildren().add(card);
    }

    private void showAddFeeDialog() {
        Dialog<Map<String, Object>> dialog = new Dialog<>();
        dialog.setTitle("Add Fee");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));

        ComboBox<String> studentBox = new ComboBox<>();
        studentBox.setPromptText("Select Student");
        studentBox.setPrefWidth(250);

        ComboBox<String> typeBox = new ComboBox<>();
        typeBox.getItems().addAll("hostel_rent", "maintenance", "electricity", "water", "other");
        typeBox.setValue("hostel_rent");

        TextField amountField = new TextField();
        amountField.setPromptText("Amount");
        DatePicker dueDatePicker = new DatePicker();

        new Thread(() -> {
            try {
                JsonNode students = ApiClient.get("/students?limit=500");
                Platform.runLater(() -> {
                    JsonNode list = students.has("students") ? students.get("students") : students;
                    if (list.isArray()) {
                        for (JsonNode s : list) {
                            studentBox.getItems().add(s.get("id").asInt() + " - " + s.get("name").asText());
                        }
                    }
                });
            } catch (Exception ignored) {}
        }).start();

        int row = 0;
        grid.add(new Label("Student:"), 0, row); grid.add(studentBox, 1, row++);
        grid.add(new Label("Type:"), 0, row); grid.add(typeBox, 1, row++);
        grid.add(new Label("Amount:"), 0, row); grid.add(amountField, 1, row++);
        grid.add(new Label("Due Date:"), 0, row); grid.add(dueDatePicker, 1, row++);

        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK && studentBox.getValue() != null) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("studentId", Integer.parseInt(studentBox.getValue().split(" - ")[0]));
                body.put("feeType", typeBox.getValue());
                body.put("amount", Double.parseDouble(amountField.getText().trim()));
                if (dueDatePicker.getValue() != null) body.put("dueDate", dueDatePicker.getValue().toString());
                return body;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(body -> {
            new Thread(() -> {
                try {
                    ApiClient.post("/fees", body);
                    Platform.runLater(() -> { loadFees(); loadSummary(); });
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }

    private void payFee(int feeId, double amountDue) {
        Dialog<String> dialog = new Dialog<>();
        dialog.setTitle("Record Payment");
        ComboBox<String> methodBox = new ComboBox<>();
        methodBox.getItems().addAll("cash", "bank_transfer", "card", "online");
        methodBox.setValue("online");
        VBox content = new VBox(10, new Label("Amount Due: $" + amountDue), new Label("Payment Method:"), methodBox);
        content.setPadding(new Insets(20));
        dialog.getDialogPane().setContent(content);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        dialog.setResultConverter(btn -> btn == ButtonType.OK ? methodBox.getValue() : null);

        dialog.showAndWait().ifPresent(method -> {
            new Thread(() -> {
                try {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("paymentMethod", method);
                    body.put("amountPaid", amountDue);
                    ApiClient.post("/fees/" + feeId + "/pay", body);
                    Platform.runLater(() -> { loadFees(); loadSummary(); });
                } catch (Exception ex) {
                    Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
                }
            }).start();
        });
    }

    private void markOverdue() {
        new Thread(() -> {
            try {
                JsonNode result = ApiClient.post("/fees/mark-overdue", Map.of());
                Platform.runLater(() -> {
                    String msg = result.has("message") ? result.get("message").asText() : "Done";
                    new Alert(Alert.AlertType.INFORMATION, msg).show();
                    loadFees();
                    loadSummary();
                });
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
            }
        }).start();
    }

    private String getVal(JsonNode node, String field) {
        return node != null && node.has(field) ? node.get(field).asText("0") : "0";
    }
}
