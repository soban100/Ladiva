// Debug script to check order management functionality
// Run this in browser console when on admin orders page

console.log('🔍 DEBUGGING ORDER MANAGEMENT');

// Check if orders are loading
setTimeout(() => {
  const ordersTable = document.querySelector('table tbody');
  if (ordersTable) {
    const rows = ordersTable.querySelectorAll('tr');
    console.log(`📊 Found ${rows.length} order rows in table`);
    
    // Check each row for buttons
    rows.forEach((row, index) => {
      const buttons = row.querySelectorAll('button');
      const statusBadge = row.querySelector('[class*="bg-"]');
      console.log(`Row ${index + 1}: ${buttons.length} buttons, status: ${statusBadge?.textContent}`);
    });
  } else {
    console.log('❌ Orders table not found');
  }
  
  // Check tab buttons
  const tabs = document.querySelectorAll('button[onclick*="setActiveTab"]');
  console.log(`📑 Found ${tabs.length} tab buttons`);
  
  tabs.forEach((tab, index) => {
    console.log(`Tab ${index + 1}: ${tab.textContent.trim()}`);
  });
}, 2000);

// Test clicking buttons manually (uncomment to test)
// setTimeout(() => {
//   const firstConfirmButton = document.querySelector('button:has-text("Is Confirm")');
//   if (firstConfirmButton) {
//     console.log('🔄 Clicking first "Is Confirm" button');
//     firstConfirmButton.click();
//   }
// }, 3000);
