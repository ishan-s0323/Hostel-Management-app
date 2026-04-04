package com.hostel;

import com.hostel.views.LoginView;
import com.hostel.views.MainLayout;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class App extends Application {

    private static Stage primaryStage;
    private static Scene scene;

    @Override
    public void start(Stage stage) {
        primaryStage = stage;
        primaryStage.setTitle("Smart Hostel Management System");
        primaryStage.setMinWidth(1100);
        primaryStage.setMinHeight(700);

        showLogin();

        primaryStage.show();
    }

    public static void showLogin() {
        LoginView loginView = new LoginView();
        scene = new Scene(loginView, 1100, 700);
        scene.getStylesheets().add(App.class.getResource("/com/hostel/styles/style.css").toExternalForm());
        primaryStage.setScene(scene);
    }

    public static void showMainApp() {
        MainLayout mainLayout = new MainLayout();
        scene = new Scene(mainLayout, 1200, 800);
        scene.getStylesheets().add(App.class.getResource("/com/hostel/styles/style.css").toExternalForm());
        primaryStage.setScene(scene);
        primaryStage.setMaximized(true);
    }

    public static Stage getPrimaryStage() {
        return primaryStage;
    }

    public static void main(String[] args) {
        launch(args);
    }
}
