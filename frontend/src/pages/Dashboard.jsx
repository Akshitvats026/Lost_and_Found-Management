import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search, Plus, MapPin, Calendar, Phone, Edit, Trash2 } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Current user approximation from JWT isn't trivially available without decoding, 
  // but we can just use the item.user._id if we populate or we can try deleting and handling 401.
  // Actually, standard is to decode token or fetch profile. Let's just handle 401 gracefully.
  
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    date: '',
    contactInfo: ''
  });

  const fetchItems = async () => {
    try {
      const res = await api.get(`/items/search?name=${search}&category=${category}`);
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to fetch items');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem._id}`, formData);
        toast.success('Item updated successfully');
      } else {
        await api.post('/items', formData);
        toast.success('Item reported successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: ''
      });
      fetchItems();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(err.response?.data?.message || 'Action failed');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        toast.success('Item deleted successfully');
        fetchItems();
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please log in again.');
        } else {
          toast.error(err.response?.data?.message || 'Failed to delete item (Unauthorized)');
        }
      }
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: new Date(item.date).toISOString().split('T')[0],
      contactInfo: item.contactInfo
    });
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Campus Items</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Help find lost items or claim what's yours.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null);
            setFormData({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Report Item
        </button>
      </div>

      <div className="search-bar">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search items by name..." 
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="form-control" 
          style={{ width: '200px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>
      </div>

      <div className="items-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ marginBottom: '0.5rem' }}>No items found</h3>
            <p>We couldn't find any items matching your search criteria.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div 
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="item-card"
            >
              <div className="item-header">
                <h3 className="item-title">{item.itemName}</h3>
                <span className={`item-badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
                  {item.type}
                </span>
              </div>
              
              <div className="item-meta">
                <MapPin size={14} /> {item.location}
              </div>
              <div className="item-meta">
                <Calendar size={14} /> {new Date(item.date).toLocaleDateString()}
              </div>
              
              <p className="item-desc">{item.description}</p>
              
              <div className="item-meta">
                <Phone size={14} /> {item.contactInfo}
              </div>
              <div className="item-meta" style={{ marginTop: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                Reported by: {item.user?.name || 'Unknown'}
              </div>

              <div className="item-footer">
                <span style={{ color: 'var(--text-secondary)' }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <div className="item-actions">
                  <button className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '6px' }} onClick={() => openEditModal(item)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '6px' }} onClick={() => handleDelete(item._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Edit Item' : 'Report New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input type="text" className="form-control" required value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Where was it lost/found?" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Provide detailed description..." />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Info</label>
                <input type="text" className="form-control" required value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} placeholder="Phone number or email" />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingItem ? 'Save Changes' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
