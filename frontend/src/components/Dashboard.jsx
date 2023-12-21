import React, { useState, useEffect } from "react";

export const Dashboard = ({ userDetails }) => {
  // Sample state for balance, account history, and active schemes
  const [balance, setBalance] = useState(0);
  const [accountHistory, setAccountHistory] = useState([]);
  const [activeSchemes, setActiveSchemes] = useState([]);

  useEffect(() => {
    // Fetch balance, account history, and active schemes data from your backend
    // You can use an API call or any other method to retrieve the data

    // Example API call using fetch
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceResponse = await fetch("/api/balance");
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.balance);

        // Fetch account history
        const historyResponse = await fetch("/api/account-history");
        const historyData = await historyResponse.json();
        setAccountHistory(historyData.history);

        // Fetch active schemes
        const schemesResponse = await fetch("/api/active-schemes");
        const schemesData = await schemesResponse.json();
        setActiveSchemes(schemesData.schemes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Call the fetchData function
    fetchData();
  }, []); // Run this effect only once when the component mounts

  return (
    <div>
      <h2>Welcome, {userDetails.username}!</h2>
      <p>Current Balance: ${balance}</p>

      <div>
        <h3>Account History</h3>
        <ul>
          {accountHistory.map((transaction, index) => (
            <li key={index}>
              {transaction.type}: ${transaction.amount}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Active Schemes</h3>
        <ul>
          {activeSchemes.map((scheme, index) => (
            <li key={index}>{scheme.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

