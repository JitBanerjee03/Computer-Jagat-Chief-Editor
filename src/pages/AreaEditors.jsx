import React, { useState, useEffect, useContext } from 'react';
import { Table, Badge, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaUniversity, 
  FaUserTie, 
  FaBook, 
  FaSearch, 
  FaEye,
  FaCheck, 
  FaTimes,
  FaFilePdf,
  FaLinkedin,
  FaGraduationCap
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { contextProviderDeclare } from '../store/ContextProvider';
import NotApprovedEmptyMessage from '../components/NotApprovedemptyMessage';

const AreaEditors = () => {
    const { areaEditors, fetchAllAreaEditors, subjectAreasList, isApproved, chiefEditor } = useContext(contextProviderDeclare);
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectAreaFilter, setSubjectAreaFilter] = useState('');
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selfApprovalError, setSelfApprovalError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAllAreaEditors();
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load area editors');
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Get subject area name by ID
    const getSubjectAreaName = (id) => {
        const area = subjectAreasList?.find(a => a.id === id);
        return area?.name || `Area ${id}`;
    };

    // Filter area editors based on search term and subject area
    const filteredEditors = areaEditors.filter(editor => {
        const matchesSearch = 
            editor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            editor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            editor.institution?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSubjectArea = 
            !subjectAreaFilter || 
            editor.subject_areas?.includes(parseInt(subjectAreaFilter));
        
        return matchesSearch && matchesSubjectArea;
    });

    const handleApprove = async (editorId, approve) => {
        // Check if the editor being approved/rejected is the chief editor themselves
        const editorToApprove = areaEditors.find(editor => editor.id === editorId);
        
        if (editorToApprove && chiefEditor && editorToApprove.user_id === chiefEditor.user_id) {
            setSelfApprovalError("You cannot approve or reject yourself as an area editor.");
            return;
        }

        setLoading(prev => ({ ...prev, [editorId]: true }));
        setError(null);
        setSuccess(null);
        setSelfApprovalError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/area-editor/approve-area-editor/${editorId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_approved: approve
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update editor status');
            }

            // Refresh the data
            await fetchAllAreaEditors();
            setSuccess(`Area editor ${approve ? 'approved' : 'rejected'} successfully`);
        } catch (err) {
            setError(err.message || 'An error occurred while updating editor status');
        } finally {
            setLoading(prev => ({ ...prev, [editorId]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <> 
            {isApproved === false ? <NotApprovedEmptyMessage/> :
                <div className="container-fluid p-3">
                    <h4 className="mb-4">Area Editors Management</h4>
                    
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
                    {selfApprovalError && (
                        <Alert variant="warning" onClose={() => setSelfApprovalError(null)} dismissible>
                            {selfApprovalError}
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
                                        <FaBook />
                                    </InputGroup.Text>
                                    <Form.Select
                                        value={subjectAreaFilter}
                                        onChange={(e) => setSubjectAreaFilter(e.target.value)}
                                    >
                                        <option value="">All Subject Areas</option>
                                        {subjectAreasList?.map(area => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
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
                                <th>Subject Areas</th>
                                <th>Resources</th>
                                <th>Status</th>
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
                                                        src={editor.profile_picture} 
                                                        alt={editor.full_name}
                                                        className="rounded-circle me-2"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                                                        style={{ width: '40px', height: '40px' }}>
                                                        <span className="text-white">
                                                            {editor.full_name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <strong>{editor.full_name || 'Unknown'}</strong>
                                                    {editor.country && (
                                                        <div className="text-muted small">{editor.country}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <div className="mb-1">
                                                    <FaEnvelope className="me-2 text-primary" />
                                                    <a href={`mailto:${editor.email}`}>{editor.email || 'No email'}</a>
                                                </div>
                                                {editor.linkedin_profile && (
                                                    <div className="mb-1">
                                                        <FaLinkedin className="me-2 text-info" />
                                                        <a href={editor.linkedin_profile} target="_blank" rel="noopener noreferrer">
                                                            LinkedIn
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaUniversity className="me-2 text-info" />
                                                <div>
                                                    <div>{editor.institution || 'Unknown institution'}</div>
                                                    {editor.department && (
                                                        <small className="text-muted">{editor.department}</small>
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
                                            <div className="d-flex flex-wrap gap-1">
                                                {editor.subject_areas?.length > 0 ? (
                                                    editor.subject_areas.map((areaId) => {
                                                        const areaName = getSubjectAreaName(areaId);
                                                        return (
                                                            <Badge key={areaId} bg="primary" className="text-wrap">
                                                                <FaBook className="me-1" />
                                                                {areaName}
                                                            </Badge>
                                                        );
                                                    })
                                                ) : (
                                                    <Badge bg="secondary">No subject areas</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                {editor.cv && (
                                                    <a href={editor.cv} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-dark">
                                                        <FaFilePdf className="me-1" />
                                                        CV
                                                    </a>
                                                )}
                                                {editor.google_scholar_profile && (
                                                    <a href={editor.google_scholar_profile} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                                        <FaGraduationCap className="me-1" />
                                                        Scholar
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg={editor.is_approved ? "success" : "warning"} className="text-dark">
                                                {editor.is_approved ? "Approved" : "Pending Approval"}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Link 
                                                    to={`/area-editor/${editor.id}`}
                                                    className="btn btn-sm btn-info"
                                                    title="View Full Profile"
                                                >
                                                    <FaEye className="me-1" />
                                                    View
                                                </Link>
                                                {!editor.is_approved && (
                                                    <>
                                                        <Button 
                                                            variant="success" 
                                                            size="sm"
                                                            onClick={() => handleApprove(editor.id, true)}
                                                            title="Approve Editor"
                                                            disabled={loading[editor.id] || (chiefEditor && editor.user_id === chiefEditor.user_id)}
                                                        >
                                                            {loading[editor.id] ? (
                                                                <>
                                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                                    <span className="ms-1">Processing...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaCheck className="me-1" />
                                                                    Approve
                                                                </>
                                                            )}
                                                        </Button>
                                                        {/*<Button 
                                                            variant="danger" 
                                                            size="sm"
                                                            onClick={() => handleApprove(editor.id, false)}
                                                            title="Reject Editor"
                                                            disabled={loading[editor.id] || (chiefEditor && editor.user_id === chiefEditor.user_id)}
                                                        >
                                                            <FaTimes className="me-1" />
                                                            Reject
                                                        </Button>*/}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        {areaEditors.length === 0 
                                            ? "No area editors found in the system" 
                                            : "No editors match your search criteria"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            }
        </>
    );
};

export default AreaEditors;