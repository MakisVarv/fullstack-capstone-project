import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';
import './Profile.css';

function ProfilePage() {
    const navigate = useNavigate();
    const { setUserName } = useAppContext();

    const storedName = sessionStorage.getItem('name') || '';
    const storedEmail = sessionStorage.getItem('email') || '';
    const authToken = sessionStorage.getItem('auth-token');

    const [name, setName] = useState(storedName);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleUpdate = async () => {
        setMessage('');
        setError('');

        if (!authToken || !storedEmail) {
            navigate('/app/login');
            return;
        }

        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    email: storedEmail,
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    name,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Profile update failed');
                return;
            }

            sessionStorage.setItem('auth-token', data.authtoken);
            sessionStorage.setItem('name', data.name);
            sessionStorage.setItem('email', data.email);

            setUserName(data.name);
            setMessage('Profile updated successfully.');
        } catch (error) {
            console.error('Profile update error:', error);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="profile-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">
                            Profile
                        </h2>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                value={storedEmail}
                                disabled
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="name" className="form-label">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="form-control"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {message && (
                            <div className="alert alert-success" role="alert">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={handleUpdate}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;