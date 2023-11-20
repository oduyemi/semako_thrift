const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const validator = require("validator");
const twilio = require("twilio");
const paystack = require("paystack")("sk_live_4186a48786a6d619f052f5c80f8e39f0f7f4c416");


const accountSid = "AC6815d4c7b28c28c3fa8ba78855e14dfb";
const authToken = "caf8de319061e7e13627992f26b483d1";
const client = twilio(accountSid, authToken);

const PIN_EXPIRY_TIME = 10 * 60 * 1000;

async function hashPassword(password) {
  try {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512");
    return {
      salt,
      hashedPassword: hash.toString("hex")
    };
  } catch (error) {
    throw new Error("Error hashing password");
  }
}

async function verifyPassword(password, hashedPassword, salt) {
  try {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512");
    return hashedPassword === hash.toString("hex");
  } catch (error) {
    throw new Error("Error verifying password");
  }
}


async function sendSMSVerification(pin, phoneNumber) {
  try {
    const message = await client.messages.create({
      body: `Your registration PIN: ${pin}`,
      to: phoneNumber,
      from: "+12052361255"
    });
    console.log(message.sid);
    return true; // Success
  } catch (error) {
    console.error(error);
    return false; // Error
  }
}

async function sendSMSNotification(to, body) {
  return client.messages.create({
    body,
    to,
    from: "+12052361255",
  });
}



router.post("/sms-status", (req, res) => {
  const status = req.body.MessageStatus;
  const messageSid = req.body.MessageSid;
  console.log(`Message SID: ${messageSid}, Status: ${status}`);
  res.sendStatus(200);
});


/**
 * @swagger
 * /docs/register:
 *   post:
 *     summary: Creates a new member
 *     description: Create a new member in Semako Thrifting Union
 *     responses:
 *       200:
 *         description: Member created successfully
 */
router.post("/register", async (req, res) => {
  try {
    const { fname, lname, phone, address, password, confirmPassword } = req.body;
    if (![fname, lname, phone, address, password, confirmPassword].every((field) => field !== undefined && field !== null && field !== "")) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Both passwords must match!" });
    }

    const checkPhoneQuery = "SELECT * FROM Member WHERE Phone = ?";
    db.query(checkPhoneQuery, [phone], async function (err, results) {
      if (err) {
        return res.status(500).json({ message: "Error checking phone" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Phone already registered" });
      }

      const { salt, hashedPassword } = await hashPassword(password);

      const insertMemberQuery = "INSERT INTO Member (Fname, Lname, Phone, Address, Password) VALUES (?, ?, ?, ?, ?)";
      db.query(insertMemberQuery, [fname, lname, phone, address, hashedPassword], function (err, result) {
        if (err) {
          return res.status(500).json({ message: "Error registering member" });
        }

        const pin = crypto.randomInt(1000, 9999).toString();
        const phoneNumber = phone;
        req.session.registrationPin = {
          pin,
          expiryTime: Date.now() + PIN_EXPIRY_TIME,
        };

        sendSMSVerification(pin, phoneNumber)
          .then((smsSent) => {
            if (!smsSent) {
              return res.status(500).json({ message: "Error sending registration PIN" });
            }

            req.session.member = {
              MemberID: result.insertId,
              Fname,
              Lname,
              Phone,
              Address,
            };

            return res.status(201).json({
              message: "Member registered successfully. PIN sent via SMS.",
              nextStep: "/next-login-page",
            });
          })
          .catch((error) => {
            console.error("Error during member registration:", error);
            return res.status(500).json({ message: "Error registering member" });
          });
      });
    });
  } catch (error) {
    console.error("Error during member registration:", error);
    return res.status(500).json({ message: "Error registering member" });
  }
});


/**
 * @swagger
 * /docs/login:
 *   post:
 *     summary: Logs in a user
 *     description: Logs in a user in Global Educom
 *     responses:
 *       200:
 *         description: Login successfully
 */
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkPhoneQuery = "SELECT * FROM Member WHERE Phone = ?";
    db.query(checkPhoneQuery, [phone], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error checking member" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Phone not registered. Please register first." });
      }

      const member = results[0];
      const isPasswordMatch = await verifyPassword(password, member.Password, member.salt);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Incorrect phone number or password" });
      }

      const pin = crypto.randomInt(1000, 9999).toString();
      const phoneNumber = phone;
      req.session.registrationPin = {
        pin,
        expiryTime: Date.now() + PIN_EXPIRY_TIME,
      };

      const smsSent = await sendSMSVerification(pin, phoneNumber);
      if (!smsSent) {
        return res.status(500).json({ message: "Error sending registration PIN" });
      }

      const sessionMember = {
        MemberID: member.MemberID,
        Fname: member.Fname,
        Lname: member.Lname,
        Phone: member.Phone,
        Address: member.Address,
      };
      req.session.member = sessionMember;
      return res.status(201).json({
        message: "Member login successful. PIN sent via SMS.",
        pin,
        nextStep: "/next-member-dashboard",
      });
    });
  } catch (error) {
    console.error("Error during member login:", error);
    return res.status(500).json({ message: "Error logging in member" });
  }
});


/**
 * @swagger
 * /docs/members/member/make-payment:
 *   post:
 *     summary: Initiates a new payment
 *     description: Initiate a new payment for a member in Semako Thrifting Union
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 */
router.post("/members/member/make-payment", async (req, res) => {
  try {
    const { memberId, amount, email } = req.body;

    if (![memberId, amount, email].every((field) => field !== undefined && field !== null && field !== "")) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const memberQuery = "SELECT * FROM Member WHERE MemberID = ?";
    db.query(memberQuery, [memberId], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching member details" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Member not found" });
      }

      const member = results[0];

      const paymentObject = {
        amount: amount * 100, // Paystack API expects amount in kobo
        email,
        metadata: {
          memberId: member.MemberID,
          fullName: `${member.Fname} ${member.Lname}`,
        },
      };

      try {
        const paymentResponse = await paystack.initializeTransaction(paymentObject);
        const insertPaymentQuery = "INSERT INTO Payment (MemberID, TransactionID, Amount, Status) VALUES (?, ?, ?, ?)";
        db.query(insertPaymentQuery, [memberId, paymentResponse.data.reference, amount, "pending"], (err, result) => {
          if (err) {
            console.error("Error storing payment details:", err);
          } else {
            console.log("Payment details stored successfully");
          }
        });

        return res.status(200).json({
          message: "Payment initiated successfully",
          authorizationUrl: paymentResponse.data.authorization_url,
          reference: paymentResponse.data.reference,
        });
      } catch (error) {
        console.error("Error initializing payment with Paystack:", error);
        return res.status(500).json({ message: "Error initiating payment" });
      }
    });
  } catch (error) {
    console.error("Error during payment initiation:", error);
    return res.status(500).json({ message: "Error initiating payment" });
  }
});



router.post("/webhook", async (req, res) => {
  const secretKey = "sk_live_4186a48786a6d619f052f5c80f8e39f0f7f4c416"; 
  const hash = req.headers["x-paystack-signature"];
  const isValid = verifyWebhookSignature(req.rawBody, hash, secretKey);
  if (!isValid) {
    console.error("Invalid Paystack webhook signature");
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  switch (event.event) {
    case "charge.success":
      handleSuccessfulPayment(event.data);
      break;
    case "charge.failed":
      handleFailedPayment(event.data);
      break;
    default:
      console.log("Unhandled Paystack webhook event:", event.event);
  }

  res.sendStatus(200);
});

function verifyWebhookSignature(rawBody, hash, secretKey) {
  const hmac = crypto.createHmac("sha512", secretKey);
  hmac.update(rawBody);
  const calculatedHash = hmac.digest("hex");

  return hash === calculatedHash;
}

function handleSuccessfulPayment(data) {
  const transactionId = data.id;
  const amount = data.amount / 100; 
  const customerEmail = data.customer.email;
  console.log(`Payment successful for transaction ${transactionId}. Amount: ${amount}, Customer: ${customerEmail}`);
}

function handleFailedPayment(data) {
  const transactionId = data.id;
  const customerEmail = data.customer.email;
  console.log(`Payment failed for transaction ${transactionId}. Customer: ${customerEmail}`);
}

/**
 * @swagger
 * /docs/members/member/enroll-scheme:
 *   post:
 *     summary: Initiates scheme enrollment
 *     description: Initiate scheme enrollment for a member in Semako Thrifting Union
 *     responses:
 *       200:
 *         description: Scheme Enrolled successfully
 */
router.post("/members/member/enroll-scheme", async (req, res) => {
  try {
    const { memberId, schemeId } = req.body;
    const checkMemberQuery = "SELECT * FROM Member WHERE MemberID = ?";
    const checkSchemeQuery = "SELECT * FROM Scheme WHERE SchemeID = ?";

    db.query(checkMemberQuery, [memberId], (err, memberResults) => {
      if (err || memberResults.length === 0) {
        return res.status(404).json({ message: "Member not found" });
      }

      db.query(checkSchemeQuery, [schemeId], (err, schemeResults) => {
        if (err || schemeResults.length === 0) {
          return res.status(404).json({ message: "Scheme not found" });
        }

        const enrollQuery = "INSERT INTO MemberScheme (MemberID, SchemeID) VALUES (?, ?)";
        db.query(enrollQuery, [memberId, schemeId], (err) => {
          if (err) {
            return res.status(500).json({ message: "Error enrolling in the scheme" });
          }

          return res.status(200).json({ message: "Enrolled in the scheme successfully" });
        });
      });
    });
  } catch (error) {
    console.error("Error enrolling in the scheme:", error);
    return res.status(500).json({ message: "Error enrolling in the scheme" });
  }
});


/**
 * @swagger
 * /docs/deduct-fees:
 *   post:
 *     summary: Initiates fees deduction
 *     description: Initiate fees deduction for members in Semako Thrifting Union
 *     responses:
 *       200:
 *         description: Fees Deducted successfully
 */
router.post("/deduct-fees", async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const getDueFeesQuery = "SELECT * FROM Fee WHERE NextDeductionDate <= ?";
    db.query(getDueFeesQuery, [currentDate], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching due fees" });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: "No fees to deduct at the moment" });
      }

      results.forEach((fee) => {
        const deductFeeQuery = "UPDATE Member SET AccountBalance = AccountBalance - ? WHERE MemberID IN (SELECT MemberID FROM MemberScheme)";
        db.query(deductFeeQuery, [fee.Amount], (err) => {
          if (err) {
            console.error(`Error deducting fee (${fee.Name}) from member accounts:`, err);
          } else {
            console.log(`Deducted fee (${fee.Name}) from member accounts successfully`);
          }
        });
      });

      const updateNextDeductionDateQuery = "UPDATE Fee SET NextDeductionDate = DATE_ADD(NextDeductionDate, INTERVAL Frequency DAY)";
      db.query(updateNextDeductionDateQuery, (err) => {
        if (err) {
          console.error("Error updating NextDeductionDate for fees:", err);
        } else {
          console.log("Updated NextDeductionDate for fees successfully");
        }
      });

      return res.status(200).json({ message: "Fees deducted successfully" });
    });
  } catch (error) {
    console.error("Error deducting fees:", error);
    return res.status(500).json({ message: "Error deducting fees" });
  }
});


/**
 * @swagger
 * /docs/deduct-fees:
 *   post:
 *     summary: Deducts fees from member accounts and sends SMS notifications.
 *     responses:
 *       200:
 *         description: Fees deducted successfully
 */
router.post("/deduct-fees", async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const getDueFeesQuery = "SELECT * FROM Fee WHERE NextDeductionDate <= ?";
    db.query(getDueFeesQuery, [currentDate], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching due fees" });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: "No fees to deduct at the moment" });
      }

      for (const fee of results) {
        const deductFeeQuery = "UPDATE Member SET AccountBalance = AccountBalance - ? WHERE MemberID IN (SELECT MemberID FROM MemberScheme)";
        db.query(deductFeeQuery, [fee.Amount], async (err, updateResult) => {
          if (err) {
            console.error(`Error deducting fee (${fee.Name}) from member accounts:`, err);
          } else {
            console.log(`Deducted fee (${fee.Name}) from member accounts successfully`);

            const memberId = updateResult.insertId; // Adjust this based on your database structure
            const getMemberPhoneQuery = "SELECT Phone FROM Member WHERE MemberID = ?";
            db.query(getMemberPhoneQuery, [memberId], async (phoneErr, phoneResults) => {
              if (phoneErr || phoneResults.length === 0) {
                console.error(`Error fetching member's phone number:`, phoneErr);
                return;
              }
  
              const memberPhoneNumber = phoneResults[0].Phone;
              const smsMessage = `Dear member, a fee of ${fee.Amount} has been deducted from your account for ${fee.Name}. Your current account balance is ${newBalance}.`;
  
              try {
                await sendSMSNotification(memberPhoneNumber, smsMessage);
                console.log(`SMS notification sent to member (${memberPhoneNumber}) successfully`);
              } catch (smsError) {
                console.error(`Error sending SMS notification to member (${memberPhoneNumber}):`, smsError);
              }
            });
          }
        });
      }

      const updateNextDeductionDateQuery = "UPDATE Fee SET NextDeductionDate = DATE_ADD(NextDeductionDate, INTERVAL Frequency DAY)";
      db.query(updateNextDeductionDateQuery, (err) => {
        if (err) {
          console.error("Error updating NextDeductionDate for fees:", err);
        } else {
          console.log("Updated NextDeductionDate for fees successfully");
        }
      });

      return res.status(200).json({ message: "Fees deducted successfully" });
    });
  } catch (error) {
    console.error("Error deducting fees:", error);
    return res.status(500).json({ message: "Error deducting fees" });
  }
});

module.exports = router;

      





module.exports = router;
