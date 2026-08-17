import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', whatsapp_number: '', utr_number: '' });
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Combined loading state

  const fetchUsers = async () => {
    try { const res = await axios.get(`${API_BASE_URL}/api/auth/users`); setUsers(res.data); } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { whatsapp_number: formData.whatsapp_number });
      if (res.data.success) { setShowOtpModal(true); }
    } catch (err) { alert('OTP Sending Failed!'); } finally { setIsProcessing(false); }
  };

  // 🚀 ULTIMATE AUTOMATION: OTP Verify -> Activate -> Welcome Message
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const vRes = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { whatsapp_number: formData.whatsapp_number, otp: otpInput });
      if (!vRes.data.success) { alert('Invalid OTP.'); setIsProcessing(false); return; }

      const rRes = await axios.post(`${API_BASE_URL}/api/auth/register-temporary`, {
        name: formData.name, email: formData.email, phone: formData.whatsapp_number, companionName: 'Care Buddy', userAddressName: formData.name
      });

      if (rRes.data.success && rRes.data.user) {
        const userId = rRes.data.user.id;
        
        // ✅ confirm-payment call karo — yeh status active karega, UTR save karega, aur welcome WhatsApp message bhejega
        const confirmRes = await axios.post(`${API_BASE_URL}/api/payment/confirm-payment/${userId}`, {
          utr_number: formData.utr_number
        });

        if (!confirmRes.data.success) {
          alert("⚠️ Registration hua but activation mein kuch gadbad aayi. Admin se check karo.");
          setIsProcessing(false);
          return;
        }

        alert("✅ SUCCESS: User Activated & Welcome Message Sent!");
        setShowOtpModal(false);
        setOtpInput('');
        setFormData({ name: '', email: '', password: '', whatsapp_number: '', utr_number: '' }); // Clear form
        fetchUsers();
      }
    } catch (err) {
      alert("⚠️ Error during automation logic.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="gradient-background">
      <div className="container">
        <h1>Affirmation App Admin Dashboard ✨</h1>
        <div className="card">
            <h2>Register New User</h2>
            <form onSubmit={handleRegister}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="form-input"/>
              <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} placeholder="91XXXXXXXXXX" required className="form-input"/>
              <input type="text" name="utr_number" value={formData.utr_number} onChange={handleChange} placeholder="UTR Number (Payment Reference)" required className="form-input"/>
              <button type="submit" className="btn btn-primary" disabled={isProcessing}>Verify & Auto-Activate</button>
            </form>
        </div>
        <button onClick={() => setShowUsers(!showUsers)} className="btn btn-toggle">View Users ({users.length})</button>
        {showUsers && (
            <div className="card"><table className="table"><tbody>{users.map(u => (
                <tr key={u.id}><td>{u.name}</td><td>{u.status}</td></tr>
            ))}</tbody></table></div>
        )}
      </div>

      {showOtpModal && (<div style={S.overlay}><div style={S.modal}><form onSubmit={handleVerifyOtp}><input type="text" value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="6-Digit OTP" required style={S.input} /><button type="submit" style={S.actionBtn} disabled={isProcessing}>Verify & Start</button></form></div></div>)}
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999 },
  modal: { background:'#1e1b4b', padding:24, borderRadius:18, color:'#fff', width:'90%', maxWidth:300 },
  input: { width:'100%', padding:12, marginBottom:10, color:'#000', borderRadius:8, border: 'none' },
  actionBtn: { width:'100%', padding:12, background:'blue', color:'#fff', border:'none', borderRadius:8, fontWeight:'bold' }
};