import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Table, Badge, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaUniversity, FaUserTie, FaSearch, FaUser, FaUserPlus } from 'react-icons/fa';

const AssignAreaEditor = () => {
    const [areaEditors, setAreaEditors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { journalId } = useParams();
    const [article, setArticle] = useState({});
    const [selfAssignmentError, setSelfAssignmentError] = useState(null);

    useEffect(() => {
        const fetchAreaEditors = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/area-editor/get-approved-area-editors/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch area editors');
                }
                const data = await response.json();
                setAreaEditors(data);
            } catch (error) {
                console.error('Error fetching area editors:', error);
                setError('Failed to load area editors');
            }
        };

        const fetchArticleDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/detail/${journalId}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch article details');
                }

                const data = await response.json();
                setArticle(data);
            } catch (err) {
                setError('Failed to load article details');
            }
        };

        fetchAreaEditors();
        fetchArticleDetails();
    }, [journalId]);

    // Get unique departments for filter dropdown
    const departments = Array.from(new Set(
        areaEditors
            .map(editor => editor.department)
            .filter(dept => dept !== null && dept !== undefined && dept !== '')
    ));

    // Filter editors based on search term and department
    const filteredEditors = areaEditors.filter(editor => {
        const matchesSearch = 
            editor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            editor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            editor.institution?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = 
            !departmentFilter || 
            (editor.department && editor.department.toLowerCase().includes(departmentFilter.toLowerCase()));
        
        return matchesSearch && matchesDepartment;
    });
    
    const setJournalStatusToAssignedToAreaEditor = async (journalId) => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/mark-assigned-to-area-editor/${journalId}/`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    const handleAssign = async (areaEditorId) => {
        if (!journalId) {
            setError("No journal ID found in URL params");
            return;
        }

        // Check if the area editor is the same as the article author
        const editorToAssign = areaEditors.find(editor => editor.id === areaEditorId);
        if (editorToAssign && article && editorToAssign.user_id === article.user_id) {
            setSelfAssignmentError("You cannot assign an area editor to their own article.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setSelfAssignmentError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/area-editor/assign/${journalId}/${areaEditorId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                if (data.detail) {
                    throw new Error(data.detail);
                } else if (data.message) {
                    throw new Error(data.message);
                } else if (response.status === 400) {
                    throw new Error('This area editor is already assigned to this journal');
                } else {
                    throw new Error('Failed to assign area editor');
                }
            }
            
            setSuccess(data.message || 'Area editor assigned to journal successfully');
            await setJournalStatusToAssignedToAreaEditor(journalId);
        } catch (err) {
            setError(err.message || 'An error occurred while assigning the area editor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-3">
            <h4 className="mb-4">Assign Area Editors to Journal #{journalId}</h4>
            
            {/* Display success/error messages */}
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                    {success}
                </Alert>
            )}
            {selfAssignmentError && (
                <Alert variant="warning" onClose={() => setSelfAssignmentError(null)} dismissible>
                    {selfAssignmentError}
                </Alert>
            )}
            
            {/* Search and Filter Controls */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search by name, email or institution..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </div>
                <div className="col-md-6">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaUniversity />
                            </InputGroup.Text>
                            <Form.Select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>{dept}</option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </div>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Institution</th>
                        <th>Position</th>
                        <th>Department</th>
                        <th>Assignments Handled</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEditors.length > 0 ? (
                        filteredEditors.map((editor) => (
                            <tr key={editor.id}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        {editor.profile_picture ? (
                                            <img 
                                                src={`${import.meta.env.VITE_BACKEND_DJANGO_URL}/${editor.profile_picture}`} 
                                                alt={editor.full_name}
                                                className="rounded-circle me-2"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                                                style={{ width: '40px', height: '40px' }}>
                                                <span className="text-white">
                                                    {editor.full_name?.charAt(0).toUpperCase() || 'A'}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <strong>{editor.full_name}</strong>
                                            <div className="text-muted small">
                                                {editor.country}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <div className="mb-1">
                                            <FaEnvelope className="me-2 text-primary" />
                                            <a href={`mailto:${editor.email}`}>{editor.email}</a>
                                        </div>
                                        {editor.phone_number && (
                                            <div>
                                                <FaPhone className="me-2 text-success" />
                                                {editor.phone_number}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <FaUniversity className="me-2 text-info" />
                                        <div>
                                            <div>{editor.institution}</div>
                                            {editor.research_interests && (
                                                <small className="text-muted">{editor.research_interests}</small>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <FaUserTie className="me-2 text-warning" />
                                        <div>
                                            {editor.position_title || 'Not specified'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {editor.department ? (
                                        <Badge bg="primary" className="text-wrap">
                                            <FaUniversity className="me-1" />
                                            {editor.department}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted">Not specified</span>
                                    )}
                                </td>
                                <td>
                                    <Badge bg="info">
                                        {editor.number_of_assignments_handled || 0}
                                    </Badge>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Link 
                                            to={`/area-editor/${editor.id}`} 
                                            className="btn btn-sm btn-info"
                                            title="View Profile"
                                        >
                                            <FaUser className="me-1" />
                                            View
                                        </Link>
                                        <Button 
                                            variant="success" 
                                            size="sm"
                                            onClick={() => handleAssign(editor.id)}
                                            title="Assign Area Editor"
                                            disabled={loading || (article && editor.user_id === article.user_id)}
                                        >
                                            {loading ? (
                                                <span>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Assigning...
                                                </span>
                                            ) : (
                                                <span>
                                                    <FaUserPlus className="me-1" />
                                                    Assign
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No area editors found matching your criteria
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default AssignAreaEditor;