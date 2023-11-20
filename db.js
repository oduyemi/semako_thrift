const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "semakodb"
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL Database", err);
    } else {
        console.log("Connected to MySQL Database");
    }
});


// Table creation
const createMemberTable = `
    CREATE TABLE IF NOT EXISTS Member (
        MemberID INT NOT NULL AUTO_INCREMENT,
        Fname VARCHAR(80),
        Lname VARCHAR(80),
        Phone VARCHAR(50) UNIQUE,
        Address TEXT,
        AccountBalance DECIMAL,
        
        PRIMARY KEY (MemberID)
    );
`;

const createSchemeTable = `
    CREATE TABLE IF NOT EXISTS Scheme (
        SchemeID INT PRIMARY KEY AUTO_INCREMENT,
        Name VARCHAR(255) NOT NULL,
        Description TEXT,
        InterestRate DECIMAL(5, 2) NOT NULL,
        Duration INT NOT NULL,
        MaturityDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
`;


const createTransactionTable = `
    CREATE TABLE IF NOT EXISTS Transaction (
        TransactionID INT NOT NULL AUTO_INCREMENT,
        MemberID INT,
        Amount VARCHAR(50), 
        TransactionType VARCHAR(100), 
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        PRIMARY KEY (TransactionID),
        FOREIGN KEY (MemberID) REFERENCES Member(MemberID)
    );
`;

const createEnrollmentTable = `
    CREATE TABLE IF NOT EXISTS Enrollment (
        EnrollmentID INT NOT NULL AUTO_INCREMENT,
        MemberID INT,
        SchemeID INT,
        EnrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (EnrollmentID),
        FOREIGN KEY (MemberID) REFERENCES Member(MemberID),
        FOREIGN KEY (SchemeID) REFERENCES Scheme(SchemeID)
    );
`;

const createFeeTable = `
CREATE TABLE IF NOT EXISTS Fee (
    FeeID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    Frequency INT NOT NULL, -- Frequency in days
    NextDeductionDate DATE NOT NULL
  );  
`;

const createPaymentTable = `
  CREATE TABLE IF NOT EXISTS Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    MemberID INT NOT NULL,
    TransactionID VARCHAR(255) NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MemberID) REFERENCES Member(MemberID)
  );
`;

db.query(createMemberTable, (err, result) => {
    if (err) {
        console.error("Error creating Member table", err);
    } else {
        console.log("Member table created successfully");
    }
}); 


db.query(createSchemeTable, (err, result) => {
    if (err) {
        console.error("Error creating Scheme table", err);
    } else {
        console.log("Scheme table created successfully");
    }
}); 

db.query(createTransactionTable, (err, result) => {
    if (err) {
        console.error("Error creating Transaction table", err);
    } else {
        console.log("Transaction table created successfully");
    }
}); 

db.query(createEnrollmentTable, (err, result) => {
    if (err) {
        console.error("Error creating Enrollment table", err);
    } else {
        console.log("Enrollment table created successfully");
    }
}); 

db.query(createFeeTable, (err, result) => {
    if (err) {
        console.error("Error creating Fee table", err);
    } else {
        console.log("Fee table created successfully");
    }
}); 

db.query(createPaymentTable, (err, results) => {
    if (err) {
      console.error('Error creating Payment table:', err);
    } else {
      console.log('Payment table created successfully');
    }
  });



module.exports = (req, res, next) => {
    req.db = db;
    next();
};