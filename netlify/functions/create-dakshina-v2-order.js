async function createRazorpayOrder(keyId, keySecret, orderPayload) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {method:'POST',headers:{'Authorization':`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify(orderPayload)});
  const data = await response.json().catch(() => ({}));
  if(!response.ok){const msg=data?.error?.description||data?.error?.reason||data?.error||'Razorpay rejected the optional Dakshina order';throw new Error(typeof msg==='string'?msg:JSON.stringify(msg));}
  return data;
}
exports.handler=async(event)=>{
  const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
  if(event.httpMethod!=='POST')return{statusCode:405,headers,body:JSON.stringify({error:'Method not allowed',flow:'review-dakshina-v9'})};
  try{
    const key_id=process.env.RAZORPAY_KEY_ID,key_secret=process.env.RAZORPAY_KEY_SECRET;
    if(!key_id||!key_secret)return{statusCode:500,headers,body:JSON.stringify({error:'Razorpay keys are missing in Netlify environment variables',flow:'review-dakshina-v9'})};
    const body=JSON.parse(event.body||'{}'), amountRupees=Number(body.amount);
    if(!Number.isInteger(amountRupees)||amountRupees<1||amountRupees>500000)return{statusCode:400,headers,body:JSON.stringify({error:'Optional Dakshina must be a whole rupee amount of ₹1 or more.',flow:'review-dakshina-v9'})};
    const clean=(v,m=250)=>String(v||'').trim().slice(0,m); const rating=Number(body.rating); const ratingText=Number.isInteger(rating)&&rating>=1&&rating<=5?`${rating}/5`:'Not provided'; const amountPaise=amountRupees*100;
    const order=await createRazorpayOrder(key_id,key_secret,{amount:amountPaise,currency:'INR',receipt:`review_dak_${Date.now()}`.slice(0,40),notes:{payment_type:'Optional Dakshina after Isht Devta Review',funnel_version:'review-dakshina-v9',dakshina_amount:String(amountRupees),customer_name:clean(body.name,100),whatsapp_number:clean(body.phone,30),rating:ratingText,feedback_preview:clean(body.feedback,250),source:'Review page'}});
    if(Number(order.amount)!==amountPaise)throw new Error('Safety check failed: optional Dakshina amount mismatch');
    return{statusCode:200,headers,body:JSON.stringify({flow:'review-dakshina-v9',order_id:order.id,amount:amountPaise,currency:'INR',key_id})};
  }catch(error){return{statusCode:500,headers,body:JSON.stringify({error:error.message||'Could not create optional Dakshina order',flow:'review-dakshina-v9'})};}
};
