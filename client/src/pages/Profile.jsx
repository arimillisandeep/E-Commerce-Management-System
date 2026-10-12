import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, password: '', confirm: '' });
  }, [user]);

  if (!user) return <Loader text="Loading profile..." />;

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name is required.';
    if (form.password) {
      if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
      else if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim() };
      if (form.password) payload.password = form.password;
      const { data } = await api.patch('/users/profile', payload);
      updateUser(data.data.user);
      toast.success('Profile updated.');
      setForm({ name: data.data.user.name, password: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>My Profile</h1>
        <p className="profile-meta">
          Email: <strong>{user.email}</strong><br />
          Role: <strong>{user.role}</strong><br />
          Member since: <strong>{new Date(user.created_at).toLocaleDateString()}</strong>
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          {errors.name && <span className="field-error">{errors.name}</span>}

          {showPassword && (
            <>
              <label>
                New password (leave blank to keep current)
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>
              {errors.password && <span className="field-error">{errors.password}</span>}
              <label>
                Confirm new password
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
              </label>
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? 'Hide password change' : 'Change password'}
          </button>

          <button className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => {
              logout();
              toast.success('Logged out.');
              navigate('/login', { replace: true });
            }}
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
