// components/NotificationContainer.jsx
import { useState, useEffect } from "react";
import Notification from "./Notification";

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  // Simulate receiving notifications (you would replace this with your actual data source)
  useEffect(() => {
    // Example: Fetch notifications from API or context
    const exampleNotifications = [
      {
        _id: "1",
        title: "System Maintenance",
        message: "Scheduled maintenance in 30 minutes",
        description:
          "The system will be unavailable for approximately 15 minutes",
        position: "STICKY_TOP",
        duration: { type: "FIXED", timer: 8000 },
        type: "SYSTEM_ALERT",
        priority: "HIGH",
        action: { type: "NONE" },
        createdAt: new Date(),
      },
      {
        _id: "2",
        title: "New Hackathon Announcement",
        message: "Cyber Security Challenge 2024 is now open!",
        description: "Register your team before the deadline",
        position: "SIDE_BOTTOM_RIGHT",
        duration: { type: "FIXED", timer: 10000 },
        type: "HACKATHON",
        priority: "MEDIUM",
        action: {
          type: "REDIRECT",
          url: "/hackathons/cyber-security-2024",
        },
        createdAt: new Date(),
      },
    ];

    setNotifications(exampleNotifications);
  }, []);

  const handleCloseNotification = (notification) => {
    setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
  };

  const handleNotificationAction = (notification) => {
    console.log("Notification action triggered:", notification);
    // Handle the action - you might want to keep the notification visible
    // or handle it differently based on your needs
  };

  const addNotification = (newNotification) => {
    setNotifications((prev) => [
      ...prev,
      { ...newNotification, _id: Date.now().toString() },
    ]);
  };

  // Group notifications by position
  const stickyTopNotifications = notifications.filter(
    (n) => n.position === "STICKY_TOP"
  );
  const wholePageNotifications = notifications.filter(
    (n) => n.position === "WHOLE_PAGE"
  );
  const sideBottomRightNotifications = notifications.filter(
    (n) => n.position === "SIDE_BOTTOM_RIGHT"
  );

  return (
    <>
      {/* Sticky Top Notifications */}
      {stickyTopNotifications.map((notification) => (
        <Notification
          key={notification._id}
          notification={notification}
          onClose={handleCloseNotification}
          onAction={handleNotificationAction}
        />
      ))}

      {/* Whole Page Notifications (Modal-style) */}
      {wholePageNotifications.map((notification) => (
        <Notification
          key={notification._id}
          notification={notification}
          onClose={handleCloseNotification}
          onAction={handleNotificationAction}
        />
      ))}

      {/* Side Bottom Right Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {sideBottomRightNotifications.map((notification) => (
          <Notification
            key={notification._id}
            notification={notification}
            onClose={handleCloseNotification}
            onAction={handleNotificationAction}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationContainer;
