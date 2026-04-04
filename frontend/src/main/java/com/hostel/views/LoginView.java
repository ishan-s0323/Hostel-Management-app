package com.hostel.views;

import com.hostel.App;
import com.hostel.util.ApiClient;
import com.hostel.util.SessionManager;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.util.LinkedHashMap;
import java.util.Map;

public class LoginView extends StackPane {

    public LoginView() {
        getStyleClass().add("login-background");

        VBox card = new VBox(20);
        card.getStyleClass().add("login-card");
        card.setMaxWidth(420);
        card.setMaxHeight(520);
        card.setPadding(new Insets(40));
        card.setAlignment(Pos.CENTER);

        Label title = new Label("Smart Hostel");
        title.setFont(Font.font("System", FontWeight.BOLD, 28));
        title.getStyleClass().add("login-title");

        Label subtitle = new Label("Management System");
        subtitle.getStyleClass().add("login-subtitle");

        ComboBox<String> userTypeBox = new ComboBox<>();
        userTypeBox.getItems().addAll("Super Admin", "Admin", "Warden", "Student");
        userTypeBox.setValue("Super Admin");
        userTypeBox.setMaxWidth(Double.MAX_VALUE);
        userTypeBox.getStyleClass().add("login-input");

        TextField emailField = new TextField();
        emailField.setPromptText("Email address");
        emailField.getStyleClass().add("login-input");
        emailField.setMaxWidth(Double.MAX_VALUE);

        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Password");
        passwordField.getStyleClass().add("login-input");
        passwordField.setMaxWidth(Double.MAX_VALUE);

        Button loginBtn = new Button("Sign In");
        loginBtn.getStyleClass().add("btn-primary");
        loginBtn.setMaxWidth(Double.MAX_VALUE);

        Label errorLabel = new Label();
        errorLabel.getStyleClass().add("error-label");
        errorLabel.setWrapText(true);
        errorLabel.setVisible(false);

        Label statusLabel = new Label();
        statusLabel.getStyleClass().add("status-label");
        statusLabel.setVisible(false);

        loginBtn.setOnAction(e -> {
            String email = emailField.getText().trim();
            String password = passwordField.getText().trim();
            String userType = userTypeBox.getValue().toLowerCase().replace(" ", "");

            if (email.isEmpty() || password.isEmpty()) {
                errorLabel.setText("Please fill in all fields");
                errorLabel.setVisible(true);
                return;
            }

            loginBtn.setDisable(true);
            loginBtn.setText("Signing in...");
            errorLabel.setVisible(false);

            new Thread(() -> {
                try {
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("email", email);
                    body.put("password", password);
                    body.put("userType", userType);

                    JsonNode response = ApiClient.post("/auth/login", body);
                    String token = response.get("token").asText();
                    JsonNode user = response.get("user");

                    SessionManager.setToken(token);
                    SessionManager.setCurrentUser(user);

                    javafx.application.Platform.runLater(() -> App.showMainApp());

                } catch (Exception ex) {
                    javafx.application.Platform.runLater(() -> {
                        errorLabel.setText(ex.getMessage());
                        errorLabel.setVisible(true);
                        loginBtn.setDisable(false);
                        loginBtn.setText("Sign In");
                    });
                }
            }).start();
        });

        passwordField.setOnAction(e -> loginBtn.fire());

        VBox credsBox = new VBox(8);
        credsBox.setAlignment(Pos.CENTER);
        credsBox.setPadding(new Insets(15, 0, 0, 0));
        
        Label credsTitle = new Label("Default Login Credentials (Click row to fill)");
        credsTitle.setStyle("-fx-font-weight: bold; -fx-text-fill: #555;");
        
        GridPane credsGrid = new GridPane();
        credsGrid.setHgap(15);
        credsGrid.setVgap(8);
        credsGrid.setAlignment(Pos.CENTER);
        
        Label h1 = new Label("Role"); h1.setStyle("-fx-font-weight: bold;");
        Label h2 = new Label("Email"); h2.setStyle("-fx-font-weight: bold;");
        Label h3 = new Label("Password"); h3.setStyle("-fx-font-weight: bold;");
        credsGrid.addRow(0, h1, h2, h3);
        
        addCredRow(credsGrid, 1, "Super Admin", "superadmin@hostel.edu", "password123", emailField, passwordField, userTypeBox);
        addCredRow(credsGrid, 2, "Admin", "admin@hostel.edu", "password123", emailField, passwordField, userTypeBox);
        addCredRow(credsGrid, 3, "Warden", "rajesh@hostel.edu", "password123", emailField, passwordField, userTypeBox);
        addCredRow(credsGrid, 4, "Student", "amit@student.edu", "password123", emailField, passwordField, userTypeBox);
        
        credsBox.getChildren().addAll(credsTitle, credsGrid);

        card.getChildren().addAll(title, subtitle, userTypeBox, emailField, passwordField, errorLabel, loginBtn, credsBox);

        card.setMaxHeight(600);
        setAlignment(Pos.CENTER);
        getChildren().add(card);
    }

    private void addCredRow(GridPane grid, int row, String role, String email, String pass, TextField emailField, PasswordField passField, ComboBox<String> roleBox) {
        Label l1 = new Label(role);
        Label l2 = new Label(email);
        Label l3 = new Label(pass);
        
        String style = "-fx-text-fill: #1976D2; -fx-cursor: hand;";
        l1.setStyle(style);
        l2.setStyle(style);
        l3.setStyle(style);
        
        grid.addRow(row, l1, l2, l3);
        
        javafx.event.EventHandler<javafx.scene.input.MouseEvent> fillForm = e -> {
            roleBox.setValue(role);
            emailField.setText(email);
            passField.setText(pass);
        };
        
        l1.setOnMouseClicked(fillForm);
        l2.setOnMouseClicked(fillForm);
        l3.setOnMouseClicked(fillForm);
    }
}
