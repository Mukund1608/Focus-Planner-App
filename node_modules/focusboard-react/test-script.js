
// Test script for FocusBoard - Run this in browser console
console.log('Starting FocusBoard tests...');

// Test 1: Check notification support
console.log('Notification support:', 'Notification' in window);
console.log('Notification permission:', Notification.permission);

// Test 2: Check if notification service is available
if (typeof window.notificationService !== 'undefined') {
    console.log('Notification service available');
    console.log('Status:', window.notificationService.getStatus());
} else {
    console.log('Notification service not available');
}

// Test 3: Test API connectivity
fetch('http://localhost:5000/health')
    .then(response => response.json())
    .then(data => {
        console.log('Backend API is running:', data);
    })
    .catch(error => {
        console.error('Backend API error:', error);
    });

// Test 4: Test SuperTokens session
fetch('http://localhost:5000/sessioninfo', {
    credentials: 'include'
})
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Not authenticated');
        }
    })
    .then(data => {
        console.log('User is authenticated:', data);
    })
    .catch(error => {
        console.log('User not authenticated:', error.message);
    });

console.log('Tests completed!');
