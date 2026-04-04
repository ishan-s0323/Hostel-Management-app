package com.hostel.views;

import com.hostel.App;
import com.hostel.util.ApiClient;
import com.hostel.util.SessionManager;
import com.fasterxml.jackson.databind.JsonNode;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.util.Timer;
import java.util.TimerTask;

public class MainLayout extends BorderPane {

    private final StackPane contentArea;
    private final ScrollPane sidebar;
    private Label pageTitleLabel;
    private Label notifBadge;
    private Button activeButton;
    private Timer pollingTimer;

    public MainLayout() {
        getStyleClass().add("main-layout");

        sidebar = createSidebar();
        contentArea = new StackPane();
        contentArea.getStyleClass().add("content-area");
        contentArea.setPadding(new Insets(20));

        HBox topbar = createTopbar();

        BorderPane rightSide = new BorderPane();
        rightSide.setTop(topbar);
        rightSide.setCenter(contentArea);

        setLeft(sidebar);
        setCenter(rightSide);

        navigateTo("Dashboard", new DashboardView());

        startNotificationPolling();
    }

    private ScrollPane createSidebar() {
        VBox sb = new VBox(5);
        sb.getStyleClass().add("sidebar-content");
        sb.setPrefWidth(240);
        sb.setPadding(new Insets(20, 10, 20, 10));

        Label brand = new Label("Smart Hostel");
        brand.setFont(Font.font("System", FontWeight.BOLD, 20));
        brand.getStyleClass().add("sidebar-brand");
        brand.setPadding(new Insets(0, 0, 20, 10));

        notifBadge = new Label("0");
        notifBadge.getStyleClass().add("notif-badge");
        notifBadge.setVisible(false);

        sb.getChildren().add(brand);

        addNavButton(sb, "Dashboard", () -> navigateTo("Dashboard", new DashboardView()));
        addNavButton(sb, "Rooms", () -> navigateTo("Rooms", new RoomsView()));
        addNavButton(sb, "Fees", () -> navigateTo("Fees", new FeesView()));
        addNavButton(sb, "Complaints", () -> navigateTo("Complaints", new ComplaintsView()));
        addNavButton(sb, "Laundry", () -> navigateTo("Laundry", new LaundryView()));
        addNavButton(sb, "Feedback", () -> navigateTo("Feedback", new FeedbackView()));
        addNavButton(sb, "Roommates", () -> navigateTo("Roommates", new RoommatesView()));

        HBox notifRow = new HBox(8);
        notifRow.setAlignment(Pos.CENTER_LEFT);
        Button notifBtn = createNavBtn("Notifications");
        notifBtn.setOnAction(e -> {
            setActive(notifBtn);
            navigateTo("Notifications", new NotificationsView());
        });
        notifRow.getChildren().addAll(notifBtn, notifBadge);
        sb.getChildren().add(notifRow);

        if (SessionManager.isAdmin()) {
            Separator sep = new Separator();
            sep.setPadding(new Insets(10, 0, 10, 0));
            sb.getChildren().add(sep);

            Label adminLabel = new Label("ADMIN");
            adminLabel.getStyleClass().add("sidebar-section-label");
            adminLabel.setPadding(new Insets(0, 0, 5, 10));
            sb.getChildren().add(adminLabel);

            addNavButton(sb, "Students", () -> navigateTo("Students", new StudentsView()));
            addNavButton(sb, "Allocations", () -> navigateTo("Allocations", new AllocationsView()));
            addNavButton(sb, "Staff", () -> navigateTo("Staff", new StaffView()));
            addNavButton(sb, "Blocks", () -> navigateTo("Blocks", new BlocksView()));
            addNavButton(sb, "Inquiries", () -> navigateTo("Inquiries", new InquiriesView()));
            addNavButton(sb, "Biometric", () -> navigateTo("Biometric", new BiometricView()));
            addNavButton(sb, "Parcels", () -> navigateTo("Parcels", new ParcelsView()));
            addNavButton(sb, "Visitors", () -> navigateTo("Visitors", new VisitorsView()));
            addNavButton(sb, "Lost & Found", () -> navigateTo("Lost & Found", new LostFoundView()));
            addNavButton(sb, "Housekeeping", () -> navigateTo("Housekeeping", new HousekeepingView()));
            addNavButton(sb, "Room Requests", () -> navigateTo("Room Requests", new RoomRequestsView()));
            addNavButton(sb, "Audit Logs", () -> navigateTo("Audit Logs", new AuditLogsView()));
            addNavButton(sb, "Reports", () -> navigateTo("Reports", new ReportsView()));
        }

        Region spacer = new Region();
        VBox.setVgrow(spacer, Priority.ALWAYS);
        sb.getChildren().add(spacer);

        Button logoutBtn = new Button("Logout");
        logoutBtn.getStyleClass().addAll("nav-button", "logout-btn");
        logoutBtn.setMaxWidth(Double.MAX_VALUE);
        logoutBtn.setOnAction(e -> {
            stopPolling();
            SessionManager.clear();
            App.showLogin();
        });
        sb.getChildren().add(logoutBtn);

        ScrollPane sp = new ScrollPane(sb);
        sp.setFitToWidth(true);
        sp.getStyleClass().add("sidebar");
        return sp;
    }

    private Button createNavBtn(String text) {
        Button btn = new Button(text);
        btn.getStyleClass().add("nav-button");
        btn.setMaxWidth(Double.MAX_VALUE);
        return btn;
    }

    private void addNavButton(VBox container, String text, Runnable action) {
        Button btn = createNavBtn(text);
        btn.setOnAction(e -> {
            setActive(btn);
            action.run();
        });
        container.getChildren().add(btn);
    }

    private void setActive(Button btn) {
        if (activeButton != null) {
            activeButton.getStyleClass().remove("nav-active");
        }
        activeButton = btn;
        btn.getStyleClass().add("nav-active");
    }

    private HBox createTopbar() {
        HBox topbar = new HBox();
        topbar.getStyleClass().add("topbar");
        topbar.setPadding(new Insets(12, 20, 12, 20));
        topbar.setAlignment(Pos.CENTER_LEFT);

        pageTitleLabel = new Label("Dashboard");
        pageTitleLabel.setFont(Font.font("System", FontWeight.BOLD, 18));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button refreshBtn = new Button("↻ Refresh");
        refreshBtn.getStyleClass().addAll("btn-small", "btn-secondary");
        refreshBtn.setOnAction(e -> {
            if (activeButton != null) {
                activeButton.fire(); // Re-trigger the active button's logic to completely reload the current view
            }
        });

        Label userLabel = new Label(SessionManager.getUserName() + " (" + SessionManager.getUserRole() + ")");
        userLabel.getStyleClass().add("user-label");

        topbar.getChildren().addAll(pageTitleLabel, spacer, refreshBtn, userLabel);
        return topbar;
    }

    public void navigateTo(String title, Node view) {
        pageTitleLabel.setText(title);
        contentArea.getChildren().clear();
        contentArea.getChildren().add(view);
    }

    private void startNotificationPolling() {
        pollingTimer = new Timer(true);
        pollingTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                try {
                    JsonNode response = ApiClient.get("/notifications/unread-count");
                    int count = response.has("count") ? response.get("count").asInt() : 0;
                    Platform.runLater(() -> {
                        notifBadge.setText(String.valueOf(count));
                        notifBadge.setVisible(count > 0);
                    });
                } catch (Exception ignored) {}
            }
        }, 0, 30000);
    }

    private void stopPolling() {
        if (pollingTimer != null) {
            pollingTimer.cancel();
        }
    }
}
