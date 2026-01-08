const amqp = require('amqplib');

// RabbitMQ Configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const NOTIFICATION_QUEUE = 'farm.notifications';
const NOTIFICATION_EXCHANGE = 'notifications.exchange';

// In-memory notification storage
const notifications = [];
const MAX_NOTIFICATIONS = 100;

// Connected SSE clients
const sseClients = new Set();

// RabbitMQ connection
let channel = null;
let connection = null;

/**
 * Initialize RabbitMQ connection and consume messages
 */
async function initializeRabbitMQ() {
    try {
        console.log('Connecting to RabbitMQ at:', RABBITMQ_URL);
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        
        // Declare exchange and queue
        await channel.assertExchange(NOTIFICATION_EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
        
        // Bind queue to exchange with routing patterns
        await channel.bindQueue(NOTIFICATION_QUEUE, NOTIFICATION_EXCHANGE, 'farm.#');
        await channel.bindQueue(NOTIFICATION_QUEUE, NOTIFICATION_EXCHANGE, 'order.#');
        await channel.bindQueue(NOTIFICATION_QUEUE, NOTIFICATION_EXCHANGE, 'shipping.#');
        
        console.log(`✓ RabbitMQ connected. Listening on queue: ${NOTIFICATION_QUEUE}`);
        
        // Start consuming messages
        channel.consume(NOTIFICATION_QUEUE, (msg) => {
            if (msg) {
                try {
                    const notification = JSON.parse(msg.content.toString());
                    handleNotification(notification);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing notification:', error);
                    channel.nack(msg, false, false); // Don't requeue
                }
            }
        });

        // Handle connection errors
        connection.on('error', (err) => {
            console.error('RabbitMQ connection error:', err);
        });

        connection.on('close', () => {
            console.log('RabbitMQ connection closed. Reconnecting in 5s...');
            setTimeout(initializeRabbitMQ, 5000);
        });

    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error.message);
        console.log('Retrying in 5 seconds...');
        setTimeout(initializeRabbitMQ, 5000);
    }
}

/**
 * Handle incoming notification from RabbitMQ
 */
function handleNotification(notification) {
    // Add timestamp if not present
    if (!notification.timestamp) {
        notification.timestamp = new Date().toISOString();
    }
    
    // Add ID if not present
    if (!notification.id) {
        notification.id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    console.log('📬 New notification:', notification);
    
    // Store notification
    notifications.unshift(notification);
    
    // Keep only recent notifications
    if (notifications.length > MAX_NOTIFICATIONS) {
        notifications.pop();
    }
    
    // Broadcast to all connected SSE clients
    broadcastToClients(notification);
}

/**
 * Broadcast notification to all SSE clients
 */
function broadcastToClients(notification) {
    sseClients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(notification)}\n\n`);
        } catch (error) {
            console.error('Error sending to SSE client:', error);
            sseClients.delete(client);
        }
    });
}

/**
 * SSE endpoint handler - establishes connection for real-time notifications
 */
exports.streamNotifications = (req, res) => {
    // Set headers for SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
    });

    // Send initial connection success message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

    // Send recent notifications to new client
    const recentNotifications = notifications.slice(0, 10);
    recentNotifications.reverse().forEach(notification => {
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });

    // Add client to set
    sseClients.add(res);
    console.log(`New SSE client connected. Total clients: ${sseClients.size}`);

    // Remove client on disconnect
    req.on('close', () => {
        sseClients.delete(res);
        console.log(`SSE client disconnected. Total clients: ${sseClients.size}`);
    });
};

/**
 * Get all notifications (REST endpoint)
 */
exports.getAllNotifications = (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({
        success: true,
        total: notifications.length,
        notifications: notifications.slice(0, limit)
    });
};

/**
 * Mark notification as read
 */
exports.markAsRead = (req, res) => {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
        notification.read = true;
        res.json({ success: true, message: 'Notification marked as read' });
    } else {
        res.status(404).json({ success: false, message: 'Notification not found' });
    }
};

/**
 * Delete notification
 */
exports.deleteNotification = (req, res) => {
    const { id } = req.params;
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
        notifications.splice(index, 1);
        res.json({ success: true, message: 'Notification deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Notification not found' });
    }
};

/**
 * Clear all notifications
 */
exports.clearAllNotifications = (req, res) => {
    notifications.length = 0;
    res.json({ success: true, message: 'All notifications cleared' });
};

/**
 * Render notifications page
 */
exports.getNotificationsPage = (req, res) => {
    res.render('notifications', {
        user: req.user || {},
        notifications: notifications.slice(0, 20)
    });
};

/**
 * Send test notification (for debugging)
 */
exports.sendTestNotification = async (req, res) => {
    if (!channel) {
        return res.status(503).json({ success: false, message: 'RabbitMQ not connected' });
    }

    const testNotification = {
        type: req.body.type || 'info',
        title: req.body.title || 'Test Notification',
        message: req.body.message || 'This is a test notification from the system',
        from: req.body.from || 'System',
        timestamp: new Date().toISOString()
    };

    try {
        channel.publish(
            NOTIFICATION_EXCHANGE,
            'farm.test',
            Buffer.from(JSON.stringify(testNotification)),
            { persistent: true }
        );
        res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Initialize RabbitMQ connection on module load
initializeRabbitMQ();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing RabbitMQ connection...');
    if (channel) await channel.close();
    if (connection) await connection.close();
    process.exit(0);
});
