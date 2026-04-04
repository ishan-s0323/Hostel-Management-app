package com.hostel.views;

import com.hostel.util.ApiClient;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.util.Map;

public class NotificationsView extends VBox {

    private VBox notifList;

    public NotificationsView() {
        setSpacing(15);
        setPadding(new Insets(10));

        HBox toolbar = new HBox(10);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        Button markAllBtn = new Button("Mark All as Read");
        markAllBtn.getStyleClass().add("btn-secondary");
        markAllBtn.setOnAction(e -> markAllRead());

        toolbar.getChildren().add(markAllBtn);
        getChildren().add(toolbar);

        ScrollPane scrollPane = new ScrollPane();
        scrollPane.setFitToWidth(true);
        VBox.setVgrow(scrollPane, Priority.ALWAYS);

        notifList = new VBox(8);
        notifList.setPadding(new Insets(5));
        scrollPane.setContent(notifList);

        getChildren().add(scrollPane);
        loadNotifications();
    }

    private void loadNotifications() {
        new Thread(() -> {
            try {
                JsonNode response = ApiClient.get("/notifications");
                Platform.runLater(() -> {
                    notifList.getChildren().clear();
                    JsonNode notifications = response.has("notifications") ? response.get("notifications") : response;
                    if (notifications.isArray()) {
                        if (notifications.size() == 0) {
                            notifList.getChildren().add(new Label("No notifications"));
                            return;
                        }
                        for (JsonNode n : notifications) {
                            notifList.getChildren().add(createNotifCard(n));
                        }
                    }
                });
            } catch (Exception ex) {
                Platform.runLater(() -> notifList.getChildren().add(new Label("Failed: " + ex.getMessage())));
            }
        }).start();
    }

    private HBox createNotifCard(JsonNode notif) {
        HBox card = new HBox(12);
        card.getStyleClass().add("notif-card");
        card.setPadding(new Insets(12));

        boolean isRead = notif.has("isRead") && notif.get("isRead").asInt() == 1;
        if (!isRead) {
            card.getStyleClass().add("notif-unread");
        }

        String type = notif.has("notifType") ? notif.get("notifType").asText() : "info";
        Label icon = new Label(getTypeIcon(type));
        icon.setFont(Font.font("System", FontWeight.BOLD, 18));
        icon.getStyleClass().add("notif-icon-" + type);

        VBox textBox = new VBox(4);
        HBox.setHgrow(textBox, Priority.ALWAYS);

        Label title = new Label(notif.has("title") ? notif.get("title").asText() : "");
        title.setFont(Font.font("System", FontWeight.BOLD, 14));

        Label message = new Label(notif.has("message") ? notif.get("message").asText() : "");
        message.setWrapText(true);
        message.getStyleClass().add("notif-message");

        Label time = new Label(notif.has("createdAt") ? notif.get("createdAt").asText() : "");
        time.getStyleClass().add("notif-time");

        textBox.getChildren().addAll(title, message, time);

        card.getChildren().addAll(icon, textBox);

        if (!isRead) {
            card.setOnMouseClicked(e -> markRead(notif.get("id").asInt(), card));
            card.setStyle("-fx-cursor: hand;");
        }

        return card;
    }

    private void markRead(int id, HBox card) {
        new Thread(() -> {
            try {
                ApiClient.put("/notifications/" + id + "/read", Map.of());
                Platform.runLater(() -> {
                    card.getStyleClass().remove("notif-unread");
                    card.setOnMouseClicked(null);
                });
            } catch (Exception ignored) {}
        }).start();
    }

    private void markAllRead() {
        new Thread(() -> {
            try {
                ApiClient.put("/notifications/mark-all-read", Map.of());
                Platform.runLater(() -> loadNotifications());
            } catch (Exception ex) {
                Platform.runLater(() -> new Alert(Alert.AlertType.ERROR, ex.getMessage()).show());
            }
        }).start();
    }

    private String getTypeIcon(String type) {
        return switch (type) {
            case "fee" -> "$";
            case "complaint" -> "!";
            case "allocation" -> "A";
            case "system" -> "S";
            default -> "i";
        };
    }
}
