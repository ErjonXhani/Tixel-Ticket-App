
/**
 * Helper functions for PHP backend integration
 */

// Generates MySQL database connection code for PHP
export const generateDbConnection = () => {
  return `<?php
// Database configuration
$host = "localhost";
$dbname = "tixel";
$username = "root";
$password = ""; // Default XAMPP password is empty

// Create database connection
$conn = new mysqli($host, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) !== TRUE) {
    die("Error creating database: " . $conn->error);
}

// Select the database
$conn->select_db($dbname);

// Function to initialize tables if they don't exist
function initializeTables($conn) {
    // Users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating users table: " . $conn->error);
    }
    
    // Events table
    $sql = "CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        end_time TIME,
        image_url VARCHAR(255),
        category VARCHAR(50) NOT NULL,
        organizer VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        capacity INT NOT NULL,
        status ENUM('Draft', 'Published') DEFAULT 'Draft',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating events table: " . $conn->error);
    }
    
    // Tickets table
    $sql = "CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        ticket_type VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";
    
    if ($conn->query($sql) !== TRUE) {
        die("Error creating tickets table: " . $conn->error);
    }
    
    // Create admin user if none exists
    $sql = "SELECT * FROM users WHERE role = 'admin' LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result->num_rows == 0) {
        $adminName = "Admin User";
        $adminEmail = "admin@example.com";
        $adminPassword = password_hash("password", PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $adminName, $adminEmail, $adminPassword);
        $stmt->execute();
    }
}

// Initialize tables
initializeTables($conn);
?>`;
};

// Generates PHP API endpoint for events
export const generateEventsApi = () => {
  return `<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        // Get event by ID or list all events
        if (isset($_GET['id'])) {
            getEvent($conn, $_GET['id']);
        } else {
            getAllEvents($conn);
        }
        break;
        
    case 'POST':
        // Create new event
        createEvent($conn);
        break;
        
    case 'PUT':
        // Update existing event
        updateEvent($conn);
        break;
        
    case 'DELETE':
        // Delete event
        deleteEvent($conn);
        break;
        
    default:
        // Method not allowed
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}

// Function to get all events
function getAllEvents($conn) {
    $sql = "SELECT * FROM events ORDER BY date DESC";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $events = [];
        
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }
        
        echo json_encode($events);
    } else {
        echo json_encode([]);
    }
}

// Function to get a specific event
function getEvent($conn, $id) {
    $sql = "SELECT * FROM events WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $event = $result->fetch_assoc();
        echo json_encode($event);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Event not found']);
    }
}

// Function to create new event
function createEvent($conn) {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    if (!isset($data['title']) || !isset($data['date']) || !isset($data['category'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing required fields']);
        return;
    }
    
    // Insert event into database
    $sql = "INSERT INTO events (title, description, location, venue, date, time, end_time, image_url, category, organizer, price, capacity, status, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
    $stmt = $conn->prepare($sql);
    $status = $data['status'] ?? 'Draft';
    $createdBy = $data['created_by'] ?? 1; // Default to admin user
    
    $stmt->bind_param("ssssssssssdiis", 
        $data['title'],
        $data['description'],
        $data['location'],
        $data['venue'],
        $data['date'],
        $data['time'],
        $data['endTime'],
        $data['imageUrl'],
        $data['category'],
        $data['organizer'],
        $data['price'],
        $data['capacity'],
        $status,
        $createdBy
    );
    
    if ($stmt->execute()) {
        $id = $conn->insert_id;
        http_response_code(201);
        echo json_encode([
            'message' => 'Event created successfully',
            'id' => $id
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'message' => 'Failed to create event',
            'error' => $stmt->error
        ]);
    }
}

// Function to update event
function updateEvent($conn) {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if ID exists
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Event ID is required']);
        return;
    }
    
    // Update event in database
    $sql = "UPDATE events SET 
            title = ?, 
            description = ?, 
            location = ?, 
            venue = ?, 
            date = ?, 
            time = ?, 
            end_time = ?, 
            image_url = ?, 
            category = ?, 
            organizer = ?, 
            price = ?, 
            capacity = ?, 
            status = ? 
            WHERE id = ?";
            
    $stmt = $conn->prepare($sql);
    $status = $data['status'] ?? 'Draft';
    
    $stmt->bind_param("ssssssssssddsi", 
        $data['title'],
        $data['description'],
        $data['location'],
        $data['venue'],
        $data['date'],
        $data['time'],
        $data['endTime'],
        $data['imageUrl'],
        $data['category'],
        $data['organizer'],
        $data['price'],
        $data['capacity'],
        $status,
        $data['id']
    );
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['message' => 'Event updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Event not found or no changes made']);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'message' => 'Failed to update event',
            'error' => $stmt->error
        ]);
    }
}

// Function to delete event
function deleteEvent($conn) {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if ID exists
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Event ID is required']);
        return;
    }
    
    // Delete event from database
    $sql = "DELETE FROM events WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['id']);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['message' => 'Event deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Event not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'message' => 'Failed to delete event',
            'error' => $stmt->error
        ]);
    }
}
?>`;
};

// Generates PHP API endpoint for authentication
export const generateAuthApi = () => {
  return `<?php
// Login and signup endpoints

// Include database connection
require_once 'db_connection.php';

// Set headers for JSON API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Get request path
$request_uri = $_SERVER['REQUEST_URI'];
$endpoint = basename($request_uri);

if ($endpoint === 'login.php') {
    // Handle login
    login($conn);
} else if ($endpoint === 'signup.php') {
    // Handle signup
    signup($conn);
} else {
    // Invalid endpoint
    http_response_code(404);
    echo json_encode(['message' => 'Endpoint not found']);
}

// Function to handle login
function login($conn) {
    // Only allow POST method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        return;
    }
    
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Email and password are required']);
        return;
    }
    
    // Find user by email
    $sql = "SELECT id, name, email, password, role FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($data['password'], $user['password'])) {
            // Create response without password
            unset($user['password']);
            
            // TODO: In a production app, generate proper JWT token here
            $user['token'] = bin2hex(random_bytes(32));
            
            http_response_code(200);
            echo json_encode([
                'message' => 'Login successful',
                'user' => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid email or password']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid email or password']);
    }
}

// Function to handle signup
function signup($conn) {
    // Only allow POST method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        return;
    }
    
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Name, email, and password are required']);
        return;
    }
    
    // Check if email already exists
    $sql = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['message' => 'Email already in use']);
        return;
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert user into database
    $sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $data['name'], $data['email'], $hashedPassword);
    
    if ($stmt->execute()) {
        $id = $conn->insert_id;
        
        // Create response
        $user = [
            'id' => $id,
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => 'user',
            // TODO: In a production app, generate proper JWT token here
            'token' => bin2hex(random_bytes(32))
        ];
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Account created successfully',
            'user' => $user
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'message' => 'Failed to create account',
            'error' => $stmt->error
        ]);
    }
}
?>`;
};

// Generates PHP API endpoint for ticket purchases
export const generateTicketsApi = () => {
  return `<?php
// Ticket purchase and management API

// Include database connection
require_once 'db_connection.php';

// Set headers for JSON API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        // Get user tickets
        if (isset($_GET['user'])) {
            getUserTickets($conn);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid request']);
        }
        break;
        
    case 'POST':
        // Purchase tickets
        purchaseTickets($conn);
        break;
        
    default:
        // Method not allowed
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}

// Function to purchase tickets
function purchaseTickets($conn) {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    if (!isset($data['eventId']) || !isset($data['quantity']) || !isset($data['ticketType'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing required fields']);
        return;
    }
    
    // Extract Authorization header for user ID (in real app, validate JWT)
    // For now, just use user ID 1 (default admin) or get from request if provided
    $userId = $data['userId'] ?? 1;
    
    // Check if event exists
    $sql = "SELECT price FROM events WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['eventId']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['message' => 'Event not found']);
        return;
    }
    
    // Get event price
    $eventPrice = $result->fetch_assoc()['price'];
    
    // Calculate total price
    // In a real app, you would look up the ticket type price
    $ticketPrice = $data['ticketType'] === 'vip' ? $eventPrice * 2 : $eventPrice;
    $totalPrice = $ticketPrice * $data['quantity'];
    
    // Insert ticket purchase into database
    $sql = "INSERT INTO tickets (event_id, user_id, ticket_type, quantity, total_price) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iisid", $data['eventId'], $userId, $data['ticketType'], $data['quantity'], $totalPrice);
    
    if ($stmt->execute()) {
        $ticketId = $conn->insert_id;
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Tickets purchased successfully',
            'ticketId' => $ticketId,
            'totalPrice' => $totalPrice
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'message' => 'Failed to purchase tickets',
            'error' => $stmt->error
        ]);
    }
}

// Function to get user tickets
function getUserTickets($conn) {
    // Extract Authorization header for user ID (in real app, validate JWT)
    // For now, just use user ID 1 (default admin) or get from request if provided
    $userId = $_GET['userId'] ?? 1;
    
    $sql = "SELECT t.*, e.title, e.date, e.location, e.image_url 
            FROM tickets t 
            JOIN events e ON t.event_id = e.id 
            WHERE t.user_id = ? 
            ORDER BY t.created_at DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $tickets = [];
        
        while ($row = $result->fetch_assoc()) {
            $tickets[] = $row;
        }
        
        echo json_encode($tickets);
    } else {
        echo json_encode([]);
    }
}
?>`;
};
