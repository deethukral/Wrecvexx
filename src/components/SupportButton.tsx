import React from 'react';

export function SupportButton() {
  const handleSupport = () => {
    const upiId = "deethukral@upi";
    window.location.href = `upi://pay?pa=${upiId}&pn=Wrecvexx&am=50&cu=INR&tn=Support Wrecvexx game`;
  };
  return (
    <button onClick={handleSupport} style={{position:'fixed',bottom:'20px',right:'20px',zIndex:9999,background:'#ffcc00',color:'black',fontWeight:'bold',padding:'12px 18px',borderRadius:'25px',border:'2px solid white'}}>
      ❤️ SUPPORT ₹50
    </button>
  );
}
