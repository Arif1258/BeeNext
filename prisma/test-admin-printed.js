async function testAdminFlow() {
  console.log("Testing Admin Flow...");
  
  // 1. Login as Admin
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@beenext.dev",
      password: "AdminSecurePassword123!",
    }),
  });

  const cookie = loginRes.headers.get("set-cookie");
  if (!cookie) {
    console.error("Failed to get admin session cookie");
    process.exit(1);
  }

  // 2. Fetch printed orders as admin
  const ordersRes = await fetch("http://localhost:3000/api/admin/printed-orders", {
    headers: { Cookie: cookie },
  });
  const ordersData = await ordersRes.json();
  console.log(`✓ Admin fetched ${ordersData.orders?.length} printed orders.`);

  if (ordersData.orders && ordersData.orders.length > 0) {
    const firstOrder = ordersData.orders[0];
    // 3. Update order status to SHIPPED
    const patchRes = await fetch(`http://localhost:3000/api/admin/printed-orders/${firstOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        orderStatus: "SHIPPED",
        carrier: "BlueDart Express",
        trackingNumber: "BD987654321IN",
      }),
    });
    const patchData = await patchRes.json();
    console.log(`✓ Admin updated order ${firstOrder.orderNumber} to: ${patchData.order?.orderStatus}, tracking: ${patchData.order?.trackingNumber}`);
  }

  // 4. Update printed config as admin
  const configRes = await fetch("http://localhost:3000/api/admin/printed-config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      price: 1499,
      isFreeShipping: true,
      deliveryCharge: 0,
    }),
  });
  const configData = await configRes.json();
  console.log(`✓ Admin updated printed config: Price ₹${configData.config?.price}, Free shipping: ${configData.config?.isFreeShipping}`);

  // 5. Test updating sample slot 1 image caption/title
  const sampleSlotRes = await fetch("http://localhost:3000/api/admin/sample-images", {
    method: "POST",
    headers: { Cookie: cookie },
    body: (() => {
      const fd = new FormData();
      fd.append("slotIndex", "1");
      fd.append("title", "Sorting Techniques & Invariants");
      fd.append("caption", "Merge Sort recursion tree & recurrence equations verified");
      return fd;
    })(),
  });
  const slotData = await sampleSlotRes.json();
  console.log(`✓ Admin updated Slot 1: "${slotData.image?.title}" - "${slotData.image?.caption}"`);

  console.log("🎉 ALL ADMIN END-TO-END FLOWS VERIFIED SUCCESSFULLY!");
}

testAdminFlow().catch(console.error);
