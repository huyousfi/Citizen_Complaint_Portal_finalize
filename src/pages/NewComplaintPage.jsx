import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

const defaultForm = {
  title: '',
  category: 'Road',
  description: '',
  area: 'Downtown',
  imageUrl: '',
}

export default function NewComplaintPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [duplicateMatches, setDuplicateMatches] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.title || !form.description || !form.area) {
      setError('Please enter a title, description, and area.')
      return
    }

    try {
      await apiClient.createComplaint(form.title, form.description, form.category, form.area, form.imageUrl || null)
      navigate('/complaints/mine')
    } catch (err) {
      setError(err.message || 'Unable to create complaint.')
    }
  }

  const handleDuplicateCheck = async () => {
    if (!form.category || !form.area) return

    try {
      const data = await apiClient.checkDuplicates(form.category, form.area)
      setDuplicateMatches(data.duplicates || data.matches || [])
    } catch (err) {
      console.error('Duplicate check failed:', err)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setUploadingImage(true)
    try {
      const data = await apiClient.uploadComplaintImage(file)
      setForm((current) => ({ ...current, imageUrl: data.imageUrl }))
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to upload image')
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Report issue</p>
          <h3>Submit a complaint</h3>
        </div>
      </div>

      <form className="complaint-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} placeholder="Example: Broken streetlight near the bus stop" />
        </label>

        <div className="field-row two-col">
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              {['Road', 'Garbage', 'Water', 'Electricity', 'Other'].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Area
            <select name="area" value={form.area} onChange={handleChange}>
              {['Downtown', 'North Zone', 'South Zone', 'East District', 'West District'].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe the issue in detail" />
        </label>

        <label>
          Attach photo (proof of issue)
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          {uploadingImage && <small>Uploading...</small>}
        </label>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
            <small>Image ready to submit</small>
          </div>
        )}

        {error ? <div className="message error">{error}</div> : null}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={handleDuplicateCheck}>Check duplicates</button>
          <button type="submit" className="primary-button">Submit complaint</button>
        </div>
      </form>

      {duplicateMatches.length > 0 ? (
        <div className="duplicate-panel">
          <h4>Matching complaints</h4>
          <ul>
            {duplicateMatches.map((match) => (
              <li key={match._id || match.id}>
                <strong>{match.title}</strong> — {match.area} ({match.status})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
