// Property class
class Property {
    constructor({ name, price, downPayment, interestRate, loanTerm, cleaningCost, rentalIncome, managementCost }) {
        this.name = name;
        this.price = price;
        this.downPayment = downPayment;
        this.interestRate = interestRate;
        this.loanTerm = loanTerm;
        this.cleaningCost = cleaningCost;
        this.rentalIncome = rentalIncome;
        this.managementCost = managementCost;
        this.remainingDebt = price - downPayment;
        this.mortgage = this.calculateMonthlyMortgage();
        this.propertyTax = this.calculateYearlyPropertyTax();
    }

    // Calculate the monthly mortgage payment
    calculateMonthlyMortgage() {
        const loanPrincipal = this.price - this.downPayment;
        const monthlyInterestRate = this.interestRate / 12 / 100;
        const numberOfPayments = this.loanTerm * 12;
        return loanPrincipal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    }

    // Calculate the yearly property tax
    calculateYearlyPropertyTax() {
        const taxRate = 0.015; // 1.5% property tax rate
        return this.price * taxRate;
    }

    // Simulate one year of expenses and income
    simulateYear() {
        const yearlyMortgage = this.mortgage * 12;
        const yearlyTax = this.propertyTax;
        const yearlyCleaning = this.cleaningCost * 12;
        const yearlyManagement = this.managementCost * 12;
        const yearlyIncome = this.rentalIncome * 12;

        this.remainingDebt -= yearlyMortgage;

        return {
            income: yearlyIncome,
            expenses: yearlyMortgage + yearlyTax + yearlyCleaning + yearlyManagement,
            remainingDebt: this.remainingDebt
        };
    }
}

// Airbnb Business Simulator
class AirbnbBusinessSimulator {
    constructor() {
        this.properties = [];
        this.yearlyData = [];
        this.propertyCounter = 0;
        this.initialPropertyParams = null;
        this.cashBalance = 0;
        this.cashWithholdPercentage = 0;
    }

    setCashWithholdPercentage(percentage) {
        this.cashWithholdPercentage = percentage;
    }

    addProperty({ price, downPayment, interestRate, loanTerm, cleaningCost, rentalIncome, managementCost }) {
        const property = new Property({
            name: `Property ${++this.propertyCounter}`,
            price,
            downPayment,
            interestRate,
            loanTerm,
            cleaningCost,
            rentalIncome,
            managementCost
        });
        this.properties.push(property);
        if (!this.initialPropertyParams) {
            this.initialPropertyParams = { price, downPayment, interestRate, loanTerm, cleaningCost, rentalIncome, managementCost };
        }
    }

    simulateYears(years) {
        for (let year = 1; year <= years; year++) {
            let totalIncome = 0;
            let totalExpenses = 0;
            let totalDebt = 0;

            this.properties.forEach(property => {
                const { income, expenses, remainingDebt } = property.simulateYear();
                totalIncome += income;
                totalExpenses += expenses;
                totalDebt += remainingDebt;
            });

            // Calculate the yearly profit and adjust for cash withholding
            let yearlyProfit = totalIncome - totalExpenses;
            if (this.cashWithholdPercentage > 0) {
                const withheldAmount = yearlyProfit * this.cashWithholdPercentage / 100;
                yearlyProfit -= withheldAmount;
                this.cashBalance += withheldAmount;
            }

            // Calculate how many new properties can be bought with the profits
            const { price, downPayment, interestRate, loanTerm, cleaningCost, rentalIncome, managementCost } = this.initialPropertyParams;
            const newPropertiesCount = Math.floor(yearlyProfit / downPayment);

            for (let i = 0; i < newPropertiesCount; i++) {
                this.addProperty({
                    price,
                    downPayment,
                    interestRate,
                    loanTerm,
                    cleaningCost,
                    rentalIncome,
                    managementCost
                });
                yearlyProfit -= downPayment;
            }

            this.yearlyData.push({
                year,
                totalIncome,
                totalExpenses,
                totalDebt,
                propertiesCount: this.properties.length,
                cashBalance: this.cashBalance
            });
        }
    }

    // Generate Chart Data
    generateChartData(type) {
        switch (type) {
            case 'income':
                return {
                    labels: this.yearlyData.map(data => `Year ${data.year}`),
                    datasets: [{
                        label: 'Total Income',
                        data: this.yearlyData.map(data => data.totalIncome),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                };
            case 'expenses':
                return {
                    labels: this.yearlyData.map(data => `Year ${data.year}`),
                    datasets: [{
                        label: 'Total Expenses',
                        data: this.yearlyData.map(data => data.totalExpenses),
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                };
            case 'debt':
                return {
                    labels: this.yearlyData.map(data => `Year ${data.year}`),
                    datasets: [{
                        label: 'Total Debt',
                        data: this.yearlyData.map(data => data.totalDebt),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                };
            case 'properties':
                return {
                    labels: this.yearlyData.map(data => `Year ${data.year}`),
                    datasets: [{
                        label: 'Number of Properties',
                        data: this.yearlyData.map(data => data.propertiesCount),
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                };
            case 'cash':
                return {
                    labels: this.yearlyData.map(data => `Year ${data.year}`),
                    datasets: [{
                        label: 'Cash Balance',
                        data: this.yearlyData.map(data => data.cashBalance),
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1
                    }]
                };
            default:
                return {};
        }
    }

    // Render Chart
    renderChart(type, elementId) {
        const ctx = document.getElementById(elementId).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: this.generateChartData(type),
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderAllCharts() {
        this.renderChart('income', 'incomeChart');
        this.renderChart('expenses', 'expensesChart');
        this.renderChart('debt', 'debtChart');
        this.renderChart('properties', 'propertiesChart');
        this.renderChart('cash', 'cashChart');
    }
}

// Example usage
const simulator = new AirbnbBusinessSimulator();
simulator.addProperty({
    price: 1000000,
    downPayment: 200000,
    interestRate: 3.5,
    loanTerm: 30,
    cleaningCost: 4500,
    rentalIncome: 33750,
    managementCost: 416
}); // Initial property with named parameters

// Set cash withholding percentage (e.g., 10% of income each year)
simulator.setCashWithholdPercentage(5);

simulator.simulateYears(10);
simulator.renderAllCharts();
