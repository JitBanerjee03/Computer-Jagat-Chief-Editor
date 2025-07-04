import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const ChiefEditor = ({ chiefEditor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Initialize form with chiefEditor data
  useEffect(() => {
    if (chiefEditor) {
      reset({
        phone_number: chiefEditor.phone_number || '',
        institution: chiefEditor.institution || '',
        position_title: chiefEditor.position_title || '',
        country: chiefEditor.country || '',
        editor_bio: chiefEditor.editor_bio || '',
        orcid_id: chiefEditor.orcid_id || '',
        linkedin_profile: chiefEditor.linkedin_profile || '',
        google_scholar_profile: chiefEditor.google_scholar_profile || '',
        scopus_id: chiefEditor.scopus_id || '',
        web_of_science_id: chiefEditor.web_of_science_id || ''
      });
      setPreviewImage(chiefEditor.profile_picture || '/default-profile.png');
      setIsLoading(false);
    }
  }, [chiefEditor, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      await axios.patch(
        `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/update/${chiefEditor.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      setIsEditing(false);
      // Add success notification here if needed
    } catch (error) {
      console.error('Error updating profile:', error);
      // Add error notification here if needed
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="card shadow">
          <div className="card-body text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading editor data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Editor-in-Chief Profile</h3>
            <button 
              className={`btn ${isEditing ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 text-center mb-4">
                  <div className="position-relative">
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="img-thumbnail mb-2" 
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <input
                      type="file"
                      id="profilePicture"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label 
                      htmlFor="profilePicture" 
                      className="btn btn-sm btn-outline-primary position-absolute bottom-0 start-50 translate-middle-x"
                    >
                      Change
                    </label>
                  </div>
                </div>

                <div className="col-md-9">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        {...register('phone_number')}
                        defaultValue={chiefEditor.phone_number || ''}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <h5 className="mb-3">Affiliation</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Institution*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.institution ? 'is-invalid' : ''}`}
                    {...register('institution', { required: 'Institution is required' })}
                    defaultValue={chiefEditor.institution || ''}
                  />
                  {errors.institution && <div className="invalid-feedback">{errors.institution.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Position/Title</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register('position_title')}
                    defaultValue={chiefEditor.position_title || ''}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Country*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                    {...register('country', { required: 'Country is required' })}
                    defaultValue={chiefEditor.country || ''}
                  />
                  {errors.country && <div className="invalid-feedback">{errors.country.message}</div>}
                </div>
              </div>

              <h5 className="mb-3">Academic Profiles</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">ORCID ID</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register('orcid_id')}
                    defaultValue={chiefEditor.orcid_id || ''}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Google Scholar Profile</label>
                  <input
                    type="url"
                    className="form-control"
                    {...register('google_scholar_profile')}
                    defaultValue={chiefEditor.google_scholar_profile || ''}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">LinkedIn Profile</label>
                  <input
                    type="url"
                    className="form-control"
                    {...register('linkedin_profile')}
                    defaultValue={chiefEditor.linkedin_profile || ''}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Scopus ID</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register('scopus_id')}
                    defaultValue={chiefEditor.scopus_id || ''}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Web of Science ID</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register('web_of_science_id')}
                    defaultValue={chiefEditor.web_of_science_id || ''}
                  />
                </div>
              </div>

              <h5 className="mb-3">Biography</h5>
              <div className="mb-4">
                <label className="form-label">Editor Bio</label>
                <textarea
                  className="form-control"
                  rows="4"
                  {...register('editor_bio')}
                  defaultValue={chiefEditor.editor_bio || ''}
                ></textarea>
              </div>
            </div>

            <div className="card-footer bg-light">
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary px-4">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 text-center mb-4">
                <img 
                  src={chiefEditor.profile_picture || '/default-profile.png'} 
                  alt="Profile" 
                  className="img-thumbnail" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <div className="mt-2">
                  <span className={`badge ${chiefEditor.is_approved ? 'bg-success' : 'bg-warning'}`}>
                    {chiefEditor.is_approved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
              </div>

              <div className="col-md-9">
                <h4>{chiefEditor.full_name}</h4>
                {chiefEditor.position_title && <p className="text-muted mb-1">{chiefEditor.position_title}</p>}
                {chiefEditor.institution && <p className="text-muted mb-1">{chiefEditor.institution}</p>}

                <ul className="list-unstyled mt-3">
                  {chiefEditor.email && (
                    <li className="mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      {chiefEditor.email}
                    </li>
                  )}
                  {chiefEditor.phone_number && (
                    <li className="mb-1">
                      <i className="bi bi-telephone me-2"></i>
                      {chiefEditor.phone_number}
                    </li>
                  )}
                  {chiefEditor.country && (
                    <li className="mb-1">
                      <i className="bi bi-geo-alt me-2"></i>
                      {chiefEditor.country}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="col-md-6 mb-4">
                <h5>Academic Profiles</h5>
                <ul className="list-unstyled">
                  {chiefEditor.orcid_id && (
                    <li className="mb-2">
                      <i className="bi bi-person-badge me-2"></i>
                      ORCID: {chiefEditor.orcid_id}
                    </li>
                  )}
                  {chiefEditor.google_scholar_profile && (
                    <li className="mb-2">
                      <a href={chiefEditor.google_scholar_profile} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-google me-2"></i>Google Scholar
                      </a>
                    </li>
                  )}
                  {chiefEditor.linkedin_profile && (
                    <li className="mb-2">
                      <a href={chiefEditor.linkedin_profile} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-linkedin me-2"></i>LinkedIn
                      </a>
                    </li>
                  )}
                  {chiefEditor.scopus_id && (
                    <li className="mb-2">
                      <i className="bi bi-journal me-2"></i>
                      Scopus ID: {chiefEditor.scopus_id}
                    </li>
                  )}
                  {chiefEditor.web_of_science_id && (
                    <li className="mb-2">
                      <i className="bi bi-journal me-2"></i>
                      Web of Science ID: {chiefEditor.web_of_science_id}
                    </li>
                  )}
                </ul>
              </div>

              {chiefEditor.editor_bio && (
                <div className="col-md-6 mb-4">
                  <h5>Biography</h5>
                  <p>{chiefEditor.editor_bio}</p>
                </div>
              )}
            </div>

            <div className="text-muted small">
              Member since: {new Date(chiefEditor.date_joined).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChiefEditor;