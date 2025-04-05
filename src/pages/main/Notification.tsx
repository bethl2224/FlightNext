import React, { useEffect, useState } from "react";
import { searchAllMessage, deleteMessage } from "@utils/hotel-query";

interface Notification {
  id: string;
  content: string;
}

interface NotificationModalProps {
  id: string;
  queueType: string; // Add the missing queueType property
  role: string; // Add the missing role property
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  id,
  queueType,
  role,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const messages = await searchAllMessage(id, queueType, role);
        console.log("hasNewMessage", hasNewMessage);
        setNotifications(messages);
        if (messages && messages.length > 0) {
          setHasNewMessage(true);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [id, queueType, role, hasNewMessage]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };
  return (
    <div className="relative">
      <button
        onClick={handleOpenModal}
        className="relative flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
      >
        View Notifications
        {notifications && notifications.length > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative bg-white rounded-lg shadow-1xl w-full max-w-4xl max-h-4xl p-10">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
              onClick={handleCloseModal}
            >
              <span className="sr-only">Close</span>
              &times;
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Notifications
            </h2>
            {notifications && notifications.length > 0 ? (
              <ul className="space-y-4 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm hover:bg-gray-100"
                  >
                    <span className="text-gray-800">
                      {notification.content}
                    </span>
                    <button
                      className="text-red-500 hover:text-red-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                      onClick={() => handleDelete(notification.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">
                No notifications available.
              </p>
            )}
            <button
              className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationModal;
