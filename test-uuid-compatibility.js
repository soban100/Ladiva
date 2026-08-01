// Test script to verify UUID compatibility between React and Supabase
// Run this in your browser console when logged in as admin

const testUUIDCompatibility = async () => {
  console.log('🔍 Testing UUID compatibility...');
  
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No active session');
    
    console.log('✅ Session found:', session.user.id);
    console.log('🔍 User ID type:', typeof session.user.id);
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) throw profileError;
    console.log('👤 Admin status:', profile.is_admin);
    
    if (!profile.is_admin) {
      console.error('❌ You must be an admin to run this test');
      return;
    }
    
    // Get a sample order to test with
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .limit(1);
    
    if (ordersError) throw ordersError;
    
    if (!orders || orders.length === 0) {
      console.log('📭 No orders found to test with');
      return;
    }
    
    const testOrder = orders[0];
    console.log('📋 Test order:', testOrder);
    console.log('🔍 Order ID type:', typeof testOrder.id);
    
    // Test the update function directly
    console.log('🔄 Testing order status update...');
    
    const originalStatus = testOrder.status;
    const newStatus = originalStatus === 'pending' ? 'confirmed' : 'pending';
    
    console.log(`📊 Changing status: ${originalStatus} → ${newStatus}`);
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)
      .select()
      .maybeSingle();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('Error code:', updateError.code);
      console.error('Error details:', updateError.details);
      return;
    }
    
    if (!updatedOrder) {
      console.error('❌ Update returned no data - possible RLS issue');
      return;
    }
    
    console.log('✅ Update successful:', updatedOrder);
    
    // Revert the change
    console.log('🔄 Reverting status change...');
    const { data: revertedOrder, error: revertError } = await supabase
      .from('orders')
      .update({ 
        status: originalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)
      .select()
      .maybeSingle();
    
    if (revertError) {
      console.error('❌ Revert failed:', revertError);
    } else {
      console.log('✅ Status reverted successfully');
    }
    
    console.log('🎉 UUID compatibility test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testUUIDCompatibility();
