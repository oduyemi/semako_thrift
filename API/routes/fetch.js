const express = require("express");
const router = express.Router();




router.get("/", (req, res) => {
res.json({ message: "Welcome to Semako Thrifting Union" });
});



 router.get("/members", (req, res) => {
    const db = req.db;
    db.query("SELECT * FROM Member", (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            res.status(500).json({ Message: "Internal Server Error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ Message: "Members not available" });
            } else {
                res.json({ data: results });
            }
        }
    });
});


 router.get("/members/member/:id", (req, res) => {
    const db = req.db;
    const memberId = req.params.id;
    if (!memberId || isNaN(memberId)) {
        return res.status(400).json({ message: "Invalid Member ID provided" });
    }

    db.query("SELECT * FROM Member WHERE MemberID = ?", [memberId], (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            return res.status(500).json({ Message: "Internal Server Error", details: err.message });
        } else {
            if (results.length === 0) {
                return res.status(404).json({ message: "Member not found" });
            } else {
                return res.json({ data: results });
            }
        }
    });
});



 router.get("/members", (req, res) => {
    const db = req.db;
    db.query("SELECT * FROM Member", (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            res.status(500).json({ Message: "Internal Server Error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ Message: "Members not available" });
            } else {
                res.json({ data: results });
            }
        }
    });
});


 router.get("/members/member/:id/balance", (req, res) => {
    const db = req.db;
    const memberId = req.params.id;
    if (!memberId || isNaN(memberId)) {
        return res.status(400).json({ message: "Invalid Member ID provided" });
    }

    db.query("SELECT AccountBalance FROM Member WHERE MemberID = ?", [memberId], (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            return res.status(500).json({ Message: "Internal Server Error", details: err.message });
        } else {
            if (results.length === 0) {
                return res.status(404).json({ message: "Account number not found" });
            } else {
                return res.json({ data: results });
            }
        }
    });
});


router.get("/schemes", async (req, res) => {
    try {
      const getSchemesQuery = "SELECT * FROM Scheme";
      db.query(getSchemesQuery, (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Error fetching schemes" });
        }
  
        return res.status(200).json(results);
      });
    } catch (error) {
      console.error("Error fetching schemes:", error);
      return res.status(500).json({ message: "Error fetching schemes" });
    }
  });


router.get("/schemes/scheme/:id", (req, res) => {
    const db = req.db;
    const schemeId = req.params.id;
    if (!schemeId || isNaN(schemeId)) {
        return res.status(400).json({ Message: "Invalid Scheme ID provided" });
    }

    db.query("SELECT * FROM Scheme WHERE SchemeID = ?", [schemeId], (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            return res.status(500).json({ Message: "Internal Server Error", details: err.message });
        } else {
            if (results.length === 0) {
                return res.status(404).json({ message: "Scheme not found" });
            } else {
                return res.json({ data: results });
            }
        }
    });
});



router.get("/transactions", (req, res) => {
    const db = req.db;
    db.query("SELECT * FROM Transaction", (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            res.status(500).json({ Message: "Internal Server Error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ Message: "Transactions not available" });
            } else {
                res.json({ data: results });
            }
        }
    });
});



router.get("/transactions/transaction/:id", (req, res) => {
    const db = req.db;
    const transactionId = req.params.id;
    if (!transactionId || isNaN(transactionId)) {
        return res.status(400).json({ Message: "Invalid transaction ID provided" });
    }

    db.query("SELECT * FROM Transaction WHERE TransactionID = ?", [transactionId], (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            return res.status(500).json({ Message: "Internal Server Error", details: err.message });
        } else {
            if (results.length === 0) {
                return res.status(404).json({ message: "Transaction not found" });
            } else {
                return res.json({ data: results });
            }
        }
    });
});



 router.get("/enrollments", (req, res) => {
    const db = req.db;
    db.query("SELECT * FROM Enrollment", (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            res.status(500).json({ Message: "Internal Server Error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ Message: "No Enrollment available" });
            } else {
                res.json({ data: results });
            }
        }
    });
});



router.get("/enrollments/enrollment/:id", (req, res) => {
    const db = req.db;
    const enrollmentId = req.params.id;
    if (!enrollmentId || isNaN(enrollmentId)) {
        return res.status(400).json({ Message: "Invalid Enrollment ID provided" });
    }

    db.query("SELECT * FROM Enrollment WHERE EnrollmentID = ?", [enrollmentId], (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            return res.status(500).json({ Message: "Internal Server Error", details: err.message });
        } else {
            if (results.length === 0) {
                return res.status(404).json({ message: "Enrollment not found" });
            } else {
                return res.json({ data: results });
            }
        }
    });
});


 router.get("/fees", (req, res) => {
    const db = req.db;
    db.query("SELECT * FROM Fee",  (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            res.status(500).json({ Message: "Internal Server Error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ Message: "No fee available" });
            } else {
                res.json({ data: results });
            }
        }
    });
});



router.get("/fees/fee/:id", (req, res) => {
    const db = req.db;
    const feeId = req.params.id;
    if (!feeId || isNaN(feeId)) {
        return res.status(400).json({ Message: "Invalid Fee ID provided" });
    }

    db.query("SELECT * FROM Fee WHERE FeeID = ?", [feeId], (err, results) => {
        if (err) {
            console.error("Error fetching data from the database", err);
            return res.status(500).json({ Message: "Internal Server Error", details: err.message });
        } else {
            if (results.length === 0) {
                return res.status(404).json({ message: "Fee not found" });
            } else {
                return res.json({ data: results });
            }
        }
    });
});


module.exports = router