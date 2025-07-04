import { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./styles/Recommendation.css";
import { contextProviderDeclare } from "../store/ContextProvider";
import { Link } from 'react-router-dom';

const ChiefEditorRecommendation = () => {
    const { chiefEditor } = useContext(contextProviderDeclare);
    const { journalId } = useParams();
    const navigate = useNavigate();
    console.log(chiefEditor);
    const [formData, setFormData] = useState({
        recommendation: "",
        decision_summary: "",
        requires_review: false,
        review_deadline: "",
        is_final_decision: false,
        decision_notes: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [journalDetails, setJournalDetails] = useState(null);
    const [authorDetails, setAuthorDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                const journalResponse = await axios.get(
                    `${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/detail/${journalId}/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }
                );
                setJournalDetails(journalResponse.data);
                
                if (journalResponse.data.corresponding_author) {
                    const authorResponse = await axios.get(
                        `${import.meta.env.VITE_BACKEND_DJANGO_URL}/author/detail/${journalResponse.data.corresponding_author}/`,
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            }
                        }
                    );
                    setAuthorDetails(authorResponse.data);
                }
                
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setFetchError("Failed to load journal details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [journalId]);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.recommendation) {
            errors.recommendation = "Recommendation is required";
        }
        
        if (!formData.decision_summary || formData.decision_summary.trim().length < 20) {
            errors.decision_summary = "Decision summary must be at least 20 characters";
        }
        
        if (formData.requires_review && !formData.review_deadline) {
            errors.review_deadline = "Review deadline is required when review is needed";
        }
        
        if (formData.is_final_decision && !formData.decision_notes) {
            errors.decision_notes = "Decision notes are required for final decisions";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    /*const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            const payload = {
                journal: journalId,
                editor_in_chief: chiefEditor.eic_id,
                recommendation: formData.recommendation,
                decision_summary: formData.decision_summary,
                requires_review: formData.requires_review,
                review_deadline: formData.requires_review ? formData.review_deadline : null,
                is_final_decision: formData.is_final_decision,
                decision_notes: formData.is_final_decision ? formData.decision_notes : null
            };

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/recommendations/create/`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            
            if (response.status === 200 || response.status === 201) {
                setSubmitSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 
                    err.response?.data?.detail || 
                    "Failed to submit recommendation. Please try again.");
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };*/

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            const payload = {
                journal: journalId,
                editor_in_chief: chiefEditor.eic_id,
                recommendation: formData.recommendation,
                decision_summary: formData.decision_summary,
                requires_review: formData.requires_review,
                review_deadline: formData.requires_review ? formData.review_deadline : null,
                is_final_decision: formData.is_final_decision,
                decision_notes: formData.is_final_decision ? formData.decision_notes : null
            };

            // First create the recommendation
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/recommendations/create/`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            
            // If it's a final decision, call the appropriate journal status endpoint
            if (formData.is_final_decision) {
                let statusEndpoint = '';
                
                if (formData.recommendation === 'accept') {
                    statusEndpoint = 'mark-accepted';
                } else if (formData.recommendation === 'reject') {
                    statusEndpoint = 'mark-rejected';
                } else {
                    statusEndpoint = 'mark-revisions-required';
                }
                
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/${statusEndpoint}/${journalId}/`,
                    {},  // Empty body as per requirements
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }
                );
            }
            
            if (response.status === 200 || response.status === 201) {
                setSubmitSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 
                    err.response?.data?.detail || 
                    "Failed to submit recommendation. Please try again.");
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="success-container">
                <h2 className="success-heading">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Decision Submitted Successfully!
                </h2>
                <p className="success-message">
                    Your decision for "{journalDetails?.title || 'the journal'}" has been recorded.
                </p>
                <div className="success-details">
                    <p><strong>Decision:</strong> {formData.recommendation}</p>
                    {formData.requires_review && (
                        <p><strong>Review Deadline:</strong> {formData.review_deadline}</p>
                    )}
                    {formData.is_final_decision && (
                        <p><strong>Decision Notes:</strong> {formData.decision_notes}</p>
                    )}
                    <p><strong>Summary:</strong> {formData.decision_summary}</p>
                    <p><strong>Final Decision:</strong> {formData.is_final_decision ? 'Yes' : 'No'}</p>
                </div>
                <Link 
                    to="/submitted-article" 
                    className="success-button"
                    style={{ textDecoration: 'none' }}
                >
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const getAuthorName = () => {
        if (authorDetails) {
            return `${authorDetails.user.first_name} ${authorDetails.user.last_name}`;
        }
        if (journalDetails?.author_name_text) {
            return journalDetails.author_name_text;
        }
        return 'Unknown author';
    };

    return (
        <div className="recommendation-container">
            <div className="journal-header">
                <h1 className="recommendation-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="title-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Editor-in-Chief Recommendation
                </h1>
            </div>
            
            {error && (
                <div className="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="recommendation-form">
                <div className={`form-group ${formErrors.recommendation ? 'error' : ''}`}>
                    <label className="form-label required">
                        Decision
                    </label>
                    <select
                        name="recommendation"
                        value={formData.recommendation}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="">Select a decision</option>
                        <option value="accept">Accept</option>
                        <option value="minor_revision">Minor Revision</option>
                        <option value="major_revision">Major Revision</option>
                        <option value="reject">Reject</option>
                    </select>
                    {formErrors.recommendation && (
                        <span className="error-text">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {formErrors.recommendation}
                        </span>
                    )}
                </div>
                
                <div className={`form-group ${formErrors.decision_summary ? 'error' : ''}`}>
                    <label className="form-label required">
                        Decision Summary
                    </label>
                    <textarea
                        name="decision_summary"
                        value={formData.decision_summary}
                        onChange={handleChange}
                        className="form-textarea large"
                        placeholder="Detailed summary of your decision (min. 20 characters)"
                        required
                    />
                    {formErrors.decision_summary && (
                        <span className="error-text">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {formErrors.decision_summary}
                        </span>
                    )}
                    <p className="form-hint">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Please provide a detailed explanation for your decision
                    </p>
                </div>
                
                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="is_final_decision"
                            checked={formData.is_final_decision}
                            onChange={handleChange}
                            className="form-checkbox"
                        />
                        <span>Is Final Decision</span>
                    </label>
                    <p className="form-hint">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Check this if this is the final decision for the manuscript
                    </p>
                </div>
                
                {formData.is_final_decision && (
                    <div className={`form-group ${formErrors.decision_notes ? 'error' : ''}`}>
                        <label className="form-label required">
                            Decision Notes
                        </label>
                        <textarea
                            name="decision_notes"
                            value={formData.decision_notes}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Additional notes about the final decision"
                            required={formData.is_final_decision}
                        />
                        {formErrors.decision_notes && (
                            <span className="error-text">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {formErrors.decision_notes}
                            </span>
                        )}
                        <p className="form-hint">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            Provide any additional notes about this final decision
                        </p>
                    </div>
                )}
                
                {/*<div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="requires_review"
                            checked={formData.requires_review}
                            onChange={handleChange}
                            className="form-checkbox"
                        />
                        <span>Requires Additional Review</span>
                    </label>
                    <p className="form-hint">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Check this if the submission needs further review by other editors
                    </p>
                </div>*/}
                
                {formData.requires_review && (
                    <div className={`form-group ${formErrors.review_deadline ? 'error' : ''}`}>
                        <label className="form-label required">
                            Review Deadline
                        </label>
                        <div className="date-input-container">
                            <input
                                type="date"
                                name="review_deadline"
                                value={formData.review_deadline}
                                onChange={handleChange}
                                className="form-input"
                                min={new Date().toISOString().split('T')[0]}
                                required={formData.requires_review}
                            />
                            <span className="date-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </span>
                        </div>
                        {formErrors.review_deadline && (
                            <span className="error-text">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {formErrors.review_deadline}
                            </span>
                        )}
                    </div>
                )}
                
                <div className="form-actions">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Submit Decision
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChiefEditorRecommendation;