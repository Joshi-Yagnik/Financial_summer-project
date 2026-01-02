function exportCSV() {
    const transactions = [
        { description: "Salary", amount: 50000 },
        { description: "Groceries", amount: -2000 },
        { description: "Electricity Bill", amount: -1500 }
    ];

    let csvContent = "Date,Description,Amount\n";

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    transactions.forEach(tx => {
        csvContent += `${today},${tx.description},${tx.amount}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${today}.csv`; // filename includes date
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


function exportJSON() {
    const data = {
        date: "2025-08-11",
        description: "Sample Transaction",
        amount: 1000
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

