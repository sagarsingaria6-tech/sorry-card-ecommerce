import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './CardBuilder.css';

const CardBuilder = () => {
  const { currentUser } = useAuth();
  const [partnerName, setPartnerName] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardId, setCardId] = useState(null);
  const [qrValue, setQrValue] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCard = async () => {
    if (!partnerName.trim() || !message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;
      if (photo) {
        const photoRef = ref(storage, `cards/${currentUser.uid}/${Date.now()}`);
        await uploadBytes(photoRef, photo);
        photoUrl = await getDownloadURL(photoRef);
      }

      const cardsCollection = collection(db, 'cards');
      const docRef = await addDoc(cardsCollection, {
        userId: currentUser.uid,
        partnerName,
        message,
        photoUrl,
        createdAt: Timestamp.now(),
        scanned: false,
      });

      const finalQrData = `${window.location.origin}/card/${docRef.id}`;
      setCardId(docRef.id);
      setQrValue(finalQrData);
    } catch (err) {
      console.error('Error creating card:', err);
      alert('Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const qrElement = document.getElementById('qr-code');
    const link = document.createElement('a');
    link.href = qrElement.toDataURL('image/png');
    link.download = `sorry-card-${partnerName}.png`;
    link.click();
  };

  if (cardId && qrValue) {
    return (
      <div className="card-builder-container">
        <div className="success-section">
          <div className="emoji">🎉</div>
          <h1>Card Created Successfully!</h1>
          <p>Share this QR code with your partner</p>

          <div className="qr-display">
            <QRCode
              id="qr-code"
              value={qrValue}
              size={300}
              level="H"
              includeMargin={true}
              fgColor="#e91e63"
            />
          </div>

          <div className="button-group">
            <button onClick={handleDownloadQR} className="btn-download">
              Download QR Code
            </button>
            <button
              onClick={() => {
                setPartnerName('');
                setMessage('');
                setPhoto(null);
                setPhotoPreview(null);
                setCardId(null);
                setQrValue(null);
              }}
              className="btn-create-new"
            >
              Create Another Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-builder-container">
      <div className="builder-card">
        <h1>Create a Sorry Card</h1>
        <p>Make something special for your partner</p>

        <form className="builder-form">
          <div className="form-group">
            <label>Partner's Name *</label>
            <input
              type="text"
              placeholder="Enter your partner's name"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Sorry Message *</label>
            <textarea
              placeholder="Write your heartfelt message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label>Add a Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            )}
          </div>

          <button
            type="button"
            onClick={handleCreateCard}
            disabled={loading}
            className="btn-create"
          >
            {loading ? 'Creating Card...' : 'Create Card'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardBuilder;
