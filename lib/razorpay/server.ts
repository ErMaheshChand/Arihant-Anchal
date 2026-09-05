
import Razorpay from 'razorpay'
export function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
  })
}
