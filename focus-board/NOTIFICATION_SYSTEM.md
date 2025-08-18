# FocusBoard Notification System

## Overview

The FocusBoard notification system provides comprehensive browser notifications for task reminders, habit tracking, and app updates. The system is designed to be user-friendly, reliable, and highly customizable.

## Features

### 🔔 Browser Notifications
- **Task Reminders**: Get notified when tasks are due soon or overdue
- **Habit Reminders**: Receive reminders to complete daily habits
- **Completion Celebrations**: Celebrate task completions with notifications
- **Recurring Task Notifications**: Get notified when new recurring tasks are created
- **Overdue Alerts**: Stay informed about overdue tasks

### ⚙️ Customization Options
- **Notification Types**: Enable/disable specific notification types
- **Sound & Vibration**: Control audio and haptic feedback
- **Permission Management**: Easy permission request and status checking
- **Test Center**: Comprehensive testing interface for all notification types

### 🛠️ Technical Features
- **Queue System**: Notifications are queued when permission is not granted
- **Auto-retry**: Automatic processing of queued notifications when permission is granted
- **Error Handling**: Robust error handling and user feedback
- **Mobile Support**: Vibration patterns for mobile devices
- **Cross-browser Compatibility**: Works across modern browsers

## How to Use

### 1. Enable Notifications
1. Navigate to **Settings > Notifications**
2. Click **"Enable Notifications"**
3. Allow notifications when prompted by your browser

### 2. Configure Notification Types
In the Settings page, you can customize:
- **Task Reminders**: Notifications for upcoming and overdue tasks
- **Habit Reminders**: Daily habit completion reminders
- **Completion Notifications**: Celebrations for completed tasks
- **Overdue Notifications**: Alerts for overdue tasks
- **Recurring Task Notifications**: Notifications for new recurring tasks

### 3. Test Notifications
1. Go to **Settings > Notifications**
2. Click **"Open Notification Test Center"**
3. Test different notification types
4. Verify that notifications appear correctly

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Safari 16+
- ✅ Edge 17+

### Mobile Support
- ✅ iOS Safari 16+
- ✅ Chrome Mobile
- ✅ Firefox Mobile
- ✅ Samsung Internet

## Troubleshooting

### Notifications Not Appearing
1. **Check Browser Settings**:
   - Click the lock/info icon in the address bar
   - Ensure "Notifications" is set to "Allow"
   - Refresh the page

2. **Check System Settings**:
   - **Windows**: Settings > System > Notifications & actions
   - **macOS**: System Preferences > Notifications & Focus
   - **iOS**: Settings > Notifications > Safari
   - **Android**: Settings > Apps > Browser > Notifications

3. **Test Notifications**:
   - Use the Notification Test Center to verify functionality
   - Check browser console for error messages

### Permission Denied
If notifications are blocked:
1. Click the lock/info icon in the address bar
2. Change "Notifications" from "Block" to "Allow"
3. Refresh the page
4. Try enabling notifications again

### Notifications Not Working on Mobile
1. Ensure the browser has notification permissions
2. Check if "Do Not Disturb" mode is enabled
3. Verify that the app is not in the background restrictions list

## Technical Implementation

### Notification Service
The notification system is built around a singleton `NotificationService` class that provides:

```typescript
// Basic notification
await notificationService.showNotification('Title', { body: 'Message' });

// Task reminder
await notificationService.showTaskReminder('Task Title', dueDate, taskId);

// Habit reminder
await notificationService.showHabitReminder('Habit Name', streak);

// Completion celebration
await notificationService.showTaskCompleted('Task Title');
```

### Settings Management
Notification preferences are stored in localStorage and include:
- Enabled/disabled status
- Notification type preferences
- Sound and vibration settings

### Reminder Processing
The system automatically:
- Checks for pending reminders every 2 minutes
- Processes reminders when the page becomes visible
- Marks reminders as sent to prevent duplicates

## API Integration

### Backend Endpoints
- `GET /tasks/reminders/pending` - Get pending reminders
- `POST /tasks/{id}/reminder/sent` - Mark reminder as sent
- `POST /tasks/{id}/reminder/configure` - Configure reminder settings

### Frontend Integration
The notification system integrates with:
- Task management system
- Habit tracking
- Recurring task processing
- Settings management

## Future Enhancements

### Planned Features
- **Push Notifications**: Server-sent notifications for offline users
- **Email Notifications**: Fallback email notifications
- **Custom Notification Sounds**: User-selectable notification sounds
- **Notification Scheduling**: Custom notification timing
- **Notification History**: View past notifications
- **Smart Notifications**: AI-powered notification timing

### Performance Optimizations
- **Service Worker**: Background notification processing
- **Notification Batching**: Group similar notifications
- **Smart Frequency**: Adaptive notification frequency based on user behavior

## Support

For issues with the notification system:
1. Check the troubleshooting section above
2. Use the Notification Test Center to diagnose problems
3. Check browser console for error messages
4. Verify browser and system notification settings

## Development

### Adding New Notification Types
1. Add new method to `NotificationService`
2. Update notification settings interface
3. Add UI controls in Settings component
4. Update documentation

### Testing
- Use the Notification Test Center for manual testing
- Test on different browsers and devices
- Verify permission handling
- Test notification queuing and processing

---

*Last updated: December 2024*
