
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users } from "@/utils/mockData";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";

// Mock notification data (would come from API in real app)
const notifications = [
  {
    id: "1",
    type: "like",
    userId: "user-2",
    postId: "post-1",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "2",
    type: "comment",
    userId: "user-3",
    postId: "post-2",
    text: "Great post!",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    type: "follow",
    userId: "user-4",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "4",
    type: "mention",
    userId: "user-5",
    postId: "post-3",
    text: "Check this out @user",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

const NotificationsPage = () => {
  const [activeNotifications, setActiveNotifications] = useState(notifications);
  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications = activeTab === "all" 
    ? activeNotifications 
    : activeTab === "mentions" 
      ? activeNotifications.filter(notification => notification.type === "mention")
      : activeNotifications.filter(notification => notification.type !== "mention");

  const markAllAsRead = () => {
    setActiveNotifications(activeNotifications.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationText = (notification) => {
    const user = users.find(u => u.id === notification.userId);
    if (!user) return "Unknown action";

    switch (notification.type) {
      case "like":
        return `${user.fullName} liked your post`;
      case "comment":
        return `${user.fullName} commented on your post: "${notification.text}"`;
      case "follow":
        return `${user.fullName} started following you`;
      case "mention":
        return `${user.fullName} mentioned you in a post`;
      default:
        return "New notification";
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-3xl mx-auto px-4 py-4">
        <div className="sticky top-0 bg-background z-10 pb-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="mentions" className="flex-1">Mentions</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4 space-y-3">
          <TabsContent value={activeTab} className="space-y-3 mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const user = users.find(u => u.id === notification.userId);
                return (
                  <Card 
                    key={notification.id}
                    className={`overflow-hidden ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Link to={`/profile/${user?.username}`}>
                          <Avatar>
                            <AvatarImage src={user?.avatar} alt={user?.fullName} />
                            <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{getNotificationText(notification)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                          </p>
                        </div>
                        {notification.type === "follow" && (
                          <Button size="sm" variant="outline">
                            Follow
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
